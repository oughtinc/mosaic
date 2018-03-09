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

function leavesToPointers(leaves: any) {
    const marks = _.flatten(leaves.map((l) => l.marks));
    const pointerIds = _.uniq(marks.map((m: any) => m.data.pointerId));
    return pointerIds.map((pointerId) => {
        const relevantLeaves = leaves.filter((l) => _.some(l.marks, (m) => m.data.pointerId === pointerId));
        const text = relevantLeaves.map((l) => l.text).join("");
        return (
            {
                pointerId,
                text,
            }

        );
    });

}

export const exportingPointersSelector = createSelector(
    blockSelector,
    (blocks) => {
        const leaves = _.flatten(blocks.map((b) => exportingLeaves(b.value.document)));
        return leavesToPointers(leaves);
    }
);