import { createSelector } from "reselect";
import _ = require("lodash");

const blockSelector = (state) => state.blocks.blocks;

function allLeaves(node, existing = []) {
    if (node.object === "text") {
        return [...existing, ...node.toJSON().leaves];
    } else {
    return _.flatten(node.nodes.map((n) => allLeaves(n, existing)).toJSON());
    }
}

function exportingLeaves(node: any) {
    const leaves = allLeaves(node);
    const allExports = leaves.filter((b) => _.some(b.marks, ((b) => b.type === "pointerExport"))).map((l) => ({...l, pointerId: l.marks[0].data.pointerId }));
    return allExports;
}

export const exportingLeavesSelector = createSelector(
    blockSelector,
    (blocks) => {
        return _.flatten(blocks.map((b) => exportingLeaves(b.value.document)));
    }
);