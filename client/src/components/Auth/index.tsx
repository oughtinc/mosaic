
import * as auth0 from "auth0-js";

export class Auth {

  public static auth0 = new auth0.WebAuth({
    domain: "mosaicapp.auth0.com",
    clientID: "wxJ6gaMkuuoSvLpQpBUZlsbwzDlVjjAu",
    redirectUri: "http://localhost:3000/callback",
    audience: "https://mosaicapp.auth0.com/userinfo",
    responseType: "token id_token",
    scope: "openid",
  });

  public constructor() {
    // this.login = this.login.bind(this);
    // this.logout = this.logout.bind(this);
    // this.handleAuthentication = this.handleAuthentication.bind(this);
    // this.isAuthenticated = this.isAuthenticated.bind(this);
  }

  public static login() {
    Auth.auth0.authorize();
  }

  public static logout() {
    // Clear Access Token and ID Token from local storage
    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    localStorage.removeItem("expires_at");
  }

  public static handleAuthentication() {
    Auth.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        Auth.setSession(authResult);
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

}
