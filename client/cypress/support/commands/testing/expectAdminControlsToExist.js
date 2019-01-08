Cypress.Commands.add("expectAdminControlsToExist", () => {
  cy.get(`[data-cy="admin-checkbox-front-page"]`);
  cy.get(`[data-cy="admin-checkbox-is-eligible"]`);
  cy.get(`[data-cy="admin-checkbox-time-budget"]`);
  cy.get(`[data-cy="admin-checkbox-io-constraint"]`);
});
