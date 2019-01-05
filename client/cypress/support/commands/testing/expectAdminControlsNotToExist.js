Cypress.Commands.add("expectAdminControlsNotToExist", () => {
  cy.get(`[data-cy="admin-checkbox-front-page"]`).should("not.exist");
  cy.get(`[data-cy="admin-checkbox-is-eligible"]`).should("not.exist");
  cy.get(`[data-cy="admin-checkbox-time-budget"]`).should("not.exist");
  cy.get(`[data-cy="admin-checkbox-io-constraint"]`).should("not.exist");
});
