class SetupHomePage {

    constructor(page) {
        this.page = page;
        this.appLauncher = page.locator("//div[contains(@class,'appLauncher')]");
        this.searchObjectInput = page.locator("[placeholder='Search apps and items...']");
    }


    async chooseObjectFromAppLauncher(objectName) {
        await this.appLauncher.click();
        await this.searchObjectInput.fill(objectName);
        const searchResultLink = this.page.locator("[data-label='"+objectName+"']")
        await searchResultLink.click();
    }

}

module.exports = { SetupHomePage };
