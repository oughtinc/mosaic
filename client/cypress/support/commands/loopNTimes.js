Cypress.Commands.add("loopNTimes", (n, {
  before,
  during,
  counts
}) => {
  let iArr = [];
  let arrOfPromises = [];
  for (let k = 0; k < n; k++) {
    arrOfPromises.push(new Promise(resolve => {
      before();
      during().then(
        value => {
          counts.forEach((count, i) => {
            if (count.testFn(value)) {
              iArr[i] = iArr[i] ? iArr[i] + 1 : 1;
            }
          });
          resolve();
        });
      })
    );
  }

  Promise.all(arrOfPromises).then(() => {
    counts.forEach((count, i) => {
      expect(iArr[i] > count.min).to.be.true;
    });
  });
});
