import { getAuthResultsForAdmin } from "../../auth/getAuthResultsForAdmin";
import { saveAuthResultsToLocalStorage } from "../../auth/saveAuthResultsToLocalStorage";

Cypress.Commands.add("loginAsAdmin", async () => {
  const authResults = await getAuthResultsForAdmin();
  saveAuthResultsToLocalStorage(authResults);
});
