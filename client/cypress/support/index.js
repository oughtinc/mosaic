import "./commands";

beforeEach(() => {
  cy.resetDb().then(() => cy.seedDb());
});
