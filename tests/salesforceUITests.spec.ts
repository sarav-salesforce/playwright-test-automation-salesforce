import { test, expect } from "@playwright/test";
import { jwtAuthenticate, jwtLogin, loginWithJwt } from "./helpers/salesforceAuth";

// ---------------------------------------------------------------------------
// JWT login coverage
// ---------------------------------------------------------------------------

test("Salesforce JWT Frontdoor login", async ({ page }) => {
  // Equivalent to Copado/QForce: JWTAuthenticate, followed by JWTLogin.
  const session = await jwtAuthenticate();
  await jwtLogin(page, session, "/lightning/page/home");
  await expect(page).toHaveURL(/\/lightning\//);
});

// Standalone: log in to the Salesforce UI with the JWT bearer flow instead of
// typing a username/password on the Salesforce login screen. Nothing outside
// this test is needed - it authenticates headlessly, swaps the API session for
// a browser session via frontdoor.jsp, and lands directly in Lightning.
test("Login to Salesforce UI via JWT flow (no username/password screen)", async ({ page }) => {
  test.setTimeout(90_000);

  const session = await jwtAuthenticate();
  expect(session.accessToken, "JWT bearer exchange returned an access token").toBeTruthy();

  await jwtLogin(page, session, "/lightning/page/home");

  // We are inside Lightning Experience and were never shown the login form.
  await expect(page).toHaveURL(/\/lightning\//);
  await expect(page).not.toHaveURL(/\/login/);
  await expect(page.locator("#oneHeader")).toBeVisible();
});

// ---------------------------------------------------------------------------
// Feature tests
//
// Every test logs in through the JWT flow, never the username/password screen.
// Use `loginWithJwt(page, <relative lightning path>)` as the first step - it
// runs the JWT bearer exchange and drops the browser straight onto that page.
// ---------------------------------------------------------------------------

test("Accounts list view loads", async ({ page }) => {
  test.setTimeout(90_000);

  await loginWithJwt(page, "/lightning/o/Account/list?filterName=__Recent");

  await expect(page).toHaveURL(/\/lightning\/o\/Account\/list/);
  await expect(page.locator("#oneHeader")).toBeVisible();
  await expect(page.getByRole("button", { name: "New" }).first()).toBeVisible();
});

test("Setup home opens", async ({ page }) => {
  test.setTimeout(90_000);

  await loginWithJwt(page, "/lightning/setup/SetupOneHome/home");

  await expect(page).toHaveURL(/\/lightning\/setup\/SetupOneHome\//);
  await expect(page.locator("#oneHeader")).toBeVisible();
});
