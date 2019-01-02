export function saveAuthResultsToLocalStorage(authResults) {
  for (const property in authResults) {
    localStorage.setItem(property, authResults[property]);
  }
}
