import { type Locator, type Page, expect } from '@playwright/test';

export class ContactPage {

    page: Page;
    newBtn: Locator;
    salutationDropDown: Locator;
    firstName: Locator;
    lastName: Locator;
    accountNameLookUp: Locator;
    saveBtn: Locator;  

    constructor(page:Page) {
        this.page = page;
        this.newBtn = page.locator("//a[@title='New']");
        this.salutationDropDown = page.locator("[name='salutation']");
        this.firstName = page.locator("[name='firstName']");
        this.lastName = page.locator("[name='lastName']");
        this.accountNameLookUp = page.locator("[placeholder='Search Accounts...']");
        this.saveBtn = page.locator("[name='SaveEdit']");
    }

    async assertContactTab() {
        await this.page.waitForURL("**/Contact/**", {timeout : 60000});
    }

    async createNewContact(salutation:string, firstName:string, lastName:string, accountName:string) {
        await this.newBtn.waitFor();
        await this.newBtn.click();
        await this.salutationDropDown.waitFor();
        await this.salutationDropDown.click();
        const salutationValue = this.page.locator("//lightning-base-combobox-item[@data-value='"+salutation+"']");
        await salutationValue.waitFor();
        await salutationValue.click();
        await this.firstName.fill(firstName);
        await this.lastName.fill(lastName);
        await this.accountNameLookUp.click();
        await this.accountNameLookUp.pressSequentially(accountName);
        const accountOption = this.page.locator("//lightning-base-combobox-formatted-text[@title='"+accountName+"']");
        await accountOption.waitFor();
        await accountOption.click();
        await this.saveBtn.click();
    }

    async assertContactCreated(salutation:string, firstName:string, lastName:string) {
        const contactNameElement = this.page.locator("//lightning-formatted-name[text()='"+salutation+" "+firstName+" "+lastName+"']");
        await contactNameElement.waitFor();
        await expect(contactNameElement).toBeVisible();
    }

}
module.exports = { ContactPage };