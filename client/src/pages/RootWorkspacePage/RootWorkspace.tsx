import * as React from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import styled from "styled-components";

import { RootBlock } from "./RootBlock";

import {
  homepageWorkspaceBgColor,
  homepageWorkspaceBorderColor,
  homepageWorkspaceScratchpadFontColor,
} from "../../styles";

const WorkspaceContainer = styled.div`
  background-color: ${homepageWorkspaceBgColor};
  border: 1px solid ${homepageWorkspaceBorderColor};
  padding: 1px 4px;
`;

const ScratchpadContainer = styled.div`
  color: ${homepageWorkspaceScratchpadFontColor};
`;

const workspaceToBlock = (workspace, blockType) =>
  workspace.blocks && workspace.blocks.find(b => b.type === blockType);

const RootWorkspace = ({ style, workspace }) => {
  const question = workspaceToBlock(workspace, "QUESTION");
  const answer = workspaceToBlock(workspace, "ANSWER");
  const scratchpad = workspaceToBlock(workspace, "SCRATCHPAD");

  return (
    <WorkspaceContainer style={style}>
      <Link to={`/workspaces/${workspace.id}`}>
        <RootBlock
          availablePointers={workspace.connectedPointers}
          block={question}
        />
      </Link>

      <RootBlock
        availablePointers={workspace.connectedPointers}
        block={answer}
      />

      <Link to={`/workspaces/${workspace.id}/subtree`}>
        <Button
          className="pull-right"
          style={{
            margin: "5px 1px",
            padding: "1px 4px",
          }}
        >
          Tree
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
};

export { RootWorkspace };
