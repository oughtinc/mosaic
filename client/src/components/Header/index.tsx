import * as React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

import { Auth } from "../../auth";

import {
  BrandCSS,
  HeaderContainerCSS,
  HeaderLinkCSS,
} from "../../styles";

const Brand = styled(Link)`${BrandCSS}`;
const HeaderContainer = styled.div`${HeaderContainerCSS}`;
const HeaderLink = styled.a`${HeaderLinkCSS}`;

const ActionLink = ({ action, children }) => (
  <HeaderLink
    href="#"
    onClick={e => {
      action();
      e.preventDefault();
    }}
  >
    {children}
  </HeaderLink>
);

const LogoutLink = () => (
  <ActionLink
    action={() => {
      Auth.logout();
      location.reload(); // HACK
    }}
  >
    Log out
  </ActionLink>
);

const LoginLink = () => (
  <ActionLink
    action={() => {
      Auth.login();
    }}
  >
    Log in
  </ActionLink>
);

const UserControls = () => (
  <div>
    {Auth.isAuthenticated() ? <LogoutLink /> : <LoginLink />}
  </div>
);

const Header = () => (
  <HeaderContainer
    style={{
      marginBottom: "20px",
    }}
  >
    <div className="container">
      <div
        style={{
          alignContent: "center",
          display: "flex",
          justifyContent: "space-between",
          padding: "20px",
        }}
      >
        <Brand to="/">Mosaic v0.2</Brand>
        <div style={{ flex: 1 }} />
        <UserControls />
      </div>
    </div>
  </HeaderContainer>
);

export { Header };
