const {After, Before, AfterStep, Status, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test');
const path = require('path');
const { LoginPage } = require('../../pageObjects/LoginPage');

setDefaultTimeout(120 * 1000); // 2 minutes

Before(async function () {
  const userDataDirectory = path.resolve(__dirname, '../../sf-profile');

  // Persistent context → bypass Salesforce computer activation
  this.context = await chromium.launchPersistentContext(userDataDirectory, {
    headless: false,
    args: ['--start-maximized'],
  });

  this.page = await this.context.newPage();

  const loginPage = new LoginPage(this.page);

  await loginPage.loginToSalesforce(
    process.env.sit_salesforce_username,
    process.env.sit_salesforce_password
  );

  await loginPage.assertLoginSuccess();
});

After(async function () {
  if (this.context) {
    await this.context.close();
  }
});


AfterStep( function ({result}) {
  // This hook will be executed after all steps, and take a screenshot on step failure
  if (result.status === Status.FAILED) {
    return this.page.screenshot({ path: `screenshot-failed-step-${Date.now()}.png` });
  }
});