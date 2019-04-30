export function isNestedInExport(node: any, document: any) {
  const ancestorNodes = document.getAncestors(node.key);
  const isNested = ancestorNodes.find(
    ancestor => ancestor.type === "pointerExport",
  );
  return isNested;
}
