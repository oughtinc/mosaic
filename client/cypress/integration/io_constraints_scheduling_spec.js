describe("Scheduling with only IO-constraints", function() {
  context("with tree structured: A, A-1, A-2, A-2-1", function() {
    beforeEach(function() {
      cy.seedDbForIOConstraintsScheduling();
      
      cy.visit("/");
      cy.login();
      cy.reload();
    });

    it("schedules typical user correctly", function() {
      let i = 0;
      let j = 0;
      let arrOfPromises = [];
      for (let k = 0; k < 10; k++) {
        arrOfPromises.push(new Promise(resolve => {
          cy.visit("/next");
          cy.contains("[0 descendants]").then(
            $node => {
              if ($node.text() === "A-1: A subquestion #1 [0 descendants]") {
                i++;
              } else if ($node.text() === "A-2-1: A-2 subquestion #1 [0 descendants]") {
                j++;
              }
              resolve();
            });
          })
        );
      }

      Promise.all(arrOfPromises).then(() => {
        expect(i > 0).to.be.true;
        expect(j > 0).to.be.true;
      });
    });
  });
});
