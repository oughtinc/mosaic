export function closestPointerExportAncestor(node: any, document: any) {
  let curNode = node;
  while (
    !(curNode.type && curNode.type === "pointerExport")
    &&
    document.getParent(curNode.key)
  ) {
    curNode = document.getParent(curNode.key);
  }

  if (curNode.type && curNode.type === "pointerExport") {
    return curNode;
  }
  return undefined;
}
