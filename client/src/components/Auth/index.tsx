
import * as auth0 from "auth0-js";

export class Auth {
  public static auth0 = new auth0.WebAuth({
    domain: "mosaicapp.auth0.com",
    clientID: "wxJ6gaMkuuoSvLpQpBUZlsbwzDlVjjAu",
    redirectUri: "http://localhost:3000/authCallback",
    audience: "https://mosaicapp.auth0.com/userinfo",
    responseType: "token id_token",
    scope: "openid user_metadata app_metadata",
  });

  public static login() {
    Auth.auth0.authorize();
  }

  public static logout() {
    // Clear Access Token and ID Token from local storage
    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    localStorage.removeItem("expires_at");
    localStorage.removeItem("is_admin");
  }

  public static handleAuthentication() {
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

  public static setSession(authResult: any) {
    // Set the time that the Access Token will expire at
    const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    localStorage.setItem("access_token", authResult.accessToken);
    localStorage.setItem("id_token", authResult.idToken);
    localStorage.setItem("expires_at", expiresAt);
    Auth.getProfile();
  }

  public static isAuthenticated() {
    // Check whether the current time is past the 
    // Access Token's expiry time
    const expiresJson = localStorage.getItem("expires_at");
    if (expiresJson === null) {
      return false;
    }
    let expiresAt = JSON.parse(expiresJson);
    return new Date().getTime() < Number(expiresAt);
  }

  // TODO: Replace with permission based logic
  public static isAuthorizedToEdit(workspace: any) {
    return Auth.isAuthenticated();
  }

  public static isAdmin() {
    return localStorage.getItem("is_admin") === "true";
  }

  public static accessToken() {
    return localStorage.getItem("access_token");
  }
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

}
