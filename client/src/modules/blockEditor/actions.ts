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

function findTextsWithMark(document: any, markMatchFn: any) {
  return document.getTextsAsArray().filter((t) => t.toJS().leaves.find((e) => e.marks.find(markMatchFn)));
}

function textWithRemovedMarks(text: any, markMatchFn: any) {
  return Text.fromJSON({
    ...text.toJS(),
    leaves: text.toJS().leaves.map((leaf) => ({
          ...leaf,
          marks: leaf.marks.filter((m) => !markMatchFn(m)),
    })),
  });
}

function matchExportPointerFn(pointerId: string) {
  return function(mark: any) {
    return (mark.type === "pointerExport") && (mark.data.pointerId === pointerId);
  };
}

function matchImportPointerFn(internalReferenceId: string) {
  return function(mark: any) {
    return (mark.type === "pointerImport") && (mark.data.internalReferenceId === internalReferenceId);
  };
}

export const removeExportOfSelection = () => {
  return async (dispatch, getState) => {
    const {blocks, blockEditor} = await getState();
    const {hoveredItem} = blockEditor;

    const block = blocks.blocks.find((b) => b.id === hoveredItem.blockId);

    if (block) {
      const matchFn = matchExportPointerFn(hoveredItem.id);
      const relevantText = findTextsWithMark(block.value.document, matchFn)[0];
      const _withRemovedMarks = textWithRemovedMarks(relevantText, matchFn);

      const change = block.value.change().replaceNodeByKey(relevantText.key, _withRemovedMarks);

      dispatch({
        type: UPDATE_BLOCK,
        id: block.id,
        value: change.value,
      });

      dispatch({
        type: CHANGE_HOVERED_ITEM,
        hoverItemType: "NONE",
      });
    } else {
      console.error("Block was not found from action");
    }
  };
};

export const removeImportOfSelection = () => {
  return async (dispatch, getState) => {
    const {blocks, blockEditor} = await getState();
    const {hoveredItem} = blockEditor;

    const block = blocks.blocks.find((b) => b.id === hoveredItem.blockId);
    if (block) {
      const matchFn = matchImportPointerFn(hoveredItem.id);
      const relevantText = findTextsWithMark(block.value.document, matchFn)[0];
      const _withRemovedMarks = Text.fromJSON({
          ...relevantText.toJS(),
          leaves: relevantText.toJS().leaves.filter((l) => l.marks.filter(matchFn).length === 0),
      });

      const change = block.value.change().replaceNodeByKey(relevantText.key, _withRemovedMarks);

      dispatch({
        type: UPDATE_BLOCK,
        id: block.id,
        value: change.value,
      });

      dispatch({
        type: CHANGE_HOVERED_ITEM,
        hoverItemType: "NONE",
      });
    } else {
      console.error("Block was not found from action");
    }
  };
};