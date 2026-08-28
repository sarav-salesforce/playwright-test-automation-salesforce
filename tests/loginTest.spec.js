const {test, expect, chromium} = require("@playwright/test");
const path = require("path");
const { jwtAuthenticate, jwtLogin } = require("./helpers/salesforceAuth");

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

    // JWT bearer flow instead of the username/password login screen.
    const session = await jwtAuthenticate();
    await jwtLogin(page, session, "/lightning/page/home");
    await expect(page).toHaveURL(/\/lightning\//);

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
