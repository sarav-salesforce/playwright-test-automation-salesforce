const { When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { ContactPage } = require('../../pageObjects/ContactPage');

setDefaultTimeout(120 * 1000);

When(
  'User enters the {string} and {string}',
  async function (firstName, lastName) {
    this.contactPage = new ContactPage(this.page);

    // Store for later assertion
    this.firstName = firstName;
    this.lastName = lastName;

    // Salutation is hardcoded in your existing logic
    this.salutation = 'Mr.';

    await this.contactPage.firstName.waitFor({ state: 'visible', timeout: 60000 });
    await this.contactPage.salutationDropDown.waitFor({ state: 'visible' });
    await this.contactPage.salutationDropDown.click();
    const salutationOption = this.page
      .locator(`//lightning-base-combobox-item[@data-value='${this.salutation}']`)
      .first();
    await salutationOption.waitFor({ state: 'visible', timeout: 60000 });
    await salutationOption.click();

    await this.contactPage.firstName.fill(firstName);
    await this.contactPage.lastName.fill(lastName);
  }
);

When('User clicks on the new button in contact page', async function () {
  this.contactPage = new ContactPage(this.page);
  await this.contactPage.assertContactTab();
  await this.contactPage.newBtn.click();
});

When('User enters the contact account name {string}', async function (accountName) {
  await this.contactPage.accountNameLookUp.waitFor({ state: 'visible' });
  await this.contactPage.accountNameLookUp.click();
  await this.contactPage.accountNameLookUp.pressSequentially(accountName);

  const accountOption = this.page
    .locator(`//lightning-base-combobox-formatted-text[@title='${accountName}']`)
    .first();
  await accountOption.waitFor({ state: 'visible', timeout: 60000 });
  await accountOption.click();
});

When('User clicks on the Save button for contact', async function () {
  await this.contactPage.saveBtn.click();
});


Then(
  'A new contact should be created successfully',
  async function () {
    await this.contactPage.assertContactCreated(
      this.salutation,
      this.firstName,
      this.lastName
    );
  }
);