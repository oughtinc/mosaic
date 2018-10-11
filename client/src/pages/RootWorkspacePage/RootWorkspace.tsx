import * as React from "react";
import { graphql } from "react-apollo";
import { Button, Checkbox } from "react-bootstrap";
import { Link } from "react-router-dom";
import styled from "styled-components";

import { RootBlock } from "./RootBlock";
import { Auth } from "../../auth";
import { TOGGLE_WORKSPACE_IS_PUBLIC } from "../../graphqlQueries";

import {
  adminCheckboxBgColor,
  adminCheckboxBorderColor,
  homepageWorkspaceBgColor,
  homepageWorkspaceScratchpadFontColor,
  blockBorderAndBoxShadow
} from "../../styles";

const WorkspaceContainer = styled.div`
  ${blockBorderAndBoxShadow};
  background-color: ${homepageWorkspaceBgColor};
  padding: 10px;
`;

const ScratchpadContainer = styled.div`
  color: ${homepageWorkspaceScratchpadFontColor};
`;

const workspaceToBlock = (workspace, blockType) =>
  workspace.blocks && workspace.blocks.find(b => b.type === blockType);

class RootWorkspacePresentational extends React.Component<any, any> {
  public render() {
    const workspace = this.props.workspace;

    const question = workspaceToBlock(workspace, "QUESTION");
    const answer = workspaceToBlock(workspace, "ANSWER");
    const scratchpad = workspaceToBlock(workspace, "SCRATCHPAD");

    return (
      <WorkspaceContainer style={this.props.style}>
        {
          Auth.isAdmin()
          &&
          <div
            style={{
              marginBottom: "5px",
            }}
          >
            <Checkbox
              style={{
                backgroundColor: adminCheckboxBgColor,
                border: `1px solid ${adminCheckboxBorderColor}`,
                borderRadius: "3px",
                padding: "5px 5px 5px 25px",
              }}
              inline={true}
              type="checkbox"
              defaultChecked={workspace.isPublic}
              onChange={() => this.props.toggleWorkspaceIsPublic({
                variables: { workspaceId: workspace.id }
              })}
            >
              appears on front page
            </Checkbox>
          </div>
        }
        <Link to={`/workspaces/${workspace.id}`}>
          <RootBlock
            availablePointers={workspace.connectedPointers}
            block={question}
          />
        </Link>

        {" "}

        <RootBlock
          availablePointers={workspace.connectedPointers}
          block={answer}
        />

        <Link to={`/workspaces/${workspace.id}/subtree`}>
          <Button
            bsSize="xsmall"
            bsStyle="default"
            className="pull-right"
            style={{
              margin: "5px 1px",
              padding: "1px 4px",
            }}
          >
            Tree »
          </Button>
        </Link>

        <ScratchpadContainer>
          <RootBlock
            availablePointers={workspace.connectedPointers}
            block={scratchpad}
          />
        </ScratchpadContainer>

        <div style={{ clear: "both" }} />
      </WorkspaceContainer>
    );
  }
}

const RootWorkspace: any = graphql(TOGGLE_WORKSPACE_IS_PUBLIC, {
  name: "toggleWorkspaceIsPublic",
  options: {
    refetchQueries: ["RootWorkspacesQuery"]
  }
})(RootWorkspacePresentational);

export { RootWorkspace };
