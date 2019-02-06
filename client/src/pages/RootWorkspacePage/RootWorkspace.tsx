import * as React from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import styled from "styled-components";

import { AdminControls } from "./AdminControls";
import { ExperimentsCheckboxes } from "./ExperimentsCheckboxes";
import { RootBlock } from "./RootBlock";
import { Auth } from "../../auth";

import {
  homepageWorkspaceBgColor,
  homepageWorkspaceScratchpadFontColor,
  blockBorderAndBoxShadow
} from "../../styles";

const WorkspaceContainer = styled.div`
  ${blockBorderAndBoxShadow};
  background-color: ${homepageWorkspaceBgColor};
  display: flex;
  justify-content: space-between;
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
                style={{
                  margin: "5px 1px",
                  padding: "1px 4px",
                }}
              >
                Tree »
              </Button>
            </Link>
            <Link to={`/workspaces/${workspace.id}`}>
              <RootBlock
                block={question}
              />
            </Link>
            <br />
            <ScratchpadContainer>
              <RootBlock
                block={scratchpad}
                defaultText="(no description)"
              />
            </ScratchpadContainer>
            <RootBlock
              block={answer}
            />
          </div>
        </div>
      </WorkspaceContainer>
    );
  }
}

const RootWorkspace: any = RootWorkspacePresentational;

export { RootWorkspace };
