import { containingPointerExportAncestor } from "../slate-utils/containingPointerExportAncestor";
import { isNestedInExport } from "../slate-utils/isNestedInExport";
import { getInlinesAsArray } from "../slate-utils/getInlinesAsArray";

export function removePointerExport({
  change,
  hoveredItem,
  isHoverRemoval,
}: any) {
  const { value } = change;
  const { document, fragment } = value;

  const idOfPointerToRemove = getIdOfPointerToRemove({
    fragment,
    isHoverRemoval,
    hoveredItemId: hoveredItem.id,
  });

  if (!idOfPointerToRemove) {
    console.error("Text cursor is not currently in an export");
    return;
  }

  const nodeToRemove = findNodeToRemovebyPointerId(
    idOfPointerToRemove,
    document,
  );

  const isNested = isNestedInExport(nodeToRemove, document);

  if (isNested) {
    change
      .unwrapInlineByKey(nodeToRemove.key, {
        data: { pointerId: idOfPointerToRemove },
      })
      .removeNodeByKey(nodeToRemove.key);
  } else {
    change.unwrapInlineByKey(nodeToRemove.key, {
      data: { pointerId: idOfPointerToRemove },
    });
  }
}

function getIdOfPointerToRemove({
  fragment,
  isHoverRemoval,
  hoveredItemId,
}: any) {
  let idOfPointerToRemove;
  if (!isHoverRemoval) {
    idOfPointerToRemove = useFragmentToFindIdOfPointerToRemove(fragment);
  } else {
    idOfPointerToRemove = hoveredItemId;
  }

  return idOfPointerToRemove;
}

function findNodeToRemovebyPointerId(
  pointerIdOfNodeToRemove: string,
  document: any,
) {
  const inlines = getInlinesAsArray(document);

  const matchingNodes = inlines.filter(
    i => i.data.get("pointerId") === pointerIdOfNodeToRemove,
  );

  if (!matchingNodes.length) {
    console.error("Exporting node not found in Redux store");
    return;
  }

  const nodeToRemove = matchingNodes[0];

  return nodeToRemove;
}

function useFragmentToFindIdOfPointerToRemove(fragment: any) {
  let curNode = fragment.nodes.get(0);
  while (curNode.nodes) {
    curNode = curNode.nodes.get(0);
  }

  const containingExport = containingPointerExportAncestor(curNode, fragment);
  if (!containingExport) {
    return undefined;
  }

  const idOfPointerToRemove = containingExport.data.get("pointerId");
  return idOfPointerToRemove;
}
