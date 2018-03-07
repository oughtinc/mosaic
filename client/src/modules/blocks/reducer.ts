import { type, Node, Value } from "slate";
import { ADD_BLOCKS, UPDATE_BLOCK } from "./actions";
import Plain from "slate-plain-serializer";
import _ = require("lodash");

import { Block, Mark } from "slate";

// Note for the future: block.value.document.getOrderedMarks().
function allLeaves(node, existing= []) {
    if (node.object === "text") {
        return [...existing, ...node.toJSON().leaves];
    } else {
        return _.flatten(node.nodes.map((n) => allLeaves(n, existing)).toJSON());
    }
}

function markedLeaves(node: any) {
    let marks = [];
    const leaves = allLeaves(node);
    return leaves.filter((l) => l.marks.length > 0);
}

function exportingLeaves(node: any) {
    const leaves = allLeaves(node);
    const allExports = leaves.filter((b) => _.some(b.marks, ((b) => b.type === "pointerExport"))).map((l) => ({...l, pointerId: l.marks[0].data.pointerId }));
    return allExports;
}

function allUniqueMarks(node: any) {
    let marks = [];
    const leaves = allLeaves(node);
    const flattenedMarks = _.flatten(leaves.map((l) => l.marks));
    return flattenedMarks;
}

export const blockReducer = (state = {blocks: []}, action) => {
    switch (action.type) {
      case ADD_BLOCKS:
        return {
            blocks: action.blocks.map((block) => {
                const value = block.value ? Value.fromJSON(block.value) : Plain.deserialize("");
                const marks = allUniqueMarks(value.document);
                return ({
                    ...block,
                    value,
                    marks,
                    exportingLeaves: exportingLeaves(value.document),
                });
            }),
        };
      case UPDATE_BLOCK:
        return {
            ...state, 
            blocks: state.blocks.map((block: any) => {
                if (block.id !== action.id) {
                    return block;
                } else {
                    if (_.isEqual(action.value, block.value)) {
                        return block;
                    } else {
                        let nodes = [];
                        const leaves = markedLeaves(action.value.document);
                        const marks = allUniqueMarks(action.value.document);
                        const newBlock = {
                            ...block,
                            value: action.value,
                            marks: allUniqueMarks(action.value.document),
                            exportingLeaves: exportingLeaves(action.value.document),
                        };
                        return newBlock;
                    }
                }
            }),
            };
      default:
        return state;
    }
};
  
