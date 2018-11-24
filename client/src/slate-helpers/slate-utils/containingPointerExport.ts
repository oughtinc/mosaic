function isPointerExport(node: any) {
  return node.type && node.type === "pointerExport";
}

export function containingPointerExport(node: any, document: any) {
  let curNode = node;
  const closestExportOrRoot = getClosestExportOrRoot(node, document);
  return isPointerExport(closestExportOrRoot) ? curNode : undefined;
}

export function getClosestExportOrRoot(node: any, document: any) {
  let curNode = node;
  while (!isPointerExport(curNode) && document.getParent(curNode.key)) {
    curNode = document.getParent(curNode.key);
  }
  return curNode;
}
