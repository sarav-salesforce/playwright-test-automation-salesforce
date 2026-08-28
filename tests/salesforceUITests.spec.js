const {test, expect} = require("@playwright/test");
const { loginWithJwt } = require("./helpers/salesforceAuth");

// ---------------------------------------------------------------------------
// Login-screen behaviour tests (intentionally NOT authenticated).
// These exercise the public https://login.salesforce.com form itself with
// empty credentials to assert its validation messaging — they are not a way
// of signing in, so the JWT flow does not apply to them.
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Authenticated UI tests — sign in with the JWT bearer flow (no username /
// password screen) via loginWithJwt(page, <relative lightning path>).
// ---------------------------------------------------------------------------

test("Test with Same browser", async({ page }) => {

  await loginWithJwt(page, "/lightning/page/home");

  await expect(page).toHaveURL(/\/lightning\//);
  await expect(page.locator("#oneHeader")).toBeVisible();
});


test("Handle Dropdown in SFDC", async({ page }) => {

  await loginWithJwt(page, "/lightning/o/Account/list?filterName=__Recent");

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


test("Handle checkbox in SFDC", async({ page }) => {

  await loginWithJwt(page, "/lightning/o/Case/list?filterName=__Recent");

    const newButton = page.locator("[title='New']").first();

    await newButton.waitFor();

    await newButton.click();

    const checkbox = page.locator("[class='slds-checkbox__label']");

    await checkbox.waitFor();

    await checkbox.click();
});


test("Handle Tabs in SFDC", async({ page }) => {

  await loginWithJwt(page, "/lightning/page/home");

    await page.locator("[data-key='question']").click();

    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      page.locator("//span[text()='Go to Trailhead']").click()
    ]);

    console.log(await newPage.title());
    await expect(newPage).toHaveTitle("Trailhead | The fun way to learn");

});
