function isInline(node: any) {
  return node.object === "inline";
}

export function containingInlineAncestor(node: any, document: any) {
  let curNode = node;
  const closestInlineOrRoot = getClosestInlineOrRoot(node, document);
  return isInline(closestInlineOrRoot) ? curNode : undefined;
}

export function getClosestInlineOrRoot(node: any, document: any) {
  let curNode = node;
  while (!isInline(curNode) && document.getParent(curNode.key)) {
    curNode = document.getParent(curNode.key);
  }
  return curNode;
}
