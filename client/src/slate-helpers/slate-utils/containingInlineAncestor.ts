function isInline(node: any) {
  return node.object === "inline";
}

export function containingInlineAncestor(node: any, document: any) {
  let curNode = node;
  while (
    !(isInline(curNode))
    &&
    document.getParent(curNode.key)
  ) {
    curNode = document.getParent(curNode.key);
  }

  if (isInline(curNode)) {
    return curNode;
  }
  return undefined;
}
