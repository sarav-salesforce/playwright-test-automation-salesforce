import {test, chromium} from "@playwright/test";
test.describe.configure({ mode: "serial" });

const fs = require('fs');
const path = require('path');
import { LoginPage } from "../pageObjects_ts/LoginPage";
import { SetupHomePage } from "../pageObjects_ts/SetupHomePage";
import { ContactPage } from "../pageObjects_ts/ContactPage";

import { readTestData } from "../utils_ts/readExcelForTest";


test("Contact creation in SFDC using POM", async () => {
  const userDataDirectory = path.resolve(__dirname, '../sf-profile');

  const context = await chromium.launchPersistentContext(userDataDirectory, {
    headless: false,
    args: ['--start-maximized'],
  });

  const page = await context.newPage();

  const loginPage = new LoginPage(page);

  await loginPage.loginToSalesforce(loginPage.getEnv("sit_salesforce_username"), loginPage.getEnv("sit_salesforce_password"));
  await loginPage.assertLoginSuccess();


  const setupHomePage = new SetupHomePage(page);

  await setupHomePage.chooseObjectFromAppLauncher("Contacts");

  const contactPage = new ContactPage(page);
  await contactPage.assertContactTab();
  const salutation = "Mr.";
  const firstName = "John";
  const lastName = "Doe";
  const accountName = "Playwright POM Account";
  await contactPage.createNewContact(salutation, firstName, lastName, accountName);
  await contactPage.assertContactCreated(salutation, firstName, lastName);
  await context.close();

});


test("Contact Creation", async () => {

  const excelPath = path.join(__dirname, '../data/TestData.xlsx');

  const testData = await readTestData(excelPath, 'Sheet1', 'Contact Creation')

  console.log(testData);

  const userDataDirectory = path.resolve(__dirname, '../sf-profile');

  const context = await chromium.launchPersistentContext(userDataDirectory, {
    headless: false,
    args: ['--start-maximized'],
  });

  const page = await context.newPage();

  const loginPage = new LoginPage(page);

  await loginPage.loginToSalesforce(loginPage.getEnv("sit_salesforce_username"), loginPage.getEnv("sit_salesforce_password"));
  await loginPage.assertLoginSuccess();


  const setupHomePage = new SetupHomePage(page);

  await setupHomePage.chooseObjectFromAppLauncher(testData.TabName);

  const contactPage = new ContactPage(page);
  await contactPage.assertContactTab();
  const salutation = testData.Salutation;
  const firstName = testData.FirstName;
  const lastName = testData.LastName;
  const accountName = testData.AccountName;
  await contactPage.createNewContact(salutation, firstName, lastName, accountName);
  await contactPage.assertContactCreated(salutation, firstName, lastName);
  await context.close();
});