/// <reference types="Cypress" />
import { And, Given, Then, When } from "cypress-cucumber-preprocessor/steps";
import { v4 as uuidv4 } from "uuid";

Given("user receives redirect URL based on their bank identifier code {}", (bic) => {
    cy.request({
      method: "GET",
      url: "/v2/oauth/authorization/links?bic=" + bic,
      headers: {
        Date: new Date().toUTCString(),
        "X-Request-ID": uuidv4(),
        "Content-Type": "application/json",
      },
    }).then((response) => {
      expect(response.status).to.be.equal(200, "HTTP status");
      expect(response.body[0].url).not.to.be.null;

      cy.wrap(response.body[0].url).as("oauthUrl");
    });
  }
);

When("user is redirected to authentication URL and they log in with their user id {}", (psuId) => {
    cy.get("@oauthUrl").then((oauthUrl) => {
      cy.visit(oauthUrl);

      // enters User ID
      cy.get("input[id=username1]")
        .scrollIntoView()
        .type(psuId)
        .should("have.value", psuId);

      // clicks terrible Accept button to log in.
      // best practice would be to use data-* attribute, something like: cy.get('[data-cy=accept]').click();
      // https://docs.cypress.io/guides/references/best-practices#Selecting-Elements
      // but it's not available for this button
      cy.get('a[class="button_small main s-f-right "]').click();
    });
  }
);

And("agree to give access rights to the third party provider for their selected account {}, {}", (isBusiness, name) => {
    cy.get('button[data-toggle="dropdown"]').should("be.visible");

    // selects business customer from fake select dropwdown menu. Private user is always the default option.
    // best practice would be to use cy.get('select').select('someKindOfValue');
    // https://docs.cypress.io/api/commands/select
    // but it's not available
    if (isBusiness) {
      cy.get('button[data-toggle="dropdown"]')
        .click()
        .next()
        .contains(name)
        .click();
    }

    // clicks terrible Agree and Continue button
    // best practice would be to use data-* attribute, something like: cy.get('[data-cy=continue]').click();
    // https://docs.cypress.io/guides/references/best-practices#Selecting-Elements
    // but it's not available for this button
    cy.get('a[class="button_small f-right main m-right-20 m-m-t-10"]').click();

    // checks if user is redirected to the provided redirect URL
    // also is a decent way to check if an error page is not loaded instead
    cy.url().should("include", "?code=").and("include", "&state=1");

    cy.location().then((loc) => {
      // the search property of the Location interface returns URL's parameters
      // https://developer.mozilla.org/en-US/docs/Web/API/Location/search
      // URLSearchParams.get() lets us get the first value associated with the given search parameter
      // https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
      // the oauth code from the URL is used to create access token for the user
      cy.wrap(new URLSearchParams(loc.search).get("code")).as("oauthCode");
    });
  }
);

And("access token is created", () => {
  cy.get("@oauthCode").then((code) => {
    cy.request({
      method: "POST",
      url: "/v2/oauth/token",
      headers: {
        Date: new Date().toUTCString(),
        "X-Request-ID": uuidv4(),
        "Content-Type": "application/json",
      },
      body: {
        grant_type: "authorization_code",
        code: code,
        redirect_uri: "https://dev.obdevportal.eu/callback-emulator",
      },
    }).then((response) => {
      expect(response.status).to.be.equal(200, "HTTP status");
      expect(response.body.access_token).not.to.be.equal(null, "Access token");
      expect(response.body.refresh_token).not.to.be.equal(
        null,
        "Refresh token"
      );

      cy.wrap(response.body.access_token).as("accesToken");
    });
  });
});

Then("the list of all user's accounts is received", () => {
  cy.get("@accesToken").then((accesToken) => {
    cy.request({
      method: "GET",
      url: "/v2/account-list",
      headers: {
        authorization: `Bearer ${accesToken}`,
        Date: new Date().toUTCString(),
        "X-Request-ID": uuidv4(),
        "Content-Type": "application/json",
      },
    }).then((response) => {
      expect(response.status).to.be.equal(200, "HTTP status");
      expect(response.body.accounts).not.to.be.null.and.empty;
    });
  });
});
