describe("Home page", function() {
  context("when no one is logged in", function() {
    before(function() {
      cy.visit("localhost:3000");
    });

    it("diplays login link", function() {
      cy.get(`[data-cy="login-link"]`);
    });

    it("does not display logout link", function() {
      cy.get(`[data-cy="logout-link"]`).should("not.exist");
    });

    it("does not display new root workspace form", function() {
      cy.get(`[data-cy="new-root-workspace-form"]`).should("not.exist");
    });

    it("has not loaded auth info into localStorage", function() {
      expect(localStorage.getItem("user_id")).to.not.exist;
    });
  });

  context("when typical user is logged in", function() {
    before(function() {
      cy.visit("localhost:3000");
    });

    beforeEach(function() {
      cy.login().reload();
    });

    it("diplays logout link", function() {
      cy.get(`[data-cy="logout-link"]`);
    });

    it("does not diplay login link", function() {
      cy.get(`[data-cy="login-link"]`).should("not.exist");
    });

    it("diplays new root workspace form", function() {
      cy.get(`[data-cy="new-root-workspace-form"]`);
    });

    it("has loaded auth info into localStorage", function() {
      expect(localStorage.getItem("user_id")).to.exist;
    });
  });

  context("when admin is logged in", function() {
    before(function() {
      cy.visit("localhost:3000");
    });

    beforeEach(function() {
      cy.loginAsAdmin().reload();
    });

    it("diplays logout link", function() {
      cy.get(`[data-cy="logout-link"]`);
    });

    it("does not diplay login link", function() {
      cy.get(`[data-cy="login-link"]`).should("not.exist");
    });

    it("diplays new root workspace form", function() {
      cy.get(`[data-cy="new-root-workspace-form"]`);
    });

    it("has loaded auth info into localStorage", function() {
      expect(localStorage.getItem("user_id")).to.exist;
    });
  });
});
