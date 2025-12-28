const {test, expect, chromium} = require("@playwright/test");

const fs = require('fs');
const path = require('path');


test("Account creation in SFDC", async() => {

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

    const accName = "Playwright Account";
    //Account Name
    const accountName = page.locator("[name='Name']");

    await accountName.waitFor();

    await accountName.fill(accName);

    
    //Account Number
    const accountNumber = page.locator("[name='AccountNumber']");

    await accountNumber.waitFor();

    await accountNumber.fill("8541256");

    //Rating dropdown value
    const dropdownField = page.locator("//button[@aria-label='Rating']");

    await dropdownField.waitFor();

    await dropdownField.click();

    const dropdownValue = page.locator("//lightning-base-combobox-item[@data-value='Hot']");

    await dropdownValue.waitFor();

    await dropdownValue.click();

    //Address (Billing)

    const billingStreet = page.locator("[name='street']");

    await billingStreet.nth(1).waitFor();

    await billingStreet.first().fill("20 Gracechruch Street");

    const billingCity = page.locator("[name='city']");

    await billingCity.first().waitFor();

    await billingCity.nth(1).fill("London");

    //Save
    const saveBtn = page.locator("[name='SaveEdit']");

    await saveBtn.click();

    //Assert the account
    const accountNameElement = page.locator("//lightning-formatted-text[text()='"+accName+"']");

    await accountNameElement.waitFor();

    expect(await accountNameElement.isVisible());

    console.log("Account saved successfully and name is: ", await accountNameElement.textContent());

});


test("AAdvance locator handle in Salesforce", async() => {

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


    //Placeholder
    
    const searchBarInAccountListView = page.getByPlaceholder("Search this list...");

    await searchBarInAccountListView.fill("Playwright");

    await searchBarInAccountListView.press("Enter");

    //By Text

    const accountLink = page.getByText("Playwright Account");
    await accountLink.click();


    //By Role
    const globalSearchBar = page.getByRole('button', {name : "Search"});

    await globalSearchBar.click();

    const global = page.getByPlaceholder("Search...");
    await global.fill("Playwright");
    await global.press("Enter");

    //const searchResult = page.getByTitle("Playwright Account");

    //const searchResult = page.getByRole('link', {toHaveTitle : "Playwright Account"});

    //Option 1: Traditional way
    const searchResult = page.locator("//a[text()='Accounts']/following::a[@title='Playwright Account']");

    await searchResult.waitFor();

    expect(await searchResult.isVisible());

    //Option 2: Chainlink of locators

    const searchResult1 = page.locator("[class*='resultsWrapper']").filter({hasText : "Playwright Account"});

    await searchResult1.waitFor();

    expect(await searchResult1.isVisible());

});
