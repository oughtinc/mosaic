import * as React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

import { Auth } from "../../auth";

const HeaderContainer = styled.div`
  background-color: #137a9a;
  padding: 20px;
  margin: 0 0 20px 0;
  color: #fff;
`;

const headerLinkStyle = `
  color: #fff;

  &:hover,
  &:active,
  &:visited {
    color: #fff;
  }
`;

const BrandLink = styled(Link)`
  ${headerLinkStyle};
  font-weight: bold;
`;
const HeaderA = styled.a`
  ${headerLinkStyle};
`;

const Brand = () => (
  <div className="Brand">
    <BrandLink to="/">Mosaic</BrandLink>
  </div>
);

const ActionLink = ({ action, children }) => (
  <HeaderA
    href="#"
    onClick={e => {
      action();
      e.preventDefault();
    }}
  >
    {children}
  </HeaderA>
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

const UserControlsContainer = styled.div`
  position: absolute;
  right: 20px;
  top: 20px;
`;

const UserControls = () => (
  <UserControlsContainer>
    {Auth.isAuthenticated() ? <LogoutLink /> : <LoginLink />}
  </UserControlsContainer>
);

const Header = () => (
  <HeaderContainer>
    <Brand />
    <UserControls />
  </HeaderContainer>
);

export { Header };
