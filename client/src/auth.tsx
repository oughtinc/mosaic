import * as auth0 from "auth0-js";
// Note: uses local storage instead of redux to persist across sessions
// May consider alternate architecture ie through the redux-localstorage package
import { Config } from "./config";

export class Auth {
  public static auth0 = new auth0.WebAuth({
    domain: "mosaicapp.auth0.com",
    clientID: Config.auth0_client_id,
    redirectUri: Auth.redirectUri(),
    audience: "https://mosaicapp.auth0.com/userinfo",
    responseType: "token",
    scope: "openid user_metadata app_metadata"
  });

  public static login(): void {
    localStorage.setItem("mosaic_auth0_url", window.location.href);
    Auth.auth0.authorize();
  }

  public static getPreAuthUrl(): string {
    return localStorage.getItem("mosaic_auth0_url") || window.location.href;
  }

  public static logout(): void {
    // Clear Access Token and ID Token from local storage
    localStorage.removeItem("access_token");
    localStorage.removeItem("expires_at");
    localStorage.removeItem("is_admin");
    localStorage.removeItem("user_id");
  }

  public static handleAuthentication(callback: () => void): void {
    if (Auth.isAuthenticated()) {
      return;
    }
    Auth.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken) {
        const expiresAt = JSON.stringify(
          authResult.expiresIn * 1000 + new Date().getTime()
        );
        localStorage.setItem("access_token", authResult.accessToken);
        localStorage.setItem("expires_at", expiresAt);

        Auth.getProfile(callback);
      } else if (err) {
        console.error("Authentication error: ", err);
        callback();
      }
    });
  }

  public static getProfile(callback: () => void): void {
    const root = "https://mosaic:auth0:com/";

    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      callback();
      throw new Error("Access token must exist to fetch profile");
    }

    Auth.auth0.client.userInfo(accessToken, (err, profile) => {
      if (err) {
        console.error("Error retrieving user info: ", err);
        callback();
        return;
      }
      const appMetadata = profile[root + "app_metadata"];
      if (appMetadata != null && appMetadata.is_admin != null) {
        localStorage.setItem("is_admin", appMetadata.is_admin);
      }
      localStorage.setItem("user_id", profile.sub);
      callback();
    });
  }

  public static isAuthenticated(): boolean {
    // Check whether the current time is past the
    // Access Token's expiry time
    const expiresJson = localStorage.getItem("expires_at");
    if (expiresJson === null) {
      return false;
    }
    const expiresAt = JSON.parse(expiresJson);
    const isExpired = new Date().getTime() > Number(expiresAt);
    if (isExpired) {
      Auth.logout();
      return false;
    }

    return true;
  }

  public static isAuthorizedToEditWorkspace(workspace?: any): boolean {
    return Auth.isAuthenticated();
    /*
    if (workspace == null) {
      return false;
    }

    if (workspace.isPublic) {
      return Auth.isAdmin() || workspace.creatorId === Auth.userId();
    } else {
      return Auth.isAuthenticated();
    }
    */
  }

  public static isAdmin(): boolean {
    if (!Auth.isAuthenticated()) {
      return false;
    }
    return localStorage.getItem("is_admin") === "true";
  }

  public static accessToken(): string | null {
    return localStorage.getItem("access_token");
  }

  public static userId(): string | null {
    return localStorage.getItem("user_id");
  }

  private static redirectUri(): string {
    return `${window.location.origin}/authCallback`;
  }
}
