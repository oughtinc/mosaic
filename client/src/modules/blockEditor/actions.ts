import * as uuidv1 from "uuid/v1";
import { UPDATE_BLOCK } from "../blocks/actions";
import { Text } from "slate";

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

export const removeExportOfSelection = () => {
  return async (dispatch, getState) => {
    const {blocks, blockEditor} = await getState();
    const {hoveredItem} = blockEditor;

    const block = blocks.blocks.find((b) => b.id === hoveredItem.blockId);
    if (block) {
      const _blocks = (block.value.document.getBlocksAsArray());
      const relevantText = block.value.document.getTextsAsArray().find((t) => t.toJS().leaves.find((e) => e.marks.find((m) => m.data.pointerId === hoveredItem.id && m.type === "pointerExport")));
      const leaves = relevantText.toJS().leaves.map((l) => {
        return {
          ...l,
          marks: l.marks.filter((m) => m.data.pointerId !== hoveredItem.id),
        };
      });
      console.log(relevantText, leaves);

      const change = block.value.change().replaceNodeByKey(relevantText.key, Text.fromJSON({...relevantText, leaves}));
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