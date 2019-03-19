import { UPDATE_BLOCK } from "../blocks/actions";
import * as slateChangeMutations from "../../slate-helpers/slate-change-mutations";

export const CHANGE_HOVERED_ITEM = "CHANGE_HOVERED_ITEM";
export const CHANGE_POINTER_REFERENCE = "CHANGE_POINTER_REFERENCE";
export const CLOSE_ALL_POINTER_REFERENCES = "CLOSE_ALL_POINTER_REFERENCES";
export const EXPAND_ALL_IMPORTS = "EXPAND_ALL_IMPORTS";

export const HOVER_ITEM_TYPES = {
  NONE: "NONE",
  SELECTED_TEXT: "SELECTED_TEXT",
  POINTER_IMPORT: "POINTER_IMPORT",
  POINTER_EXPORT: "POINTER_EXPORT"
};

export const changeHoverItem = ({
  id,
  hoverItemType,
  top,
  left,
  readOnly,
  blockId
}) => {
  return (dispatch, getState) => {
    dispatch({
      type: CHANGE_HOVERED_ITEM,
      id,
      hoverItemType,
      top,
      left,
      readOnly,
      blockId
    });
  };
};

export const removeHoverItem = () => {
  return (dispatch, getState) => {
    dispatch({
      type: CHANGE_HOVERED_ITEM,
      id: false,
      top: false,
      left: false,
      readOnly: null,
      blockId: false,
      hoverItemType: HOVER_ITEM_TYPES.NONE
    });
  };
};

export const changePointerReference = ({ id, reference, exportId }) => {
  return (dispatch, getState) => {
    dispatch({
      type: CHANGE_POINTER_REFERENCE,
      id,
      reference,
      exportId
    });
  };
};

export const closeAllPointerReferences = () => ({
  type: CLOSE_ALL_POINTER_REFERENCES
});

export const expandAllImports = () => ({
  type: EXPAND_ALL_IMPORTS
});

export const exportSelection = blockId => {
  return async (dispatch, getState) => {
    const { blocks, blockEditor } = await getState();
    const { hoveredItem } = blockEditor;

    const block =
      blocks.blocks.find(b => b.id === blockId || b.id === hoveredItem.blockId);

    if (block) {
      const change = block.value.change();
      slateChangeMutations.insertPointerExport(change);
      slateChangeMutations.normalizeExportSpacing(change);

      dispatch({
        type: UPDATE_BLOCK,
        id: block.id,
        value: change.value,
        pointerChanged: true
      });
    } else {
      console.error("Block was not found from action");
    }
  };
};

export const removeExportOfSelection = blockId => {
  return async (dispatch, getState) => {
    const { blocks, blockEditor } = await getState();
    const { hoveredItem } = blockEditor;

    const block = blocks.blocks.find(b => b.id === blockId || b.id === hoveredItem.blockId);

    if (block) {
      const change = block.value.change();
      slateChangeMutations.removePointerExport({
        change,
        hoveredItem,
        isHoverRemoval: !blockId,
      });
      slateChangeMutations.normalizeAfterRemoval(change);

      dispatch({
        type: UPDATE_BLOCK,
        id: block.id,
        value: change.value
      });

      dispatch({
        type: CHANGE_HOVERED_ITEM,
        hoverItemType: "NONE"
      });
    } else {
      console.error("Block was not found from action");
    }
  };
};
