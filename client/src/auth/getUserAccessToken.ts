export function getUserAccessToken(): string | null {
  return localStorage.getItem("access_token");
}
