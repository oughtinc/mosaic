import { CHANGE_HOVERED_ITEM } from "./actions";

export const blockEditorReducer = (state = { hoveredItem: { hoverItemType: null, id: null } }, action) => {
    switch (action.type) {
        case CHANGE_HOVERED_ITEM:
            const {id, hoverItemType, top, left} = action;
            return {...state, hoveredItem: {id, hoverItemType, top, left}};
        default:
            return state;
    }
};