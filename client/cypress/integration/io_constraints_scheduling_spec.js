describe("Scheduling with only IO-constraints", function() {
  context("with tree structured: A, A-1, A-2, A-2-1", function() {
    beforeEach(function() {
      cy.seedDbForIOConstraintsScheduling();

      cy.visit("/");
      cy.login();
      cy.reload();
    });

    it("schedules typical user correctly", function() {
      cy.loopNTimes(10, {
        before: () => cy.visit("/next"),
        during: () => cy.contains("(0 descendants)"),
        counts: [
          {
            min: 1,
            testFn: $node =>
              $node.text() === "A-1: A subquestion #1 (0 descendants)",
          },
          {
            min: 1,
            testFn: $node =>
              $node.text() === "A-2-1: A-2 subquestion #1 (0 descendants)",
          },
        ],
      });
    });
  });
});
