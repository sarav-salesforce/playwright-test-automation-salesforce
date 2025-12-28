const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { SetupHomePage } = require('../../pageObjects/SetupHomePage');
const { AccountPage } = require('../../pageObjects/AccountPage');

setDefaultTimeout(120 * 1000);

Given('User is on the {string} tab', async function (tab) {
  const setupHomePage = new SetupHomePage(this.page);
  await setupHomePage.chooseObjectFromAppLauncher(tab);
});

When('User clicks on the new button in account page', async function () {
  this.accountPage = new AccountPage(this.page);
  await this.accountPage.assertAccountTab();
  await this.accountPage.clickNewButton();
});

When('User enters the account name {string}', async function (accountName) {
  await this.accountPage.enterAccountName(accountName);
});

When('User selects the account number {string}', async function (accountNumber) {
  await this.accountPage.enterAccountNumber(accountNumber);
});

When('User selects the rating {string}', async function (rating) {
  await this.accountPage.selectRating(rating);
});

When('User clicks on the Save button for account', async function () {
  await this.accountPage.clickSaveButton();
});


Then(
  'A new account named {string} should be created successfully',
  async function (accountName) {
    await this.accountPage.assertAccountCreated(accountName);
  }
);