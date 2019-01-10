describe("Oracles", function() {
  context.only("when in oracle mode", function() {
    beforeEach(function() {
      cy.seedDbForOracles();

      cy.visit("/");
      cy.loginAsOracle();
      cy.reload();
    });

    it("see all & only oracle eligible workspaces during scheduling", function(){
      cy.loopNTimes(10, {
        before: () => {
          cy.visit("/next");
          cy.wait(2000);
        },
        during: () => cy.contains("oracle eligible"),
        counts: [
          {
            min: 1,
            testFn: $node => $node.text() === "A: Root-level (3 descendants) - oracle eligible",
          },
          {
            min: 1,
            testFn: $node => $node.text() === "A-2: A subquestion #2 (1 descendants) - oracle eligible",
          },
        ]
      });
    });
  });
});
