import * as _ from "lodash";
import { createSelector } from "reselect";

const blockSelector = (state) => state.blocks.blocks;

function getInlinesAsArray(node: any) {
  let array: any = [];

  node.nodes.forEach((child) => {
    if (child.object === "text") { return; }
    if (child.object === "inline") {
      array.push(child);
    }
    if (!child.isLeafInline()) {
      array = array.concat(getInlinesAsArray(child));
    }
  });

  return array;
}

function exportingNodes(node: any) {
    const _getInlinesAsArray = getInlinesAsArray(node).map((n) => n.toJSON());
    const pointers =  _getInlinesAsArray.filter((l) => l.type === "pointerExport");
    return pointers;
}

function importingNodes(node: any) {
    const _getInlinesAsArray = getInlinesAsArray(node).map((n) => n.toJSON());
    const pointers =  _getInlinesAsArray.filter((l) => l.type === "pointerImport");
    return pointers;
}

export const exportingPointersSelector = createSelector(
    blockSelector,
    (blocks) => {
        const pointers = _.flatten(blocks.map((b) => exportingNodes(b.value.document)));
        return pointers;
    }
);

export const exportingBlocksPointersSelector = (blockIds) => createSelector(
    blockSelector,
    (blocks) => {
        const relevantBlocks = blocks.filter((b) => _.includes(blockIds, b.id) );
        const pointers = _.flatten(relevantBlocks.map((b) => exportingNodes(b.value.document)));
        return pointers;
    }
);

export const importingPointersSelector = ({block}) => {
    if (!block) { return []; }
    const pointers = importingNodes(block.value.document);
    return pointers;
};
