Cypress.Commands.add("expectTypicalUserAuthDataInLocalStorage", () => {
  expect(localStorage.getItem("access_token")).to.exist;
  expect(localStorage.getItem("user_id")).to.exist;
  expect(localStorage.getItem("expires_at")).to.exist;
  expect(localStorage.getItem("is_admin")).to.not.exist;
  expect(localStorage.getItem("is_oracle")).to.not.exist;
});
