import { getAuthResultsForAdminAndOracle } from "../../auth/getAuthResultsForAdminAndOracle";
import { saveAuthResultsToLocalStorage } from "../../auth/saveAuthResultsToLocalStorage";

Cypress.Commands.add("loginAsAdminAndOracle", async () => {
  const authResults = await getAuthResultsForAdminAndOracle();
  saveAuthResultsToLocalStorage(authResults);
});
