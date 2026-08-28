const { createJwtAssertion } = require("../tests/helpers/salesforceAuth");

// CLI check for the Salesforce JWT bearer flow: `npm run auth:jwt:js`.
// Prints the JWT header/claims and the token-endpoint response so a failed
// exchange (e.g. `invalid_grant` / `invalid assertion`) is easy to diagnose.

function maskToken(token) {
  if (!token || token.length < 16) return "<redacted>";
  return `${token.slice(0, 8)}...${token.slice(-6)}`;
}

async function main() {
  try {
    const { assertion, loginUrl } = createJwtAssertion();
    const tokenEndpoint = `${loginUrl}/services/oauth2/token`;
    const [rawHeader, rawClaims] = assertion.split(".");
    const header = JSON.parse(Buffer.from(rawHeader, "base64url").toString("utf8"));
    const claims = JSON.parse(Buffer.from(rawClaims, "base64url").toString("utf8"));

    console.log(`Token endpoint: ${tokenEndpoint}`);
    console.log(`JWT header: ${JSON.stringify(header)}`);
    console.log(`JWT claims: ${JSON.stringify({ ...claims, iss: maskToken(claims.iss) })}`);

    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      signal: AbortSignal.timeout(10_000),
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(result)}`);
    }

    console.log("Salesforce JWT authentication succeeded.");
    console.log(`Audience: ${loginUrl}`);
    console.log(`Instance: ${new URL(result.instance_url).hostname}`);
    console.log(`Access token: ${maskToken(result.access_token)}`);
  } catch (error) {
    console.error(`Salesforce JWT authentication failed: ${error.message}`);
    process.exitCode = 1;
  }
}

main();
