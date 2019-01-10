Cypress.Commands.add("seedDbForOracles", () => {
  cy.request("POST", "http://localhost:8080/testing/__seedDbForOracles");
});
