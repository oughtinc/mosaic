import * as uuidv1 from "uuid/v1";
import { UPDATE_BLOCK } from "../blocks/actions";
import { SPACER } from "../../lib/slate-pointers/exportedPointerSpacer";

export const CHANGE_HOVERED_ITEM = "CHANGE_HOVERED_ITEM";
export const CHANGE_POINTER_REFERENCE = "CHANGE_POINTER_REFERENCE";

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

export const changePointerReference = ({ id, reference }) => {
  return (dispatch, getState) => {
    dispatch({
      type: CHANGE_POINTER_REFERENCE,
      id,
      reference
    });
  };
};

const onlyOneNodeThatIsPointerExport = nodes => {
  return (
    nodes.length === 1
    &&
    nodes[0].type === "pointerExport"
  );
};

const twoNodesFirstExportSecondEmptyString = nodes => {
  return (
    nodes.length === 2
    &&
    nodes[0].type === "pointerExport"
    &&
    nodes[1].object === "text"
    && nodes[1].leaves[0].text === ""
  );
};

const spaceTextNode = {
  object: "text",
  leaves: [
    {
      object: "leaf",
      text: SPACER,
    }
  ]
};

export const exportSelection = () => {
  return async (dispatch, getState) => {
    const { blocks, blockEditor } = await getState();
    const { hoveredItem } = blockEditor;

    const block = blocks.blocks.find(b => b.id === hoveredItem.blockId);

    const uuid = uuidv1();
    if (block) {

      // A Slate fragment is a document: value.fragment is the document
      // encompassing the currently selected portion of the editor.
      // If the user has selected part of a deeply nested node, then the
      // associated fragment will include all levels of the nesting.
      // The next few lines (until the end of the while loop) drill down
      // through such a nested document to unnest all the nodes that are
      // selected.
      const fragment = block.value.fragment;
      const topLevelNodes = fragment.nodes.toJSON()[0].nodes;
      let nodes = topLevelNodes;

      while (
        onlyOneNodeThatIsPointerExport(nodes)
        ||
        twoNodesFirstExportSecondEmptyString(nodes)
      ) {
          nodes = nodes[0].nodes;
        }

      const change = block.value
        .change()
        .insertText(SPACER)
        .insertText(SPACER)
        .collapseToEnd()
        .move(-1)
        .insertInline({
          type: "pointerExport",
          data: { pointerId: uuid },
          nodes: [spaceTextNode, ...nodes, spaceTextNode],
        });

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

function getInlinesAsArray(node: any) {
  let array: any = [];

  node.nodes.forEach(child => {
    if (child.object === "text") {
      return;
    }
    if (child.object === "inline") {
      array.push(child);
    }
    if (!child.isLeafInline()) {
      array = array.concat(getInlinesAsArray(child));
    }
  });

  return array;
}

export const removeExportOfSelection = () => {
  return async (dispatch, getState) => {
    const { blocks, blockEditor } = await getState();
    const { hoveredItem } = blockEditor;

    const block = blocks.blocks.find(b => b.id === hoveredItem.blockId);

    if (block) {
      const inlines = getInlinesAsArray(block.value.document);
      const matchingNodes = inlines.filter(
        i => i.toJSON().data.pointerId === hoveredItem.id
      );
      if (!matchingNodes.length) {
        console.error("Exporting node not found in Redux store");
        return;
      }

      const nodeToRemove = matchingNodes[0];

      let change;
      change = block.value.change();

      // delete spacer at start
      const firstText = nodeToRemove.getFirstText();
      if (firstText && firstText.text.charAt(0) === SPACER) {
        change.removeTextByKey(firstText.key, 0, 1);
      }

      // need to "refetch" nodeToRemove here because it might have relevantly
      // changed after removing the first char of the first text
      // but this change won't be reflected in the node due to immutability

      // delete spacer at end
      const lastText = change.value.document.getNode(nodeToRemove.key).getLastText();
      if (lastText && lastText.text.charAt(lastText.text.length - 1) === SPACER) {
        change.removeTextByKey(lastText.key, lastText.text.length - 1, 1);
      }

      // delete spacer before
      const prevText = block.value.document.getPreviousSibling(nodeToRemove.key);
      if (prevText && prevText.text.charAt(prevText.text.length - 1) === SPACER) {
        change.removeTextByKey(prevText.key, prevText.text.length - 1, 1);
      }

      // delete spacer after
      const nextText = block.value.document.getNextSibling(nodeToRemove.key);
      if (nextText && nextText.text.charAt(0) === SPACER) {
        change.removeTextByKey(nextText.key, 0, 1);
      }

      // remove pointerExport inline

      const ancestorNodes = block.value.document.getAncestors(nodeToRemove.key);
      const isNested = ancestorNodes.find(ancestor => ancestor.type === "pointerExport");

      if (isNested) {
        change
          .unwrapInlineByKey(nodeToRemove.key,  { data: { pointerId: hoveredItem.id } })
          .removeNodeByKey(nodeToRemove.key);
      } else {
        change.unwrapInlineByKey(nodeToRemove.key,  { data: { pointerId: hoveredItem.id } });
      }

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
