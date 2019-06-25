import * as _ from "lodash";
import * as React from "react";
import { BlockEditor } from "../../components/BlockEditor";

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

export class SnapshotPresentational extends React.PureComponent<any, any> {
  public render() {
    const {
      children,
      workspace,
      exportLockStatusInfo,
      availablePointers,
    } = this.props.snapshot;

    const visibleExportIds = blocksToExportIds(
      _.flatten([workspace, ...children]),
    );

    return (
      <div>
        {workspace.map(block => (
          <React.Fragment>
            {block.type}
            <div
              style={{
                backgroundColor: "#fff",
                padding: "10px",
                width: "200px",
              }}
            >
              <BlockEditor
                availablePointers={availablePointers}
                exportLockStatusInfo={exportLockStatusInfo}
                name={block.id}
                blockId={block.id}
                readOnly={true}
                initialValue={block.value}
                shouldAutosave={false}
                visibleExportIds={visibleExportIds}
              />
            </div>
          </React.Fragment>
        ))}
        <div style={{ height: "50px" }} />

        {children.map(blocks => (
          <React.Fragment>
            {blocks[0].type}
            <div
              style={{
                backgroundColor: "#fff",
                padding: "10px",
                width: "200px",
              }}
            >
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
            </div>
          </React.Fragment>
        ))}
      </div>
    );
  }
}

export const Snapshot = SnapshotPresentational;
