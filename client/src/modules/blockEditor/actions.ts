import * as uuidv1 from "uuid/v1";
import { UPDATE_BLOCK } from "../blocks/actions";

export const CHANGE_HOVERED_ITEM = "CHANGE_HOVERED_ITEM";
export const CHANGE_POINTER_REFERENCE = "CHANGE_POINTER_REFERENCE";

export const changeHoverItem = ({ id, hoverItemType, top, left, blockId }) => {
  return (dispatch, getState) => {
    dispatch({
      type: CHANGE_HOVERED_ITEM,
      id,
      hoverItemType,
      top,
      left,
      blockId,
    });
  };
};

export const changePointerReference = ({ id, reference }) => {
  return (dispatch, getState) => {
    dispatch({
      type: CHANGE_POINTER_REFERENCE,
      id,
      reference,
    });
  };
};

export const exportSelection = () => {
  return async (dispatch, getState) => {
    const {blocks, blockEditor} = await getState();
    const {hoveredItem} = blockEditor;

    const block = blocks.blocks.find((b) => b.id === hoveredItem.blockId);
    const uuid = uuidv1();
    if (block) {
      const change = block.value.change().addMark({ type: "pointerExport", object: "mark", data: { pointerId: uuid } });
      dispatch({
        type: UPDATE_BLOCK,
        id: block.id,
        value: change.value,
      });
    } else {
      console.error("Block was not found from action");
    }
  };
};
