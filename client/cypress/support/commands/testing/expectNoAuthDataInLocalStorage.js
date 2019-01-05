Cypress.Commands.add("expectNoAuthDataInLocalStorage", () => {
  expect(localStorage.getItem("access_token")).to.not.exist;
  expect(localStorage.getItem("user_id")).to.not.exist;
  expect(localStorage.getItem("expires_at")).to.not.exist;
  expect(localStorage.getItem("is_admin")).to.not.exist;
  expect(localStorage.getItem("is_oracle")).to.not.exist;
});
