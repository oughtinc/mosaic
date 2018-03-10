import { createSelector } from "reselect";
import _ = require("lodash");

const blockSelector = (state) => state.blocks.blocks;

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

function inLineMarks(inline: any) {
    return _.flatten(inline.nodes.map((n) => _.flatten(n.leaves.map((l) => l.marks))));
}

function exportingPointerIds(node: any): any[] {
    const isMarkExporting = (mark) => (mark.type === "pointerExport");
    const allUniquePointerIds = (marks) => _.uniq(marks.filter(isMarkExporting).map((m: {data: {pointerId: string}}) => m.data.pointerId));
    if (node.object === "leaf") {
        return allUniquePointerIds(node.marks);
    } else if (node.object === "inline") {
        return allUniquePointerIds(inLineMarks(node));
    } else {
        console.error("Weird object considered: ", node);
        return [];
    }
}

function nodesWithPointer(nodes, pointerId) {
    return nodes.filter((n) => _.some(exportingPointerIds(n), (id) => id === pointerId));
}

function nestedNodes(byNodes: any, allPointerIds: any) {
    const inOrder = _.orderBy(allPointerIds, (pointerId) => nodesWithPointer(byNodes.map((n) => n.node), pointerId).length, ["asc"]);
    console.log("inOrder", byNodes, allPointerIds, inOrder);
}

function parent(pointerId: string, pointers: any) {
    const pointer = pointers.find((p) => p.pointerId === pointerId);
    const withMoreNodes = (_pointer) => (_pointer.nodes.length > pointer.nodes.length);
    const containsAllNodes = (otherPointer) => {
        const nodeContainsPointer = (node: any) => (_.some(node.pointerIds, (id) => id === otherPointer.pointerId));
        return _.every(pointer.nodes.map((n) => nodeContainsPointer(n)));
    };
    const allParents = pointers.filter((p) => containsAllNodes(p)).filter((p) => p.nodes.length > pointer.nodes.length);
    if (!allParents) {
        return false;
    } else {
        return _.minBy(allParents, (p: any) => p.nodes.length);
    }
}

type pointertype = {pointerId: any, nodes?: any, immediateParent?: any, immediateChildren?: any[]};

function replaceChildNodes(pointer: pointertype) {
    let remainingChildPointers = (pointer.immediateChildren || []);
    const originalChildPointersIds = _.map(remainingChildPointers, "pointerId");
    let newNodes: any[] = [];

    for (const childNode of pointer.nodes) {
        const containingChildPointerIds = _.intersection(childNode.pointerIds, originalChildPointersIds);
        const nodeContainsNoChildren = containingChildPointerIds.length === 0;

        if (nodeContainsNoChildren) { newNodes.push(childNode); }

        const hasRemainingChild = _.intersection(containingChildPointerIds, _.map(remainingChildPointers, "pointerId")).length !== 0;
        if (hasRemainingChild) {
            const childPointerToPush = _.find(pointer.immediateChildren, {pointerId: containingChildPointerIds[0]});
            newNodes.push({node: {pointerId: childPointerToPush.pointerId, object: "GeneratedNestedExportNode", data: {pointerId: childPointerToPush.pointerId}}});
            remainingChildPointers = _.without(remainingChildPointers, childPointerToPush);
        }
    }
    return newNodes;
}

function exportingNodes(node: any) {
    const _allTextsAndInlines = allTextsAndInlines(node);
    const byNodes: {node: any, pointerIds: string[]}[] = _allTextsAndInlines.map((node) => ({node, pointerIds: exportingPointerIds(node)})).filter((n) => n.pointerIds.length !== 0);
    const allPointerIds: string[] = _.uniq(_.flatten(byNodes.map((node) => node.pointerIds)));

    let pointers: pointertype[] =  allPointerIds.map((pointerId) => ({pointerId}))
    .map((p) => ({...p, nodes: byNodes.filter((n) => _.some(n.pointerIds, (id) => id === p.pointerId))}));

    pointers = pointers.map((p: any) => ({...p, immediateParent: parent(p.pointerId, pointers) }));
    pointers = pointers.map((p: any) => ({...p, immediateChildren: pointers.filter((otherPointer: any) => (otherPointer.immediateParent && otherPointer.immediateParent.pointerId === p.pointerId))}));
    pointers = pointers.map((p) => ({...p, nodes: replaceChildNodes(p)}));
    pointers = pointers.map((p) => ({...p, nodes: _.map(p.nodes, "node")}));

    return pointers;
}

function exportingPointerIdsToNodes(leaves: any) {
}

export const exportingPointersSelector = createSelector(
    blockSelector,
    (blocks) => {
        const _exportingNodes = _.flatten(blocks.map((b) => exportingNodes(b.value.document)));
        return _exportingNodes;
    }
);