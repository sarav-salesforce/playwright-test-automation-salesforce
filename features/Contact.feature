Feature: Contact Management

  Scenario Outline: User creates a new contact
    Given User is on the "<tab>" tab
    When User clicks on the new button in contact page
    And User enters the "<firstName>" and "<lastName>"
    And User enters the contact account name "<accountName>"
    And User clicks on the Save button for contact
    Then A new contact should be created successfully

    Examples:
      | firstName | lastName | accountName      | tab      |
      | John      | Doe      | New Test Account | Contacts |
