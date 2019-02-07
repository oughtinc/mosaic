import * as React from "react";
import styled from "styled-components";

import { ReadableDuration } from "../ReadableDuration";

import { RootBlock } from "../../pages/RootWorkspacePage/RootBlock";

import {
  blockBorderAndBoxShadow,
  blockBodyCSS,
} from "../../styles";

const BlockContainer = styled.div`
  ${blockBorderAndBoxShadow};
`;

const BlockBody = styled.div`
  ${blockBodyCSS};
`;

const workspaceToBlock = (workspace, blockType) =>
  workspace.blocks && workspace.blocks.find(b => b.type === blockType);

export class UserActivityWorkspaceReport extends React.Component<any, any> {
  public render() {
    const { assignment } = this.props;

    const workspace = assignment.workspace;
    const question = workspaceToBlock(workspace, "QUESTION");

    return (
      <div
        style={{
          alignItems: "center",
          display: "flex",
          marginBottom: "30px",
          maxWidth: "500px"
        }}
      >
        <div
          style={{
            paddingRight: "10px",
            textAlign: "right",
            width: "120px"
          }}
        >
          <ReadableDuration
            durationInMs={assignment.howLongDidAssignmentLast}
            numberFontSize="18px"
          />
        </div>
        <div
          style={{
            flexGrow: 1,
            position: "relative"
          }}
        >
          <BlockContainer>
            <BlockBody>
              <RootBlock
                block={question}
                shouldTurnExportsIntoImports={true}
                style={{ maxWidth: "358px" }}
              />
            </BlockBody>
          </BlockContainer>
          <div
            style={{
              bottom: "-20px",
              color: "#888",
              left: "10px",
              position: "absolute"
            }}
          >
            <span style={{ color: "#666" }}>
              {assignment.totalUsersWhoHaveWorkedOnWorkspace - 1}
            </span>{" "}
            other user
            {assignment.totalUsersWhoHaveWorkedOnWorkspace - 1 !== 1
              ? "s"
              : ""}{" "}
            {assignment.totalUsersWhoHaveWorkedOnWorkspace - 1 !== 1
              ? "have"
              : "has"}{" "}
            worked on this workspace
          </div>
        </div>
      </div>
    );
  }
}
