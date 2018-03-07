export const CHANGE_HOVERED_ITEM = "CHANGE_HOVERED_ITEM";

export const changeHoverItem = ({id, hoverItemType, top, left}) => {
  return {
    type: CHANGE_HOVERED_ITEM,
    id,
    hoverItemType,
    top,
    left,
  };
};
