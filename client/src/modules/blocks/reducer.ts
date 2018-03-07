import { type, Node, Value } from "slate";
import { ADD_BLOCKS, UPDATE_BLOCK } from "./actions";
import Plain from "slate-plain-serializer";
import _ = require("lodash");

export const blockReducer = (state = {blocks: []}, action) => {
    switch (action.type) {
      case ADD_BLOCKS:
        return {
            blocks: action.blocks.map((block) => ({
                ...block,
                value: (block.value ? Value.fromJSON(block.value) : Plain.deserialize("")),
            })),
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
                        return {...block, value: action.value}; 
                    }
                }
            }),
            }}
        );
      default:
        return state;
    }
};
  