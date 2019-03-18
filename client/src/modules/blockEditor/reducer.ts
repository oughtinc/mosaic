import { mapValues } from "lodash";
import {
  CHANGE_HOVERED_ITEM,
  CHANGE_POINTER_REFERENCE,
  CLOSE_ALL_POINTER_REFERENCES,
  EXPAND_ALL_IMPORTS,
} from "./actions";

const initialState = {
  hoveredItem: {
    hoverItemType: null,
    id: null,
    top: null,
    left: null,
    readOnly: null,
    blockId: null
  },
  pointerReferences: {}
};
export const blockEditorReducer = (state = initialState, action) => {
  switch (action.type) {
    case CHANGE_HOVERED_ITEM:
      const { id, hoverItemType, top, left, readOnly, blockId } = action;
      return {
        ...state,
        hoveredItem: { id, hoverItemType, top, left, readOnly, blockId }
      };
    case CHANGE_POINTER_REFERENCE:
      return {
        ...state,
        pointerReferences: {
          ...state.pointerReferences,
          ...{ [action.id]: action.reference }
        }
      };
    case CLOSE_ALL_POINTER_REFERENCES:
      return {
        ...state,
        pointerReferences: mapValues(state.pointerReferences, (ref: object) => { return {...ref, isOpen: false }; })
      };
    case EXPAND_ALL_IMPORTS:
      return {
        ...state,
        pointerReferences: mapValues(state.pointerReferences, (ref: object) => { return {...ref, isOpen: true }; }),
      };
    default:
      return state;
  }
};