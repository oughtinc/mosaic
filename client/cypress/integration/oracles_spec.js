describe("Oracles", function() {
  context("when in oracle mode", function() {
    beforeEach(function() {
      cy.seedDbForOracles();

      cy.visit("/");
      cy.loginAsOracle();
      cy.reload();
    });

    it("see all & only oracle eligible workspaces during scheduling", function() {
      cy.loopNTimes(10, {
        before: () => {
          cy.visit("/next");
          cy.wait(2000);
        },
        during: () => cy.contains("oracle eligible"),
        counts: [
          {
            min: 1,
            testFn: $node =>
              $node.text() ===
              "A: Root-level (3 descendants) - oracle eligible",
          },
          {
            min: 1,
            testFn: $node =>
              $node.text() ===
              "A-2: A subquestion #2 (1 descendants) - oracle eligible",
          },
        ],
      });
    });

    it("regression: nested pointers not locked", function() {
      cy.visit("/workspaces/d1189739-0f53-4c3d-acd7-15aa1543619c");
      cy.contains("🔒").then($n1 => {
        expect($n1.width()).to.equal(0);

        cy.get("[data-cy='closed-import']").then($n2 => {
          $n2.parent().click();
          cy.contains("unnested");
          cy.contains("🔒").then($n3 => {
            expect($n3.width()).to.equal(0);
          });
        });
      });
    });
  });
});
