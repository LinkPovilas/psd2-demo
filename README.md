# PSD2 demo

A small test automation demo/practice project with [cypress-cucumber-preprocessor](https://github.com/TheBrainFamily/cypress-cucumber-preprocessor) which allows to use feature files when testing with Cypress.

## Setup

Register on [SEB Developer portal](https://developer.baltics.sebgroup.com/ob/apis), then go to [Client (TPP) authentication](https://developer.baltics.sebgroup.com/ob/settings/tpp-certificate) page and click 'Generate new certificate', download cert and key files and save them into the project's fixtures folder. Or update cypress.json with the path where the files are located.

Install dependencies with:
```bash
npm install
```

## Use

Scripts in `package.json` to run the tests:

* `npm run cy:open` - runs Cypress in GUI mode
* `npm run cy:run` - runs Cypress tests in headless mode