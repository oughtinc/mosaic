import * as _ from "lodash";

export const getAllInlinesAsArray = nodeOrNodes => {
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
    if (_.has(child, "nodes")) {
      array = array.concat(getAllInlinesAsArray(child));
    }
  });

  return array;
};
