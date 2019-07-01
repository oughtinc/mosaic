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

function blocksToExportIds(blocks) {
  const exportIds: any = [];

  for (const block of blocks) {
    console.log("block", block);
    exportIds.push(...getAllExportIdsFromNode(block.value.document));
  }

  return exportIds;
}

function convertActionTypeToHeader(actionType) {
  if (actionType === "INITIALIZE") {
    return "Initialize";
  }

  if (actionType === "DONE") {
    return "Done";
  }

  if (actionType === "WAIT_FOR_ANSWER") {
    return "Wait for Answer";
  }

  if (actionType === "UNLOAD") {
    return "Unload";
  }
  return actionType;
}

function convertBlockTypeToHeader(blockType) {
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
        {workspace.map(block => (
          <React.Fragment>
            <div style={{ width: "350px" }}>
              <BlockContainer>
                <BlockHeader>
                  {convertBlockTypeToHeader(block.type)}
                </BlockHeader>
                <BlockBody>
                  <BlockEditor
                    availablePointers={availablePointers}
                    exportLockStatusInfo={exportLockStatusInfo}
                    name={block.id + Math.random()}
                    blockId={block.id + Math.random()}
                    readOnly={true}
                    initialValue={block.value}
                    shouldAutosave={false}
                    visibleExportIds={visibleExportIds}
                  />
                </BlockBody>
              </BlockContainer>
            </div>
          </React.Fragment>
        ))}
        <div style={{ height: "20px" }} />
        {children.length > 0 && <h4>Subquestions</h4>}
        {children.map(blocks => (
          <React.Fragment>
            <div style={{ width: "350px" }}>
              <BlockContainer>
                <BlockHeader>
                  {convertBlockTypeToHeader(blocks[0].type)}
                </BlockHeader>
                <BlockBody>
                  <BlockEditor
                    availablePointers={availablePointers}
                    exportLockStatusInfo={exportLockStatusInfo}
                    name={blocks[0].id}
                    blockId={blocks[0].id}
                    readOnly={true}
                    initialValue={blocks[0].value}
                    visibleExportIds={visibleExportIds}
                    shouldAutosave={false}
                  />
                </BlockBody>
              </BlockContainer>
              {blocks[1] && (
                <BlockContainer>
                  <BlockHeader>{blocks[1].type}</BlockHeader>
                  <BlockBody>
                    <BlockEditor
                      availablePointers={availablePointers}
                      exportLockStatusInfo={exportLockStatusInfo}
                      name={blocks[1].id}
                      blockId={blocks[1].id}
                      readOnly={true}
                      initialValue={blocks[1].value}
                      visibleExportIds={visibleExportIds}
                      shouldAutosave={false}
                    />
                  </BlockBody>
                </BlockContainer>
              )}
            </div>
          </React.Fragment>
        ))}
      </div>
    );
  }
}

export const Snapshot = SnapshotPresentational;
