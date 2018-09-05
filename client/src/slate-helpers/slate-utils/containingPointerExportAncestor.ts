function isPointerExport(node: any) {
  return node.type && node.type === "pointerExport";
}

export function containingPointerExportAncestor(node: any, document: any) {
  let curNode = node;
  while (
    !(isPointerExport(curNode))
    &&
    document.getParent(curNode.key)
  ) {
    curNode = document.getParent(curNode.key);
  }

  if (isPointerExport(curNode)) {
    return curNode;
  }
  return undefined;
}
