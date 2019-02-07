import * as React from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import styled from "styled-components";

import { AdminControls } from "./AdminControls";
import { RootBlock } from "./RootBlock";
import { Auth } from "../../auth";

import {
  homepageWorkspaceBgColor,
  blockBorderAndBoxShadow
} from "../../styles";

const WorkspaceContainer = styled.div`
  ${blockBorderAndBoxShadow};
  background-color: ${homepageWorkspaceBgColor};
  display: flex;
  justify-content: space-between;
`;

const workspaceToBlock = (workspace, blockType) =>
  workspace.blocks && workspace.blocks.find(b => b.type === blockType);

class RootWorkspacePresentational extends React.Component<any, any> {
  public render() {
    const workspace = this.props.workspace;

    const question = workspaceToBlock(workspace, "QUESTION");

    return (
      <WorkspaceContainer style={this.props.style}>
        <div style={{flex: "1 0 0px", minWidth: 0}}>
          {
            Auth.isAdmin()
            &&
            <div
              style={{
                backgroundColor: "#fafafa",
                borderBottom: "1px solid #ddd",
                padding: "10px",
              }}
            >
              <span
                style={{
                  color: "#888",
                  display: "inline-block",
                  marginBottom: "5px",
                }}
              >
                {workspace.createdAt}
              </span>
              <AdminControls workspace={workspace} />
            </div>
            
          }
          <div
            style={{ padding: "10px "}}
          >
            <Link to={`/workspaces/${workspace.id}/subtree`}>
              <Button
                bsSize="xsmall"
                bsStyle="default"
                className="pull-right"
              >
                Tree »
              </Button>
            </Link>
            <Link to={`/workspaces/${workspace.id}`}>
              <RootBlock
                block={question}
              />
            </Link>
          </div>
        </div>
      </WorkspaceContainer>
    );
  }
}

const RootWorkspace: any = RootWorkspacePresentational;

export { RootWorkspace };
