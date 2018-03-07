import { CHANGE_HOVERED_ITEM, CHANGE_POINTER_REFERENCE } from "./actions";

const initialState = {
    hoveredItem: { hoverItemType: null, id: null, top: null, left: null},
    pointerReferences: {},
};
export const blockEditorReducer = (state = initialState, action) => {
    switch (action.type) {
        case CHANGE_HOVERED_ITEM:
            const {id, hoverItemType, top, left} = action;
            return {...state, hoveredItem: {id, hoverItemType, top, left}};
        case CHANGE_POINTER_REFERENCE:
          return {
              ...state,
              pointerReferences: {...state.pointerReferences, ...{[action.id]: action.reference}},
        };
        default:
            return state;
    }
};