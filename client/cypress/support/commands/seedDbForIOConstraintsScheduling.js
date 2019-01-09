Cypress.Commands.add("seedDbForIOConstraintsScheduling", () => {
  cy.request("POST", "http://localhost:8080/testing/__seedDbForIOConstraintsScheduling");
});
