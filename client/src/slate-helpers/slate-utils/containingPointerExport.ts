function isPointerExport(node: any) {
  return node.type && node.type === "pointerExport";
}

export function containingPointerExport(node: any, document: any) {
  const closestExportOrRoot = getClosestExportOrRoot(node, document);
  return isPointerExport(closestExportOrRoot) ? closestExportOrRoot : undefined;
}

export function getClosestExportOrRoot(node: any, document: any) {
  let curNode = node;
  while (!isPointerExport(curNode) && document.getParent(curNode.key)) {
    curNode = document.getParent(curNode.key);
  }
  return curNode;
}
