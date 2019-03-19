import { mapValues } from "lodash";
import {
  CHANGE_HOVERED_ITEM,
  CHANGE_POINTER_REFERENCE,
  CLOSE_ALL_POINTER_REFERENCES,
  EXPAND_ALL_IMPORTS,
} from "./actions";

interface InitialStateType {
  hoveredItem: any;
  pointerReferences: any;
  exportsOpened: string[];
}

const initialState: InitialStateType = {
  hoveredItem: {
    hoverItemType: null,
    id: null,
    top: null,
    left: null,
    readOnly: null,
    blockId: null
  },
  pointerReferences: {},
  exportsOpened: [],
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
      const { exportId } = action;
      return {
        ...state,
        pointerReferences: {
          ...state.pointerReferences,
          ...{ [action.id]: action.reference }
        },
        exportsOpened: state.exportsOpened.indexOf(exportId) > - 1 ? state.exportsOpened : [...state.exportsOpened, action.exportId]
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
        exportsOpened: [],
      };
    default:
      return state;
  }
};