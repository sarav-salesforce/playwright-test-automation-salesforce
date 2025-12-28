const {test, expect, chromium} = require("@playwright/test");

const fs = require('fs');
const path = require('path');
const { text } = require("stream/consumers");

test('@E2E SFDC - UI + API Script', async ({ request }) => {

    //API Scripts

  const loginUrl = 'https://login.salesforce.com/services/oauth2/token';

  const grantType = 'password';
  const user_name = process.env.sit_salesforce_username;
  const pass = process.env.sit_salesforce_password;
  const clientId = process.env.consumer_key;
  const clientSecret = process.env.consumer_secret;

  // Step 1: Authenticate and get access token
    const loginResponse = await request.post(loginUrl, {
      headers: {
        'Content-Type' : 'application/x-www-form-urlencoded'
      },
      form: {
        grant_type: grantType,
        username: user_name,
        password: pass,
        client_id: clientId,
        client_secret: clientSecret
      }
    });

    console.log('Login response is: ', (await (loginResponse).body()).toString());
    expect((loginResponse).ok()).toBeTruthy();


    const loginBody = await loginResponse.json();
    const accessToken = loginBody.access_token;
    const instanceUrl = loginBody.instance_url;

    console.log('Access token is: ', accessToken);

    console.log('Instance URL is: ', instanceUrl);

    // Step 2: Create account via API

    const accountUrl = instanceUrl+'/services/data/v65.0/sobjects/Account/';

    const accountName = "Account for Contact " + Date.now();
    const accountPayload = {
      Name: `${accountName}`,
      Rating: "Hot",
      BillingStreet: "20 Gracechurch St"
    };

   const accountCreationResponse = await request.post(accountUrl, {
      headers: {
        "Content-Type" : "application/json",
        "Authorization" : `Bearer ${accessToken}`
      },
      data : accountPayload
    });

    console.log("Account creation response is: ", accountCreationResponse.status().toString());

    console.log('Account creation response body is: ', (await (accountCreationResponse).body()).toString());

    expect((accountCreationResponse).ok()).toBeTruthy();

    const accountRecordId = await accountCreationResponse.json();

    const accountRecordIdValue = accountRecordId.id;

    console.log('Account created and id is:', accountRecordIdValue);


    // UI Scripts

    const userDataDirectory = path.resolve(__dirname, '../sf-profile');
    
      const context = await chromium.launchPersistentContext(userDataDirectory, {
        headless: false,
        args: ['--start-maximized'],
      });
    
      const page = await context.newPage();
    
      await page.goto("https://login.salesforce.com");
    
      await expect(page).toHaveTitle("Login | Salesforce");
    
        await page.locator('#username').fill(process.env.sit_salesforce_username);
        await page.locator('#password').fill(process.env.sit_salesforce_password);
        await page.locator('#Login').click();
    
        //for the first manually enter the token from your email
    
        await page.waitForURL("**/lightning/**", {timeout : 60000});

        await page.goto('https://sf-test-automation-dev-ed.develop.lightning.force.com/lightning/o/Contact/list?filterName=__Recent');

        const newButton = page.locator("[title='New']").first();

        await newButton.waitFor();

        await newButton.click();

        const first_Name = "UI Contact";
        const last_Name = "Playwright "+Date.now();

        await page.locator("[name='firstName']").fill(first_Name);
        await page.locator("[name='lastName']").fill(last_Name);

        await page.locator("[placeholder='Search Accounts...']").fill(accountName);

        await page.keyboard.press('Enter');

        await page.locator("//lightning-base-combobox-formatted-text[@title='"+accountName+"']").click();

        //Save
        const saveBtn = page.locator("[name='SaveEdit']");

        await saveBtn.click();


        //Assert the account
        const contactNameElement = page.locator("//lightning-formatted-name[text()='"+first_Name+" "+last_Name+"']");

        await contactNameElement.waitFor();

        expect(await contactNameElement.isVisible());

        console.log("Contact saved successfully and name is: ", await contactNameElement.textContent());

});