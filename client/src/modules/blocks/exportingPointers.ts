import { createSelector } from "reselect";
import _ = require("lodash");

const blockSelector = (state) => state.blocks.blocks;

function getInlinesAsArray(node) {
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

export const exportingPointersSelector = createSelector(
    blockSelector,
    (blocks) => {
        const pointers = _.flatten(blocks.map((b) => exportingNodes(b.value.document)));
        return pointers;
    }
);