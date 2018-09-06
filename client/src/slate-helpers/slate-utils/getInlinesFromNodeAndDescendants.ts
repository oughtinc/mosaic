export function getExportsFromNodeAndDescendants(node: any, pointerExportsSoFar: any[] = []) {
  if (node.object === "inline" && node.type === "pointerExport") {
    pointerExportsSoFar = pointerExportsSoFar.concat(node);
  }

  if (node.nodes) {
    node.nodes.forEach(childNode => {
      pointerExportsSoFar = pointerExportsSoFar.concat(getExportsFromNodeAndDescendants(childNode, pointerExportsSoFar));
    });
  }

  return pointerExportsSoFar;
}
