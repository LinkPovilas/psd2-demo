Feature: Account list after redirect authentication

    Allows to request the list of all Payment Service User's (PSU) accounts.

    Scenario Outline: Should be able to get user's account list after authentication

        Given user receives redirect URL based on their bank identifier code <bic>
        When user is redirected to authentication URL and they log in with their user id <psu_id>
        And agree to give access rights to the third party provider for their selected account <business>, <name>
        And access token is created
        Then the list of all user's accounts is received

        # Only the estonian user has a business
        Examples:
            | bic      | psu_id   | business | name                 |
            | EEUHEE2X | ibsUser1 | false    | Mari-Liis Männik     |
            | EEUHEE2X | ibsUser1 | true     | Imaginary SME OÜ     |
            | UNLALV2X | ibsUser2 | false    | Justīna Buile        |
            | CBVILT2X | ibsUser1 | false    | Gustavas Kanisauskas |

