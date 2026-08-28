import {test, chromium} from "@playwright/test";

const fs = require('fs');
const path = require('path');
import { LoginPage } from "../pageObjects_ts/LoginPage";
import { SetupHomePage } from "../pageObjects_ts/SetupHomePage";
import { AccountPage } from "../pageObjects_ts/AccountPage";

import { readTestData } from "../utils_ts/readExcelForTest";

//test.describe.configure({mode:'parallel'});

test("Account creation in SFDC using POM", async() => {

  const userDataDirectory = path.resolve(__dirname, '../sf-profile');

  const context = await chromium.launchPersistentContext(userDataDirectory, {
    headless: false,
    args: ['--start-maximized'],
  });

  const page = await context.newPage();

  const loginPage = new LoginPage(page);

  // JWT bearer login (no username/password screen) — credentials come from SF_* env vars.
  await loginPage.loginToSalesforce();

  await loginPage.assertLoginSuccess();


  const setupHomePage = new SetupHomePage(page);

  await setupHomePage.chooseObjectFromAppLauncher("Accounts");

  const accountPage = new AccountPage(page);

  await accountPage.assertAccountTab();

  const accName = "Playwright POM Account";
  await accountPage.createNewAccount(accName, "1234567", "Warm");
  await accountPage.assertAccountCreated(accName);
  await context.close();

});


test("@Smoke Account Creation", async() => {

  const excelPath = path.join(__dirname, '../data/TestData.xlsx');

  const testData = await readTestData(excelPath, 'Sheet1', 'Account Creation')

  console.log(testData);

  const userDataDirectory = path.resolve(__dirname, '../sf-profile');

  const context = await chromium.launchPersistentContext(userDataDirectory, {
    headless: false,
    args: ['--start-maximized'],
  });

  const page = await context.newPage();

  const loginPage = new LoginPage(page);

  // JWT bearer login (no username/password screen) — credentials come from SF_* env vars.
  await loginPage.loginToSalesforce();
  await loginPage.assertLoginSuccess();


  const setupHomePage = new SetupHomePage(page);



  await setupHomePage.chooseObjectFromAppLauncher(testData.TabName);

  const accountPage = new AccountPage(page);

  await accountPage.assertAccountTab();

  const accName = testData.AccountName;
  await accountPage.createNewAccount(accName, testData.AccountNumber, testData.Rating);
  await accountPage.assertAccountCreated(accName);
  await context.close();
});

