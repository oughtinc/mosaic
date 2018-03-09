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

function allTextsAndInlines(node, existing = []) {
    if (node.object === "text" || node.object === "inline") {
        if (node.object === "text") {
            return [...existing, ...node.toJSON().leaves];
        } else {
            return [...existing, ...node.toJSON()];
        }
    } else {
    return _.flatten(node.nodes.map((n) => allTextsAndInlines(n, existing)).toJSON());
    }
}

function exportingLeaves(node: any) {
    const leaves = allLeaves(node);
    const allExports = leaves.filter((b) => {
        return _.some(b.marks, ((b) => b.type === "pointerExport"));
    });
    return allExports;
}

function inLineMarks(inline: any) {
    return _.flatten(inline.nodes.map((n) => _.flatten(n.leaves.map((l) => l.marks))));
}

function isExportingLeafOrInline(node: any) {
    const isMarkExporting = (mark) => (mark.type === "pointerExport");
    if (node.object === "leaf") {
        return _.some(node.marks, isMarkExporting);
    } else if (node.object === "inline") {
        return _.some(inLineMarks(node), isMarkExporting);
    } else {
        console.error("Weird object considered: ", node);
        return 0;
    }
}

function exportingPointerIds(node: any) {
    const isMarkExporting = (mark) => (mark.type === "pointerExport");
    const allUniquePointerIds = (marks) => (_.uniq(marks.filter(isMarkExporting).map((m) => m.data.pointerId)));
    if (node.object === "leaf") {
        return allUniquePointerIds(node.marks);
    } else if (node.object === "inline") {
        return allUniquePointerIds(inLineMarks(node));
    } else {
        console.error("Weird object considered: ", node);
        return [];
    }
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

function exportingNodes(node: any) {
    const _allTextsAndInlines = allTextsAndInlines(node);
    const byNodes = _allTextsAndInlines.map((node) => ({node, pointerIds: exportingPointerIds(node)})).filter((n) => n.pointerIds.length !== 0);
    const allPointerIds = _.uniq(_.flatten(byNodes.map((node) => node.pointerIds)));
    return allPointerIds.map((pointerId) => ({
        pointerId,
        nodes: byNodes.filter((n) => _.some(n.pointerIds, (id) => id === pointerId)).map((n) => n.node),
    }));
}

function exportingPointerIdsToNodes(leaves: any) {
}

export const exportingPointersSelector = createSelector(
    blockSelector,
    (blocks) => {
        const _exportingNodes = _.flatten(blocks.map((b) => exportingNodes(b.value.document)));
        console.log(_exportingNodes)
        const leaves = _.flatten(blocks.map((b) => exportingLeaves(b.value.document)));
        // return leavesToPointers(leaves);
        return _exportingNodes;
    }
);