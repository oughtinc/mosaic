import { getAuthResultsForTypicalUser } from "./auth/getAuthResultsForTypicalUser";
import { saveAuthResultsToLocalStorage } from "./auth/saveAuthResultsToLocalStorage";

Cypress.Commands.add("login", async () => {
  const authResults = await getAuthResultsForTypicalUser();
  saveAuthResultsToLocalStorage(authResults);
});
