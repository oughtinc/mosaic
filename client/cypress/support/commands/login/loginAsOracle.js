import { getAuthResultsForOracle } from "../../auth/getAuthResultsForOracle";
import { saveAuthResultsToLocalStorage } from "../../auth/saveAuthResultsToLocalStorage";

Cypress.Commands.add("loginAsOracle", async () => {
  const authResults = await getAuthResultsForOracle();
  saveAuthResultsToLocalStorage(authResults);
});
