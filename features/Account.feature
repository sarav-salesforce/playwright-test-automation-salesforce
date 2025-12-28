Feature: Account Management

  Scenario Outline: User creates a new account
    Given User is on the "<tab>" tab
    When User clicks on the new button in account page
    And User enters the account name "<accountName>"
    And User selects the account number "<accountNumber>"
    And User selects the rating "<rating>"
    And User clicks on the Save button for account
    Then A new account named "<accountName>" should be created successfully

    Examples:
      | accountName      | tab      | accountNumber | rating |
      | New Test Account | Accounts |        123456 | Hot    |
