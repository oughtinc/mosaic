import { Change } from "../../components/BlockEditor/types";

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

export function removePointerExport(change: Change, hoveredItem: any) {
  const value = change.value;
  const inlines = getInlinesAsArray(value.document);
  const matchingNodes = inlines.filter(
    i => i.toJSON().data.pointerId === hoveredItem.id
  );
  if (!matchingNodes.length) {
    console.error("Exporting node not found in Redux store");
    return;
  }

  const nodeToRemove = matchingNodes[0];

  // remove pointerExport inline
  const ancestorNodes = value.document.getAncestors(nodeToRemove.key);
  const isNested = ancestorNodes.find(ancestor => ancestor.type === "pointerExport");

  if (isNested) {
    change
      .unwrapInlineByKey(nodeToRemove.key,  { data: { pointerId: hoveredItem.id } })
      .removeNodeByKey(nodeToRemove.key);
  } else {
    change.unwrapInlineByKey(nodeToRemove.key,  { data: { pointerId: hoveredItem.id } });
  }
}
