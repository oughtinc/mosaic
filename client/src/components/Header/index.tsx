import * as React from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import styled from "styled-components";

import { Auth } from "../../auth";

const HeaderContainer = styled.div`
  background-color: #337ab7;
  padding: 20px;
  margin: 0 0 20px 0;
  color: #fff;
`;

const HeaderContentContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
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

const UserControlsContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const Brand = () => (
  <div className="Brand">
    <BrandLink to="/">Mosaic v0.1</BrandLink>
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

const NextWorkspaceBtn = () => {
  if (Auth.isAuthenticated()) {
    return (
      <Link to="/next">
        <Button bsSize="small">Get Next Workspace »</Button>
      </Link>
    );
  } else {
    return null;
  }
};

const UserControls = () => {
  if (Auth.isAuthenticated()) {
    return (
      <UserControlsContainer>
        <LogoutLink />
      </UserControlsContainer>
    );
  } else {
    return (
      <LoginLink />
    );
  }
};

const Header = () => (
    <HeaderContainer>
      <div className="container">
        <HeaderContentContainer>
          <Brand />
          <NextWorkspaceBtn />
          <UserControls />
        </HeaderContentContainer>
      </div>
    </HeaderContainer>
);

export { Header };
