import * as _ from "lodash";
import * as React from "react";
import styled from "styled-components";
import { BlockEditor } from "./BlockEditor";

import {
  blockBorderAndBoxShadow,
  blockHeaderCSS,
  blockBodyCSS,
} from "../styles";

const BlockContainer = styled.div`
  ${blockBorderAndBoxShadow};
  margin-bottom: 25px;
`;

const BlockBody = styled.div`
  ${blockBodyCSS};
`;

const BlockHeader = styled.div`
  ${blockHeaderCSS};
`;

function getAllExportIdsFromNode(node: any) {
  const exportIds: any = [];

  if (node.type && node.type === "pointerExport") {
    exportIds.push(node.data.pointerId);
  }

  if (node.nodes) {
    for (const childNode of node.nodes) {
      console.log("childNode", childNode);
      exportIds.push(...getAllExportIdsFromNode(childNode));
    }
  }

  return exportIds;
}

function blocksToExportIds(blocks: any) {
  const exportIds: any = [];

  for (const block of blocks) {
    console.log("block", block);
    exportIds.push(...getAllExportIdsFromNode(block.value.document));
  }

  return exportIds;
}

function convertActionTypeToHeader(actionType: string) {
  if (actionType === "INITIALIZE") {
    return "Initialize";
  }

  if (actionType === "DONE") {
    return "Done";
  }

  if (actionType === "WAIT_FOR_ANSWER") {
    return "Wait for Answer";
  }

  if (actionType === "NEEDS_MORE_WORK") {
    return "Needs more work";
  }

  if (actionType === "SUBMIT_ANSWER_CANDIDATE") {
    return "Submit answer candidate";
  }

  if (actionType === "DECLINE_TO_CHALLENGE") {
    return "Decline to challenge";
  }

  if (actionType === "SELECT_A1") {
    return "Select A1";
  }

  if (actionType === "SELECT_A2") {
    return "Select A2";
  }

  if (actionType === "UNLOAD") {
    return "Unload";
  }
  return actionType;
}

function convertBlockTypeToHeader(blockType: string) {
  if (blockType === "QUESTION") {
    return "Question";
  }

  if (blockType === "SCRATCHPAD") {
    return "Scratchpad";
  }

  if (blockType === "ANSWER_DRAFT") {
    return "Answer Draft";
  }

  if (blockType === "SUBQUESTION_DRAFT") {
    return "Subquestion Draft";
  }

  if (blockType === "ORACLE_ANSWER_CANDIDATE") {
    return "Answer Candidate";
  }

  return blockType;
}

export class SnapshotPresentational extends React.PureComponent<any, any> {
  public render() {
    const { actionType, snapshot } = this.props.snapshot;

    console.log("Snapshot props", actionType);

    const {
      children,
      workspace,
      exportLockStatusInfo,
      availablePointers,
    } = snapshot;

    const visibleExportIds = blocksToExportIds(
      _.flatten([workspace, ...children]),
    );

    return (
      <div>
        <h3>{convertActionTypeToHeader(actionType)}</h3>
        {workspace.map((block, i) => (
          <React.Fragment key={i}>
            <div>
              <BlockContainer>
                <BlockHeader>
                  {convertBlockTypeToHeader(block.type)}
                </BlockHeader>
                <BlockBody>
                  <BlockEditor
                    dontRemoveBlocksOnUnount={true}
                    availablePointers={availablePointers}
                    exportLockStatusInfo={exportLockStatusInfo}
                    name={String(block.id) + String(Math.random())}
                    blockId={String(block.id) + String(Math.random())}
                    readOnly={true}
                    initialValue={block.value}
                    shouldAutosave={false}
                    visibleExportIds={visibleExportIds}
                    isUserOracle={this.props.isOracleWorkspace}
                  />
                </BlockBody>
              </BlockContainer>
            </div>
          </React.Fragment>
        ))}
        <div style={{ height: "20px" }} />
        {children.length > 0 && children[0][0] && <h4>Subquestions</h4>}
        {children.map(
          (blocks, i) =>
            blocks[0] && (
              <React.Fragment key={i}>
                <div>
                  <BlockContainer>
                    <BlockHeader>
                      {convertBlockTypeToHeader(blocks[0].type)}
                    </BlockHeader>
                    <BlockBody>
                      <BlockEditor
                        dontRemoveBlocksOnUnount={true}
                        availablePointers={availablePointers}
                        exportLockStatusInfo={exportLockStatusInfo}
                        name={blocks[0].id}
                        blockId={blocks[0].id}
                        readOnly={true}
                        initialValue={blocks[0].value}
                        visibleExportIds={visibleExportIds}
                        shouldAutosave={false}
                        isUserOracle={this.props.isOracleWorkspace}
                      />
                    </BlockBody>
                  </BlockContainer>
                  {blocks[1] && (
                    <BlockContainer style={{ marginLeft: "40px" }}>
                      <BlockHeader>Answer</BlockHeader>
                      <BlockBody>
                        <BlockEditor
                          dontRemoveBlocksOnUnount={true}
                          availablePointers={availablePointers}
                          exportLockStatusInfo={exportLockStatusInfo}
                          name={blocks[1].id}
                          blockId={blocks[1].id}
                          readOnly={true}
                          initialValue={blocks[1].value}
                          visibleExportIds={visibleExportIds}
                          shouldAutosave={false}
                          isUserOracle={this.props.isOracleWorkspace}
                        />
                      </BlockBody>
                    </BlockContainer>
                  )}
                </div>
              </React.Fragment>
            ),
        )}
      </div>
    );
  }
}

export const Snapshot = SnapshotPresentational;
