import * as _ from "lodash";
import { POINTER_EDGE_SPACE } from "../../lib/slate-pointers/exportedPointerSpacer";

export function inputCharCountSelector({
  state,
  inputBlockIds,
  connectedPointers,
  exportingPointers,
  visibleExportIds,
  exportLockStatusInfo,
}: any) {
  const blocks = state.blocks.blocks;
  const relevantBlocks = blocks.filter(b => _.includes(inputBlockIds, b.id));

  const charCount: number = relevantBlocks.reduce((acc: number, b) => {
    return acc + getInputCharCount(b.value.document.toJSON());
  }, 0);

  connectedPointers = connectedPointers.filter(p => {
    const e = exportingPointers.find(e => e.data.pointerId === p.data.pointerId);
    if (e) {
      return false;
    }
    return true;
  });

  const unlockedExports = connectedPointers.filter(p =>
    (
      exportLockStatusInfo.find(lock => lock.pointerId === p.data.pointerId)
      &&
      !exportLockStatusInfo.find(lock => lock.pointerId === p.data.pointerId).isLocked
    )
  );

  const unlockedExportsCharCount: number = unlockedExports.reduce((acc: number, e) => {
    return acc + getInputCharCount(e);
  }, 0);

  return charCount + unlockedExportsCharCount;
}

export function outputCharCountSelector(state: any, blockIds: string[]) {
  const blocks = state.blocks.blocks;
  const relevantBlocks = blocks.filter(b => _.includes(blockIds, b.id));

  const charCount: number = relevantBlocks.reduce((acc: number, b) => {
    return acc + getOutputCharCount(b.value.document.toJSON());
  }, 0);

  return charCount;
}

export function getInputCharCount(nodeOrNodes: any): number {
  let nodes;
  if (Array.isArray(nodeOrNodes)) {
    nodes = nodeOrNodes;
  } else {
    nodes = nodeOrNodes.nodes;
  }

  let result = 0;

  for (const node of nodes) {
    if (node.object === "text") {
      result += node
        .leaves
        .reduce((acc: string, val) => { return `${acc}${val.text}`; }, "")
        .split("")
        .filter(char => char !== POINTER_EDGE_SPACE)
        .length;
    } else if (node.type === "pointerImport") {
      result += 1;
    } else if (
      node.type !== "pointerExport"
      &&
      node.nodes
    ) {
      result += getInputCharCount(node.nodes);
    }
  }

  return result;
}

function getOutputCharCount(nodeOrNodes: any) {
  let nodes;
  if (Array.isArray(nodeOrNodes)) {
    nodes = nodeOrNodes;
  } else {
    nodes = nodeOrNodes.nodes;
  }

  let result = 0;

  for (const node of nodes) {
    if (node.object === "text") {
      result += node
        .leaves
        .reduce((acc: string, val) => { return `${acc}${val.text}`; }, "")
        .split("")
        .filter(char => char !== POINTER_EDGE_SPACE)
        .length;
    } else if (node.type === "pointerImport") {
      result += 1;
    } else if (node.nodes) {
      result += getOutputCharCount(node.nodes);
    }
  }

  return result;
}
