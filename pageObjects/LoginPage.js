const { expect } = require("@playwright/test");
const { loginWithJwt } = require("../tests/helpers/salesforceAuth");

class LoginPage {

    constructor(page) {
        this.page = page;
        // Lightning app shell — present once any authenticated page has loaded.
        this.appHeader = page.locator("#oneHeader");
    }

    /**
     * Log in to the Salesforce UI with the JWT bearer flow (no username/password
     * screen). The `username`/`password` parameters are accepted for backwards
     * compatibility with older call sites and are ignored — credentials come from
     * the JWT env vars (SF_CONSUMER_KEY / SF_USERNAME / SF_PRIVATE_KEY_PATH).
     */
    async loginToSalesforce(username, password, redirectPath = "/lightning/page/home") {
        await loginWithJwt(this.page, redirectPath);
    }

    async assertLoginSuccess() {
        await expect(this.page).toHaveURL(/\/lightning\//);
        await expect(this.appHeader).toBeVisible();
    }

}

module.exports = { LoginPage };
