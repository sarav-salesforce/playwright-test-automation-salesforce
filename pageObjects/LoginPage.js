const {expect} = require("@playwright/test");

class LoginPage {

    constructor(page) {
        this.page = page;
        this.username = page.locator('#username');
        this.password = page.locator('#password');
        this.loginBtn = page.locator('#Login');
        this.WelcomeBanner = page.locator("//h1[contains(@class,'welcome-title')]");
    }

    async loginToSalesforce(username, password) {
        await this.page.goto("https://login.salesforce.com");
        await this.username.fill(username);
        await this.password.fill(password);
        await this.loginBtn.click();
        await this.page.waitForURL("**/lightning/**", {timeout : 60000});
    }

    async assertLoginSuccess() {
        await this.WelcomeBanner.waitFor();
        await expect(this.WelcomeBanner).toBeVisible();
    }

}

module.exports = { LoginPage };