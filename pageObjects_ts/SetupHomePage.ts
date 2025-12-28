import { type Locator, type Page, expect } from '@playwright/test';

export class SetupHomePage {
    page: Page;
    appLauncher: Locator;
    searchObjectInput: Locator;

    constructor(page:Page) {
        this.page = page;
        this.appLauncher = page.locator("//div[contains(@class,'appLauncher')]");
        this.searchObjectInput = page.locator("[placeholder='Search apps and items...']");
    }


    async chooseObjectFromAppLauncher(objectName:string) {
        await this.appLauncher.click();
        await this.searchObjectInput.fill(objectName);
        const searchResultLink = this.page.locator("[data-label='"+objectName+"']")
        await searchResultLink.click();
    }

}

module.exports = { SetupHomePage };
