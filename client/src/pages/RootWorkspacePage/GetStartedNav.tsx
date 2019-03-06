import * as React from "react";
import styled from "styled-components";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

import { Auth } from "../../auth";

interface NextWorkspaceBtnProps {
  label: string;
}

const NextWorkspaceBtn = ({ label }: NextWorkspaceBtnProps) => {
  return (
    <Link to="/next" style={{ margin: "0 5px" }}>
      <Button bsSize="small">{label} »</Button>
    </Link>
  );
};

const GetStartedNavContainer = styled.div`
  padding: 10px;
  background-color: #b8ddfb;
  border-bottom: 1px solid #c8c8c8;
  text-align: center;
`;

const GetStartedNav = ({ isInOracleMode }) => (
  <GetStartedNavContainer>
    <NextWorkspaceBtn
      label={"Get started!"}
    />
  </GetStartedNavContainer>
);

export { GetStartedNav };
