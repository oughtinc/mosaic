import * as auth0 from "auth0-js";
// Note: uses local storage instead of redux to persist across sessions
// May consider alternate architecture ie through the redux-localstorage package
import { appConfig } from "../../config.js";

export class Auth {

  public static auth0 = new auth0.WebAuth({
    domain: "mosaicapp.auth0.com",
    clientID: appConfig.auth0_client_id,
    redirectUri: Auth.redirectUri(),
    audience: "https://mosaicapp.auth0.com/userinfo",
    responseType: "token id_token",
    scope: "openid user_metadata app_metadata",
  });

  public static login(): void {
    Auth.auth0.authorize();
  }

  public static logout(): void {
    // Clear Access Token and ID Token from local storage
    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    localStorage.removeItem("expires_at");
    localStorage.removeItem("is_admin");
  }

  public static handleAuthentication(): void {
    Auth.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        Auth.setSession(authResult);
        console.log(authResult);
        console.log("Successfully authorized");

      } else if (err) {
        console.log(err);
      }
    });
  }

  public static setSession(authResult: any): void {
    // Set the time that the Access Token will expire at
    const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    localStorage.setItem("access_token", authResult.accessToken);
    localStorage.setItem("id_token", authResult.idToken);
    localStorage.setItem("expires_at", expiresAt);
    Auth.getProfile();
  }

  public static isAuthenticated(): boolean {
    // Check whether the current time is past the 
    // Access Token's expiry time
    const expiresJson = localStorage.getItem("expires_at");
    if (expiresJson === null) {
      return false;
    }
    let expiresAt = JSON.parse(expiresJson);
    const isExpired = new Date().getTime() > Number(expiresAt);
    if (isExpired) {
      Auth.logout();
      return false;
    }

    return true;
  }

  // TODO: Replace with permission based logic
  public static isAuthorizedToEdit(workspace: any): boolean {
    if (!Auth.isAuthenticated()) {
      return false;
    }

    // TODO:
    // Check - is this an admin workspace & is this user an admin
    // Normal workspaces can be edited by anyone with the link & authed
    // Need to upgrade workspace schema with a "public_workspace" bool column
    //    and "creator_id" string column

    return true;

  }

  public static isAdmin(): boolean {
    return localStorage.getItem("is_admin") === "true";
  }

  public static accessToken(): string | null {
    return localStorage.getItem("access_token");
  }

  // TODO: Need to trigger a rerender
  public static getProfile(): void {
    const root = "https://mosaic:auth0:com/";

    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      throw new Error("Access token must exist to fetch profile");
    }

    Auth.auth0.client.userInfo(accessToken, (err, profile) => {
      if (err) {
        console.log(err);
        return;
      }
      const appMetadata = profile[root + "app_metadata"];
      if (appMetadata != null && appMetadata.is_admin != null) {
        localStorage.setItem("is_admin", appMetadata.is_admin);
        console.log(appMetadata.is_admin);
      }
    });
  }

  private static redirectUri(): string {
    return `${window.location.origin}/authCallback`;
  }
}
