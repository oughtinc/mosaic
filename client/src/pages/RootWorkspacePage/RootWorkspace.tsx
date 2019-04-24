import * as React from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import styled from "styled-components";

import { AdminControls } from "./AdminControls";
import { RootBlock } from "./RootBlock";
import { Auth } from "../../auth";

import {
  homepageWorkspaceBgColor,
  blockBorderAndBoxShadow,
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
  public state = {
    isShowingAdminControls: false,
  };

  public render() {
    const workspace = this.props.workspace;
    const question = workspaceToBlock(workspace, "QUESTION");

    return (
      <WorkspaceContainer style={this.props.style}>
        <div style={{ width: "100%" }}>
          {Auth.isAdmin() && (
            <div
              style={{
                backgroundColor: "#fafafa",
                borderBottom: "1px solid #ddd",
                padding: "10px",
              }}
            >
              <Button
                bsSize="xsmall"
                onClick={() =>
                  this.setState({
                    isShowingAdminControls: !this.state.isShowingAdminControls,
                  })
                }
                style={{
                  marginBottom: this.state.isShowingAdminControls && "10px",
                }}
              >
                {this.state.isShowingAdminControls ? "hide" : "show"} admin
                controls
              </Button>
              {this.state.isShowingAdminControls && (
                <AdminControls
                  refetchQueries={this.props.sourceQueries}
                  workspace={workspace}
                />
              )}
            </div>
          )}
          <div
            style={{
              alignItems: "center",
              display: "flex",
              justifyContent: "space-between",
              padding: "10px",
              maxWidth: "100%",
            }}
          >
            <div
              style={{
                paddingRight: "50px",
                marginRight: "-50px",
                maxWidth: "100%",
              }}
            >
              <Link
                to={`/workspaces/${workspace.id}/${
                  workspace.canShowCompactTreeView
                    ? "compactTree"
                    : "subtree?expanded=true"
                }`}
              >
                <RootBlock
                  block={question}
                  style={{
                    verticalAlign: "middle",
                  }}
                />
              </Link>
            </div>
            <div>
              <Link to={`/workspaces/${workspace.id}/subtree`}>
                <Button bsSize="xsmall" bsStyle="default">
                  Tree »
                </Button>
              </Link>
              &nbsp;
              <Link to={`/workspaces/${workspace.id}`}>
                <Button bsSize="xsmall" bsStyle="default">
                  Workspace »
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </WorkspaceContainer>
    );
  }
}

const RootWorkspace: any = RootWorkspacePresentational;

export { RootWorkspace };
