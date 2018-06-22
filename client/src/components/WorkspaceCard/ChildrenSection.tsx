import styled from "styled-components";
import * as React from "react";
import FontAwesomeIcon = require("@fortawesome/react-fontawesome");
import faLongArrowAltRight = require("@fortawesome/fontawesome-free-solid/faLongArrowAltRight");

import { WorkspaceCard } from "./index";

const ChildrenContainer = styled.div`
  float: left;
  width: 100%;
`;

const Bullet: any = styled.a`
  float: left;
  background: #f2f2f2;
  margin-left: 9px;
  margin-bottom: 10px;
  border-radius: 2px;
  margin-right: 13px;
  svg {
    color: ${(props: any) => (props.isActive ? "#999" : "#c3c3c3")};
    margin: 5px 5px 2px 5px;
  }
  &:hover {
    background: #e6e6e6;
  }
`;

const Collection = styled.div`
  float: left;
  width: calc(100% - 100px);
  display: flex;
  flex-direction: column;
`;

const ChildContainer = styled.div`
  flex: 1;
`;

export const ChildrenSection = ({
  workspace,
  workspaces,
  childrenToggle,
  onChangeToggle
}) => {
  const children = workspace.childWorkspaceOrder.map(id =>
    workspaces.find(w => w.id === id)
  );
  if (!!children.length) {
    return (
      <ChildrenContainer>
        <Bullet href="#!" isActive={childrenToggle} onClick={onChangeToggle}>
          <FontAwesomeIcon icon={faLongArrowAltRight} />
        </Bullet>
        {childrenToggle && (
          <Collection>
            {children.map(child => (
              <ChildContainer key={child.id}>
                <WorkspaceCard workspaceId={child.id} />
              </ChildContainer>
            ))}
          </Collection>
        )}
      </ChildrenContainer>
    );
  } else {
    return <div />;
  }
};
