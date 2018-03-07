export const CHANGE_HOVERED_ITEM = "CHANGE_HOVERED_ITEM";
export const CHANGE_POINTER_REFERENCE = "CHANGE_POINTER_REFERENCE";

export const changeHoverItem = ({id, hoverItemType, top, left}) => {
  return {
    type: CHANGE_HOVERED_ITEM,
    id,
    hoverItemType,
    top,
    left,
  };
};

export const changePointerReference = ({id, reference}) => {
  return {
    type: CHANGE_POINTER_REFERENCE,
    id,
    reference,
  };
};
