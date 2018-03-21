import { Value } from "slate";
import { ADD_BLOCKS, UPDATE_BLOCK, REMOVE_BLOCKS } from "./actions";
import Plain from "slate-plain-serializer";
import * as uuidv1 from "uuid/v1";
import _ = require("lodash");

export const blockReducer = (state = {blocks: []}, action) => {
    switch (action.type) {
      case ADD_BLOCKS:
        return {
            blocks: [...state.blocks, ...action.blocks.map((block) => {
                const value = block.value ? Value.fromJSON(block.value) : Plain.deserialize("");
                return ({
                    ...block,
                    value,
                });
            })],
        };
      case REMOVE_BLOCKS:
        return {
            blocks: state.blocks.filter((block: any) => (
                !_.includes(action.blockIds, block.id)
            )),
        };
      case UPDATE_BLOCK:
      return {
            ...state, 
            blocks: state.blocks.map((block: any) => {
                if (block.id !== action.id) {
                    return block;
                } else {
                    return ({
                        ...block,
                        value: action.value,
                        pointerChanged: action.pointerChanged,
                    });
                }
            }),
            };
      default:
        return state;
    }
};
