describe("Home page", function() {
  context("when no one is logged in", function() {
    beforeEach(function() {
      cy.visit("/");
    });

    it("diplays proper components & stores proper auth data", function() {
      cy.get(`[data-cy="login-link"]`);
      cy.get(`[data-cy="logout-link"]`).should("not.exist");
      cy.get(`[data-cy="new-root-workspace-form"]`).should("not.exist");
      expect(localStorage.getItem("access_token")).to.not.exist;
      expect(localStorage.getItem("user_id")).to.not.exist;
      expect(localStorage.getItem("expires_at")).to.not.exist;
      expect(localStorage.getItem("is_admin")).to.not.exist;
      expect(localStorage.getItem("is_oracle")).to.not.exist;
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
      expect(localStorage.getItem("access_token")).to.exist;
      expect(localStorage.getItem("user_id")).to.exist;
      expect(localStorage.getItem("expires_at")).to.exist;
      expect(localStorage.getItem("is_admin")).to.not.exist;
      expect(localStorage.getItem("is_oracle")).to.not.exist;
    });


    it("can create new root workspace", function() {
      cy.get(`[data-cy="slate-editor-new-question-form"]`)
        .type("This is the question text for a new root-level workspace");
      cy.get(`[data-cy="submit-new-question"]`)
        .click();
      cy.contains("This is the question text for a new root-level workspace");

      cy.get(`[data-cy="admin-checkbox-front-page"]`).should("not.exist");
      cy.get(`[data-cy="admin-checkbox-is-eligible"]`).should("not.exist");
      cy.get(`[data-cy="admin-checkbox-time-budget"]`).should("not.exist");
      cy.get(`[data-cy="admin-checkbox-io-constraint"]`).should("not.exist");
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
      expect(localStorage.getItem("access_token")).to.exist;
      expect(localStorage.getItem("user_id")).to.exist;
      expect(localStorage.getItem("expires_at")).to.exist;
      expect(localStorage.getItem("is_admin")).to.exist;
      expect(localStorage.getItem("is_oracle")).to.not.exist;
    });

    it("can create new root workspace", function() {
      cy.get(`[data-cy="slate-editor-new-question-form"]`)
        .type("This is the question text for a new root-level workspace written by an admin");
      cy.get(`[data-cy="submit-new-question"]`)
        .click();
      cy.contains("This is the question text for a new root-level workspace written by an admin");

      cy.get(`[data-cy="admin-checkbox-front-page"]`);
      cy.get(`[data-cy="admin-checkbox-is-eligible"]`);
      cy.get(`[data-cy="admin-checkbox-time-budget"]`);
      cy.get(`[data-cy="admin-checkbox-io-constraint"]`);
    });
  });
});
