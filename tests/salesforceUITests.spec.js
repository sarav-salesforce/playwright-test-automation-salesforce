const {test, expect, chromium} = require("@playwright/test");


test("Salesforce UI interactions", async ({page}) => {

    await page.goto("https://login.salesforce.com");

    await expect(page).toHaveTitle("Login | Salesforce");

    await page.locator('#username').fill(" ");
    await page.locator('#password').fill(" ");
    await page.locator('#Login').click();
});


test("Salesforce UI - error text extraction and assert", async ({page}) => {

    await page.goto("https://login.salesforce.com");

    await expect(page).toHaveTitle("Login | Salesforce");

    await page.locator('#username').fill(" ");
    await page.locator('#password').fill(" ");
    await page.locator('#Login').click();

    console.log(await page.locator('#error').textContent());

    await expect(page.locator('#error')).toContainText("Error: Please enter your username and password.");
});

test("Salesforce UI - mulitple element handle", async ({page}) => {

    await page.goto("https://login.salesforce.com");

    await expect(page).toHaveTitle("Login | Salesforce");

    await page.locator('#username').fill("");
    await page.locator('#password').fill("");
    await page.locator('#Login').click();

    //await page.pause();

    const elementText = page.locator(".slds-badge_lightest.slds-badge");

    await expect(elementText.nth(4).toContainText("1 In Progress"));

});

const fs = require('fs');
const path = require('path');
const { text } = require("stream/consumers");

test("Test with Same browser", async() => {

  //absolute path
  //C:\Users\sarav\salesforce-test-automation-playwright\sf-profile
  
  //Relative path
  //sf-profile

  const userDataDirectory = path.resolve(__dirname, '../sf-profile');

  const context = await chromium.launchPersistentContext(userDataDirectory, {
    headless: false,
    args: ['--start-maximized'],
  });

  const page = await context.newPage();

  await page.goto("https://login.salesforce.com");

  await expect(page).toHaveTitle("Login | Salesforce");

    await page.locator('#username').fill("");
    await page.locator('#password').fill("");
    await page.locator('#Login').click();

    //for the first manually enter the token from your email

    await page.waitForURL("**/lightning/**", {timeout : 60000});

    const elementText = page.locator('.slds-badge_lightest.slds-badge').nth(3);

    await expect(elementText).toContainText("1 In Progress");
});


test("Handle Dropdown in SFDC", async() => {

  const userDataDirectory = path.resolve(__dirname, '../sf-profile');

  const context = await chromium.launchPersistentContext(userDataDirectory, {
    headless: false,
    args: ['--start-maximized'],
  });

  const page = await context.newPage();

  await page.goto("https://login.salesforce.com");

  await expect(page).toHaveTitle("Login | Salesforce");

    await page.locator('#username').fill("");
    await page.locator('#password').fill("");
    await page.locator('#Login').click();

    //for the first manually enter the token from your email

    await page.waitForURL("**/lightning/**", {timeout : 60000});

    const elementText = page.locator('.slds-badge_lightest.slds-badge').nth(3);

    await expect(elementText).toContainText("1 In Progress");

    await page.goto("https://sf-test-automation-dev-ed.develop.lightning.force.com/lightning/o/Account/list?filterName=__Recent");

    const newButton = page.locator("[title='New']").first();

    await newButton.waitFor();

    await newButton.click();

    const dropdownField = page.locator("//button[@aria-label='Rating']");

    await dropdownField.waitFor();

    await dropdownField.click();

    const dropdownValue = page.locator("//lightning-base-combobox-item[@data-value='Hot']");

    await dropdownValue.waitFor();

    await dropdownValue.click();

});


test("Handle checkbox in SFDC", async() => {

  const userDataDirectory = path.resolve(__dirname, '../sf-profile');

  const context = await chromium.launchPersistentContext(userDataDirectory, {
    headless: false,
    args: ['--start-maximized'],
  });

  const page = await context.newPage();

  await page.goto("https://login.salesforce.com");

  await expect(page).toHaveTitle("Login | Salesforce");

    await page.locator('#username').fill("");
    await page.locator('#password').fill("");
    await page.locator('#Login').click();

    //for the first manually enter the token from your email

    await page.waitForURL("**/lightning/**", {timeout : 60000});

    const elementText = page.locator('.slds-badge_lightest.slds-badge').nth(3);

    await expect(elementText).toContainText("1 In Progress");

    await page.goto("https://sf-test-automation-dev-ed.develop.lightning.force.com/lightning/o/Case/list?filterName=__Recent");

    const newButton = page.locator("[title='New']").first();

    await newButton.waitFor();

    await newButton.click();

    const checkbox = page.locator("[class='slds-checkbox__label']");

    await checkbox.waitFor();

    await checkbox.click();   

    // const checkbox = page.locator("//input[@type='checkbox']");

    // await checkbox.waitFor();

    // await checkbox.check();
});


test("Handle Tabs in SFDC", async() => {

  const userDataDirectory = path.resolve(__dirname, '../sf-profile');

  const context = await chromium.launchPersistentContext(userDataDirectory, {
    headless: false,
    args: ['--start-maximized'],
  });

  const page = await context.newPage();

  await page.goto("https://login.salesforce.com");

  await expect(page).toHaveTitle("Login | Salesforce");

    await page.locator('#username').fill("");
    await page.locator('#password').fill("");
    await page.locator('#Login').click();

    //for the first manually enter the token from your email

    await page.waitForURL("**/lightning/**", {timeout : 60000});

    const elementText = page.locator('.slds-badge_lightest.slds-badge').nth(3);

    await expect(elementText).toContainText("1 In Progress");


    await page.locator("[data-key='question']").click();

    
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      await page.locator("//span[text()='Go to Trailhead']").click()
    ]);

    console.log(await newPage.title());
    await expect(newPage).toHaveTitle("Trailhead | The fun way to learn");

});



















