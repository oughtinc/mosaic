Cypress.Commands.add("resetDb", () => {
  cy.request("POST", "http://localhost:8080/__resetDb");
});
