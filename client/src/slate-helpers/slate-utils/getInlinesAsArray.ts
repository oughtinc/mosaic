export function getInlinesAsArray(nodeOrNodes: any) {
  let array: any = [];

  let nodes;
  if (Array.isArray(nodeOrNodes)) {
    nodes = nodeOrNodes;
  } else {
    nodes = nodeOrNodes.nodes;
  }

  nodes.forEach(child => {
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
