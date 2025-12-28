import { test, expect } from '@playwright/test';

test('SFDC - Account creation via API', async ({ request }) => {

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

    const accountPayload = {
      Name: "Created via Playwright",
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

    //Step 3: Contact creation and linking to account

    const contactUrl = instanceUrl+'/services/data/v65.0/sobjects/Contact/';

    const contactPayload = {
      FirstName: "Contact Created",
      LastName: "Playwright",
      AccountId: `${accountRecordIdValue}`
    };

   const contactCreationResponse = await request.post(contactUrl, {
      headers: {
        "Content-Type" : "application/json",
        "Authorization" : `Bearer ${accessToken}`
      },
      data : contactPayload
    });


    console.log("Contact creation response is: ", contactCreationResponse.status().toString());

    console.log('Contact creation response body is: ', (await (contactCreationResponse).body()).toString());

    expect((contactCreationResponse).ok()).toBeTruthy();

    const contactRecordId = await contactCreationResponse.json();

    const contactRecordIdValue = contactRecordId.id;

    console.log('Contact created and id is:', contactRecordIdValue);
  });
