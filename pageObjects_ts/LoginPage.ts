import { type Locator, type Page, expect } from '@playwright/test';

export class LoginPage {

    page: Page;
    username: Locator;
    password: Locator;
    loginBtn: Locator;
    WelcomeBanner: Locator;

    constructor(page: Page) {
        this.page = page;
        this.username = page.locator('#username');
        this.password = page.locator('#password');
        this.loginBtn = page.locator('#Login');
        this.WelcomeBanner = page.locator("//h1[contains(@class,'welcome-title')]");
    }

    async loginToSalesforce(username: string, password: string) {
        await this.page.goto("https://login.salesforce.com");
        await this.username.fill(username);
        await this.password.fill(password);
        await this.loginBtn.click();
        await this.page.waitForURL("**/lightning/**", { timeout: 60000 });
    }

    async assertLoginSuccess() {
        await this.WelcomeBanner.waitFor();
        await expect(this.WelcomeBanner).toBeVisible();
    }

    getEnv(name: string): string {
        const value = process.env[name];
        if (!value) {
            throw new Error(`Environment variable ${name} is not set`);
        }
        return value;
    }

}

module.exports = { LoginPage };