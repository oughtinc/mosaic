Cypress.Commands.add("seedDb", () => {
  cy.request("POST", "http://localhost:8080/__seedDb");
});
