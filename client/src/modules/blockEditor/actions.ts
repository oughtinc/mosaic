import * as uuidv1 from "uuid/v1";
import { UPDATE_BLOCK } from "../blocks/actions";

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

export const exportSelection = () => {
  return async (dispatch, getState) => {
    const { blocks, blockEditor } = await getState();
    const { hoveredItem } = blockEditor;

    const block = blocks.blocks.find(b => b.id === hoveredItem.blockId);
    const uuid = uuidv1();
    if (block) {
      const fragment = block.value.fragment;
      const topLevelNodes = fragment.nodes.toJSON()[0].nodes;

      const onlyOneNodeThatIsPointerExport = nodes => {
        return (
          nodes.length === 1
          &&
          nodes[0].type === 'pointerExport'
        );
      }

      const twoNodesFirstExportSecondEmptyString = nodes => {
        return (
          nodes.length === 2
          &&
          nodes[0].type === 'pointerExport'
          &&
          nodes[1].object === 'text'
          && nodes[1].leaves[0].text === ''
        );
      }

      let nodes = topLevelNodes;
      let isNested = false;

      while (
        onlyOneNodeThatIsPointerExport(nodes)
        ||
        twoNodesFirstExportSecondEmptyString(nodes)
      ) {
          nodes = nodes[0].nodes;
          isNested = true;
        }

      const spaceTextNode = {
        object: 'text',
        leaves: [
          {
            object: 'leaf',
            text: ' ',
            marks: [{object: 'mark', type: 'spaceTextNode' }]
          }
        ]
      };

      // if you try to insert to inlines in a row, the second is inserted in the
      // first, couldn't find an easy way around this

      // if you insert text with a mark, though, you should hopefully be able
      // to keep track of it

      let change;
      if (isNested) {
        change = block.value
          .change()
          .insertText(' ')
          .extend(-1)
          .addMark('thinspaceTextNode')
          .collapseToEnd()
          .insertInline({
            type: "pointerExport",
            data: { pointerId: uuid },
            nodes: [...nodes, spaceTextNode],
          });
      } else {

        // for each pointerExport in nodes, remove thinspace text node if its
        // first
        nodes = nodes.map(node => {
          if (node.type === 'pointerExport') {
            return {
              ...node,
              nodes: node.nodes.map(innerNode => {
                if (innerNode.object === 'text') return {
                  ...innerNode,
                  leaves: innerNode.leaves.filter((leaf, leafI) => leafI !== 0 || !leaf.marks.find(mark => mark.type == 'spaceTextNode')),
                };
                else return innerNode;
              }),
            };
          } else {
            return node;
          }
        });

        change = block.value
          .change()
          .insertText(' ')
          .extend(-1)
          .addMark('thinspaceTextNode')
          .collapseToEnd()
          .insertInline({
            type: "pointerExport",
            data: { pointerId: uuid },
            nodes: [spaceTextNode, ...nodes, spaceTextNode],
          });
      }

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


      const ancestorNodes = block.value.document.getAncestors(matchingNodes[0].key);

      const isNested = ancestorNodes.find(ancestor => ancestor.type === 'pointerExport');

      let change;
      if (isNested) {
        change = block.value
          .change()
          .unwrapInlineByKey(matchingNodes[0].key,  { data: { pointerId: hoveredItem.id } })
          .removeNodeByKey(matchingNodes[0].key);
      } else {
        change = block.value
          .change()
          .unwrapInlineByKey(matchingNodes[0].key,  { data: { pointerId: hoveredItem.id } });
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
