const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

try {
  process.loadEnvFile();
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

function getEnv(...names) {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value.trim();
  }
  return undefined;
}

function requireEnv(...names) {
  const value = getEnv(...names);
  if (!value) {
    throw new Error(`Missing environment variable: ${names.join(" or ")}`);
  }
  return value;
}

function trimTrailingSlash(url) {
  return url.replace(/\/$/, "");
}

function getSalesforceHomeUrl() {
  const configuredHomeUrl = getEnv(
    "SF_HOME_URL",
    "SF_MY_DOMAIN_URL",
    "salesforce_home_url",
    "salesforce_my_domain_url",
  );
  if (configuredHomeUrl) return trimTrailingSlash(configuredHomeUrl);

  const uiUrl = getEnv("SF_UI_URL");
  if (uiUrl) {
    return trimTrailingSlash(uiUrl).replace(
      /(?:\.develop)?\.lightning\.force\.com$/,
      ".my.salesforce.com",
    );
  }

  throw new Error("Missing Salesforce org URL: set SF_HOME_URL to your My Domain URL");
}

function createJwtAssertion(options = {}) {
  const consumerKey = options.clientId ?? requireEnv("SF_CONSUMER_KEY", "consumer_key");
  const username = options.username ?? requireEnv("SF_USERNAME", "salesforce_username");
  const sandbox = options.sandbox ?? getEnv("SF_SANDBOX")?.toLowerCase() === "true";
  const loginUrl = trimTrailingSlash(
    options.customUrl ||
      getEnv("SF_LOGIN_URL", "salesforce_login_url") ||
      (sandbox ? "https://test.salesforce.com" : "https://login.salesforce.com"),
  );
  const privateKey =
    options.privateKey ??
    fs.readFileSync(
      path.resolve(
        getEnv("SF_PRIVATE_KEY_PATH", "salesforce_private_key_path") || "server.key",
      ),
      "utf8",
    );

  const now = Math.floor(Date.now() / 1000);
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const unsignedJwt = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({
    iss: consumerKey,
    sub: username,
    aud: loginUrl,
    exp: now + 180,
  })}`;
  const signature = crypto.sign("RSA-SHA256", Buffer.from(unsignedJwt), privateKey);

  return {
    assertion: `${unsignedJwt}.${signature.toString("base64url")}`,
    loginUrl,
  };
}

// QForce JWTAuthenticate equivalent: create and retain the REST API session.
async function jwtAuthenticate(options = {}) {
  const { assertion, loginUrl } = createJwtAssertion(options);
  const response = await fetch(`${loginUrl}/services/oauth2/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    signal: AbortSignal.timeout(options.timeout ?? 10_000),
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const result = await response.json();

  if (!response.ok) {
    const diagnosticUrl = result.error_uri ? ` (${result.error_uri})` : "";
    throw new Error(
      `Salesforce JWT exchange failed: ${result.error_description || result.error}${diagnosticUrl}`,
    );
  }

  const session = {
    accessToken: result.access_token,
    identityUrl: result.id,
    instanceUrl: result.instance_url,
  };
  await verifyAuthenticatedUser(session);
  return session;
}

async function verifyAuthenticatedUser({ accessToken, identityUrl }) {
  if (!identityUrl) {
    throw new Error("Salesforce JWT response did not include an identity URL");
  }

  const response = await fetch(identityUrl, {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  const identity = await response.json();

  if (!response.ok) {
    throw new Error(
      `Salesforce identity verification failed: ${identity.error_description || identity.error || response.statusText}`,
    );
  }

  const expectedUsername = requireEnv("SF_USERNAME", "salesforce_username");
  if (identity.username !== expectedUsername) {
    throw new Error(
      `JWT authenticated the wrong Salesforce user: expected ${expectedUsername}, got ${identity.username}`,
    );
  }
}

function createFrontdoorUrl(session, redirectPath = "/lightning/page/home") {
  if (!session?.accessToken) {
    throw new Error("JWTLogin requires the session returned by JWTAuthenticate");
  }
  const destination = redirectPath.startsWith("/") ? redirectPath : `/${redirectPath}`;
  return (
    `${trimTrailingSlash(session.instanceUrl)}/secur/frontdoor.jsp` +
    `?sid=${encodeURIComponent(session.accessToken)}` +
    `&retURL=${encodeURIComponent(destination)}`
  );
}

// QForce JWTLogin equivalent: turn the retained API session into a browser session.
async function jwtLogin(page, session, redirectPath = "/lightning/page/home") {
  const frontdoorUrl = createFrontdoorUrl(session, redirectPath);
  await page.goto(frontdoorUrl);
  await page.waitForURL(/\/lightning\//, { timeout: 60_000 });

  if (page.url().includes("/login")) {
    throw new Error("Salesforce JWT frontdoor login redirected to the login page");
  }
}

async function loginWithJwt(page, redirectPath = "/lightning/page/home") {
  const session = await jwtAuthenticate();
  await jwtLogin(page, session, redirectPath);
}

module.exports = {
  createFrontdoorUrl,
  createJwtAssertion,
  getSalesforceHomeUrl,
  jwtAuthenticate,
  jwtLogin,
  loginWithJwt,
};
