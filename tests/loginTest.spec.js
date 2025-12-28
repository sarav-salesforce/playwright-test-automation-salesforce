const {test, expect, chromium} = require("@playwright/test");
const path = require("path");

const userDataDirectory = path.resolve(__dirname, '../sf-profile');

let context;
let page;

// //runs only once before all tests in the file
// test.beforeAll() 

// //runs only once after all tests in the file
// test.afterAll()

// //runs before each test in the file
// test.beforeEach()

// //runs after each test in the file
// test.afterEach()

test.beforeAll(async () => {
    context = await chromium.launchPersistentContext(userDataDirectory, {
        headless: false,
        args: ['--start-maximized'],
    });
    page = await context.newPage();
    await page.goto("https://login.salesforce.com");

  await expect(page).toHaveTitle("Login | Salesforce");

    await page.locator('#username').fill(process.env.sit_salesforce_username);
    await page.locator('#password').fill(process.env.sit_salesforce_password);
    await page.locator('#Login').click();
    //for the first manually enter the token from your email
    await page.waitForURL("**/lightning/**", {timeout : 60000});
    await context.storageState({path: 'sf-profile/state.json'});
});



test("Login Test", async () => { 

    await page.goto("https://sf-test-automation-dev-ed.develop.lightning.force.com/lightning/o/Case/list?filterName=__Recent");
    const newButton = page.locator("[title='New']").first();
    await newButton.waitFor();
    await newButton.click();
    const checkbox = page.locator("[class='slds-checkbox__label']");
    await checkbox.waitFor();
    await checkbox.click();
});


test("Handle Dropdown in SFDC", async() => {
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


