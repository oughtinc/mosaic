import { type, Node, Value } from "slate";
import { ADD_BLOCKS, UPDATE_BLOCK } from "./actions";
import Plain from "slate-plain-serializer";
import _ = require("lodash");

import { Block, Mark } from "slate";

function allLeaves(node, existing= []) {
    if (node.object === "text") {
        return [...existing, ...node.toJSON().leaves];
    } else {
        return _.flatten(node.nodes.map((n) => allLeaves(n, existing)).toJSON());
    }
}

function markedLeaves(node) {
    let marks = [];
    const leaves = allLeaves(node);
    return leaves.filter((l) => l.marks.length > 0);
}

function allUniqueMarks(node) {
    let marks = [];
    const leaves = allLeaves(node);
    const flattenedMarks = (_.flatten(leaves.map((l) => l.marks)), _.isEqual);
}

export const blockReducer = (state = {blocks: []}, action) => {
    switch (action.type) {
      case ADD_BLOCKS:
        return {
            blocks: action.blocks.map((block) => {
                const value = block.value ? Value.fromJSON(block.value) : Plain.deserialize("");
                return ({
                    ...block,
                    value,
                    marks: allUniqueMarks(value.document),
                });
            }),
        };
      case UPDATE_BLOCK:
        return Object.assign({...state, ...{
            blocks: state.blocks.map((block: any) => {
                if (block.id !== action.id) {
                    return block;
                } else {
                    if (_.isEqual(action.value, block.value)) {
                        return block;
                    } else {
                        let nodes = [];
                        const marks = allUniqueMarks(action.value.document);
                        return {
                            ...block,
                            value: action.value,
                            marks: allUniqueMarks(action.value.document),
                        }; 
                    }
                }
            }),
            }}
        );
      default:
        return state;
    }
};
  