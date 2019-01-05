describe("Home page", function() {
  context("when no one is logged in", function() {
    beforeEach(function() {
      cy.visit("/");
    });

    it("diplays proper components & stores proper auth data", function() {
      cy.get(`[data-cy="login-link"]`);
      cy.get(`[data-cy="logout-link"]`).should("not.exist");
      cy.get(`[data-cy="new-root-workspace-form"]`).should("not.exist");
      cy.expectNoAuthDataInLocalStorage();
    });
  });

  context("when typical user is logged in", function() {
    beforeEach(function() {
      cy.visit("/").login().reload();
    });

    it("diplays proper components & stores proper auth data", function() {
      cy.get(`[data-cy="logout-link"]`);
      cy.get(`[data-cy="login-link"]`).should("not.exist");
      cy.get(`[data-cy="new-root-workspace-form"]`);
      cy.expectTypicalUserAuthDataInLocalStorage();
    });


    it("can create new root workspace", function() {
      cy.get(`[data-cy="slate-editor-new-question-form"]`)
        .type("This is the question text for a new root-level workspace");
      cy.get(`[data-cy="submit-new-question"]`)
        .click();
      cy.contains("This is the question text for a new root-level workspace");

      cy.expectAdminControlsNotToExist();
    });
  });

  context("when admin is logged in", function() {
    beforeEach(function() {
      cy.visit("/")
        .loginAsAdmin()
        .reload();
    });

    it("diplays proper components & stores proper auth data", function() {
      cy.get(`[data-cy="logout-link"]`);
      cy.get(`[data-cy="login-link"]`).should("not.exist");
      cy.get(`[data-cy="new-root-workspace-form"]`);
      cy.expectAdminAuthDataInLocalStorage();
    });

    it("can create new root workspace", function() {
      cy.get(`[data-cy="slate-editor-new-question-form"]`)
        .type("This is the question text for a new root-level workspace written by an admin");
      cy.get(`[data-cy="submit-new-question"]`)
        .click();
      cy.contains("This is the question text for a new root-level workspace written by an admin");

      cy.expectAdminControlsToExist();

      cy.get(`[data-cy="oracle-mode-header"]`).should("not.exist");
    });
  });

  context("when oracle is logged in", function() {
    beforeEach(function() {
      cy.visit("/")
        .loginAsOracle()
        .reload();
    });

    it("diplays proper components & stores proper auth data", function() {
      cy.get(`[data-cy="logout-link"]`);
      cy.get(`[data-cy="login-link"]`).should("not.exist");
      cy.get(`[data-cy="new-root-workspace-form"]`);
      cy.expectOracleAuthDataInLocalStorage();
    });

    it("can create new root workspace", function() {
      cy.get(`[data-cy="slate-editor-new-question-form"]`)
        .type("This is the question text for a new root-level workspace written by an admin");
      cy.get(`[data-cy="submit-new-question"]`)
        .click();
      cy.contains("This is the question text for a new root-level workspace written by an admin");

      cy.get(`[data-cy="oracle-mode-header"]`);

      cy.expectAdminControlsNotToExist();
    });
  });

  context("when user is admin and oracle", function() {
    beforeEach(function() {
      cy.visit("/")
        .loginAsAdminAndOracle()
        .reload();
    });

    it("diplays proper components & stores proper auth data", function() {
      cy.get(`[data-cy="logout-link"]`);
      cy.get(`[data-cy="login-link"]`).should("not.exist");
      cy.get(`[data-cy="new-root-workspace-form"]`);
      cy.expectAdminAndOracleAuthDataInLocalStorage();
    });

    it("can create new root workspace", function() {
      cy.get(`[data-cy="slate-editor-new-question-form"]`)
        .type("This is the question text for a new root-level workspace written by an admin");
      cy.get(`[data-cy="submit-new-question"]`)
        .click();
      cy.contains("This is the question text for a new root-level workspace written by an admin");

      cy.get(`[data-cy="oracle-mode-header"]`);

      cy.expectAdminControlsToExist();
    });
  });
});
