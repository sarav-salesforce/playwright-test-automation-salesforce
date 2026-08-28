# Salesforce Test Automation — Playwright

End-to-end UI and API test automation for Salesforce, built on
[Playwright Test](https://playwright.dev/). All UI tests authenticate with the
**JWT bearer flow** — no username/password is ever typed on the Salesforce login
screen.

- **UI specs** — `tests/*.spec.js` / `tests/*.spec.ts`
- **API specs** — `tests/salesforceAPI.spec.js`, `tests/apiUI.spec.js`
- **BDD suite** — Cucumber features in `features/` with Page Objects in
  `pageObjects/` (JS) and `pageObjects_ts/` (TS)
- **Reporting** — Playwright HTML report + Allure

---

## Prerequisites

| Requirement | Notes |
|---|---|
| Node.js 20.12+ or 22+ | `process.loadEnvFile()` is used to read `.env` |
| A Salesforce org | Sandbox or Developer Edition |
| A Connected App / External Client App | Configured for the JWT bearer flow (see below) |
| An RSA key pair | Private key stays local; the certificate is uploaded to the Connected App |

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Install Playwright browsers
npx playwright install --with-deps

# 3. Create your local env file
cp .env.example .env
#   then fill in the values (see "Configuration" below)

# 4. Put your private key where the tests expect it
#   (default path: cert/server.key — git-ignored)
mkdir -p cert
cp /path/to/your/server.key cert/server.key
```

## Configuration

`.env` is loaded automatically. Copy `.env.example` and fill it in:

| Variable | Required | Purpose |
|---|---|---|
| `SF_CONSUMER_KEY` | ✅ | Connected App **Consumer Key** — the JWT issuer (`iss`) |
| `SF_USERNAME` | ✅ | Salesforce username the JWT impersonates (`sub`) |
| `SF_PRIVATE_KEY_PATH` | – | Path to the PEM private key. Default: `cert/server.key` |
| `SF_LOGIN_URL` | – | Token audience. Default: `https://login.salesforce.com` |
| `SF_SANDBOX` | – | `true` → audience becomes `https://test.salesforce.com` (ignored if `SF_LOGIN_URL` is set) |
| `SF_HOME_URL` | – | Your My Domain URL, used by `getSalesforceHomeUrl()` |

> **Nothing secret is committed.** `.env`, `cert/`, and every `*.key` / `*.crt`
> / `*.pem` / `*.p12` file are git-ignored.

---

## JWT Authentication

### How it works

The helper lives in [`tests/helpers/salesforceAuth.js`](tests/helpers/salesforceAuth.js)
and mirrors the Copado / QForce `JWTAuthenticate` → `JWTLogin` pattern:

1. **`createJwtAssertion()`** — builds and RS256-signs a JWT
   (`iss` = consumer key, `sub` = username, `aud` = login URL, `exp` = now + 3 min)
   with your local private key.
2. **`jwtAuthenticate()`** — POSTs that assertion to
   `/services/oauth2/token` with
   `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer`, then verifies the
   returned identity actually matches `SF_USERNAME`. Returns a session:
   `{ accessToken, identityUrl, instanceUrl }`.
3. **`jwtLogin(page, session, redirectPath)`** — exchanges the API session for a
   browser session by navigating to
   `…/secur/frontdoor.jsp?sid=<accessToken>&retURL=<redirectPath>`, landing the
   browser directly inside Lightning Experience.
4. **`loginWithJwt(page, redirectPath)`** — convenience wrapper that runs steps
   2 and 3 together.

Because the token exchange is headless and `frontdoor.jsp` establishes the
browser session, tests never see the login form and there is no MFA / device
activation prompt.

### One-time Salesforce setup

1. **Generate a key pair** (self-signed cert is fine for the JWT flow):

   ```bash
   openssl req -x509 -sha256 -nodes -days 3650 -newkey rsa:2048 \
     -keyout cert/server.key -out cert/server.crt \
     -subj "/CN=playwright-jwt"
   ```

2. **Create a Connected App** (Setup → App Manager → New Connected App) or an
   External Client App:
   - Enable **OAuth Settings**
   - Callback URL: `http://localhost` (unused, but required)
   - Check **Use digital signatures** and upload `cert/server.crt`
   - OAuth scopes: at least **Manage user data via APIs (`api`)** and
     **Perform requests at any time (`refresh_token`)**
   - Save, then copy the **Consumer Key** into `SF_CONSUMER_KEY`

3. **Pre-authorize the user**: Connected App → Manage → Edit Policies →
   *Permitted Users* = **Admin approved users are pre-authorized**, then assign
   the profile / permission set of `SF_USERNAME`.

### Verify it works

```bash
npm run auth:jwt:js
```

Prints the JWT header/claims and the token-endpoint response. On success:

```
Salesforce JWT authentication succeeded.
Audience: https://login.salesforce.com
Instance: your-org.my.salesforce.com
Access token: 00Daj000...xxxxxx
```

Common failures: `invalid_grant` / `user hasn't approved this consumer`
(pre-authorization missing), `invalid_assertion` (wrong key or consumer key).

---

## Using JWT auth in your tests

Import from `tests/helpers/salesforceAuth` (adjust the relative path for your
spec's location).

### 1. Plain spec — one call, land where you need to be

`loginWithJwt(page, <relative lightning path>)` is the first line of the test.
The `page` fixture is used as-is; no persistent context or storage state needed.

```js
const { test, expect } = require("@playwright/test");
const { loginWithJwt } = require("./helpers/salesforceAuth");

test("Accounts list view loads", async ({ page }) => {
  test.setTimeout(90_000);

  await loginWithJwt(page, "/lightning/o/Account/list?filterName=__Recent");

  await expect(page).toHaveURL(/\/lightning\/o\/Account\/list/);
  await expect(page.getByRole("button", { name: "New" }).first()).toBeVisible();
});
```

### 2. Split the steps — reuse the API session

Useful when a test needs both the REST session and the browser session, or wants
to assert on the raw token exchange.

```js
const { test, expect } = require("@playwright/test");
const { jwtAuthenticate, jwtLogin } = require("./helpers/salesforceAuth");

test("JWT frontdoor login", async ({ page }) => {
  const session = await jwtAuthenticate();          // { accessToken, instanceUrl, identityUrl }
  expect(session.accessToken).toBeTruthy();

  await jwtLogin(page, session, "/lightning/page/home");
  await expect(page).toHaveURL(/\/lightning\//);

  // `session.accessToken` can also drive direct REST calls via `request`
});
```

### 3. TypeScript spec

```ts
import { test, expect } from "@playwright/test";
const { loginWithJwt } = require("../tests/helpers/salesforceAuth");

test("Setup home opens", async ({ page }) => {
  await loginWithJwt(page, "/lightning/setup/SetupOneHome/home");
  await expect(page).toHaveURL(/\/lightning\/setup\//);
});
```

### 4. Page Object Model

`LoginPage.loginToSalesforce()` runs the JWT flow. The old
`(username, password)` parameters are still accepted for backwards compatibility
but are ignored — credentials come from the env vars.

```js
const { LoginPage } = require("../pageObjects/LoginPage");

const loginPage = new LoginPage(page);
await loginPage.loginToSalesforce();               // JWT flow
await loginPage.assertLoginSuccess();              // asserts the Lightning shell loaded
```

### 5. Cucumber `Before` hook

Already wired in [`features/hooks/hooks.js`](features/hooks/hooks.js):

```js
Before(async function () {
  this.context = await chromium.launchPersistentContext(userDataDirectory, { headless: false });
  this.page = await this.context.newPage();

  const loginPage = new LoginPage(this.page);
  await loginPage.loginToSalesforce();             // JWT — no username/password screen
  await loginPage.assertLoginSuccess();
});
```

### API reference

| Export | Signature | Returns |
|---|---|---|
| `loginWithJwt` | `(page, redirectPath = "/lightning/page/home")` | `Promise<void>` — authenticates + lands the browser in Lightning |
| `jwtAuthenticate` | `(options?)` | `Promise<{ accessToken, identityUrl, instanceUrl }>` |
| `jwtLogin` | `(page, session, redirectPath = "/lightning/page/home")` | `Promise<void>` |
| `createJwtAssertion` | `(options?)` | `{ assertion, loginUrl }` — signed JWT, no network call |
| `createFrontdoorUrl` | `(session, redirectPath?)` | `string` |
| `getSalesforceHomeUrl` | `()` | `string` — resolved from `SF_HOME_URL` / `SF_UI_URL` |

`options` overrides (all optional, otherwise read from env):
`{ clientId, username, sandbox, customUrl, privateKey, timeout }`.

> **Not converted:** the negative tests in `tests/salesforceUITests.spec.js` that
> submit blank credentials to assert the login form's own validation message, and
> the `grant_type=password` REST auth in `tests/salesforceAPI.spec.js` /
> `tests/apiUI.spec.js` (API auth, not a UI login).

---

## Running tests

```bash
npm test                      # all Playwright specs (tests/**)
npm run test:bdd              # Cucumber BDD suite (features/**)

npx playwright test tests/salesforceUITests.spec.js          # one file
npx playwright test tests/salesforceUITests.spec.js:61       # one test by line
npx playwright test -g "Accounts list view loads"            # one test by title
npx playwright test --headed                                 # force headed
npx playwright test --project=chromium --retries=0
```

Reports:

```bash
npx playwright show-report            # Playwright HTML report
npx allure serve allure-results       # Allure report
```

---

## Project structure

```
tests/
  helpers/salesforceAuth.js     JWT bearer auth helper (used by every UI test)
  *.spec.js / *.spec.ts         Playwright UI + API specs
scripts/
  salesforceJwtToken.js         CLI check: npm run auth:jwt:js
pageObjects/        pageObjects_ts/     Page Objects (JS / TS)
features/           *.feature, hooks/, stepDefinitions/, support/   Cucumber BDD
utils/  utils_ts/   Excel test-data readers
cert/               server.key / server.crt  (git-ignored, local only)
.env                (git-ignored, local only)   .env.example is the template
playwright.config.js   cucumber.js
```

## CI

[`.github/workflows/playwright.yml`](.github/workflows/playwright.yml) runs
`npx playwright test` on push / PR to `main`. Provide the JWT inputs as
repository secrets (`SF_CONSUMER_KEY`, `SF_USERNAME`) and materialise the private
key into `cert/server.key` in a workflow step before the test run.
