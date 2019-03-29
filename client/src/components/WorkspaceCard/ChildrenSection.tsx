import * as _ from "lodash";
import styled from "styled-components";
import * as React from "react";

import { WorkspaceCard } from "./index";

import {
  blockBorderAndBoxShadow,
  treeBulletBgColor,
  treeBulletBgColorOnHover,
  treeBulletArrowColor,
  treeBulletArrowColorWhenActive,
} from "../../styles";

const ChildrenContainer = styled.div`
  float: left;
  width: 100%;
`;

const Bullet: any = styled.span`
  ${blockBorderAndBoxShadow};
  float: left;
  background: ${treeBulletBgColor};
  padding: 5px;
  font-size: 12px;
  cursor: pointer;
  margin-left: 9px;
  margin-bottom: 10px;
  border-radius: 2px;
  margin-right: 13px;
  svg {
    color: ${(props: any) => (props.isActive ? treeBulletArrowColorWhenActive : treeBulletArrowColor)};
    margin: 5px 5px 2px 5px;
  }
  &:hover {
    background: ${treeBulletBgColorOnHover};
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
  childrenToggle,
  onChangeToggle,
  parentPointers,
  subtreeTimeSpentData
}) => {
  const childrenIds = _.sortBy(workspace.childWorkspaces, w => Date.parse(w.createdAt)).map(w => w.id);
  if (!!childrenIds.length) {
    return (
      <ChildrenContainer>
        <Bullet isActive={childrenToggle} onClick={onChangeToggle}>
          {childrenToggle ? "hide" : `show ${childrenIds.length} subtree${childrenIds.length !== 1 ? "s" : ""}`}
        </Bullet>
        {childrenToggle && (
          <Collection>
            {childrenIds.map(childId => (
              <ChildContainer key={childId}>
                <WorkspaceCard
                  isTopLevelOfCurrentTree={false}
                  workspaceId={childId}
                  parentPointers={parentPointers}
                  subtreeTimeSpentData={subtreeTimeSpentData}
                />
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
