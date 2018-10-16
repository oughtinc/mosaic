import * as React from "react";
import styled from "styled-components";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

interface NextWorkspaceBtnProps {
  label: string;
  navHook: () => void;
}

const NextWorkspaceBtn = ({ label, navHook }: NextWorkspaceBtnProps) => {
  return (
    <Link onClick={navHook} to="/next" style={{ margin: "0 5px" }}>
      <Button bsSize="small">{label} »</Button>
    </Link>
  );
};

const EpisodeNavContainer = styled.div`
  padding: 10px;
  background-color: #b8ddfb;
  border-bottom: 1px solid #c8c8c8;
  text-align: center;
`;

interface EpisodeNavProps {
  updateStaleness: (boolean) => void;
}

const EpisodeNav = ({ updateStaleness }: EpisodeNavProps) => (
  <EpisodeNavContainer>
    <NextWorkspaceBtn
      label="Needs more work"
      navHook={() => updateStaleness(true)}
    />
    <NextWorkspaceBtn
      label="Done for now"
      navHook={() => updateStaleness(false)}
    />
  </EpisodeNavContainer>
);

export { EpisodeNav };
