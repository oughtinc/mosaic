const uuidv4 = require("uuid/v4");

export function processExportsToImports(node: any) {
  if (node.type === "pointerImport") {
    return {
      ...node,
      data: {
        ...node.data,
        internalReferenceId: uuidv4(), // generate new id so you can open/close this independently of the one it copied
      },
    };
  } else if (node.type === "pointerExport") {
    return {
      object: "inline",
      type: "pointerImport",
      isVoid: true,
      data: {
        pointerId: node.data.pointerId,
        internalReferenceId: uuidv4(),
      },
    };
  } else if (node.nodes) {
    return {
      ...node,
      nodes: node.nodes.map(node => processExportsToImports(node)),
    };
  } else {
    return node;
  }
}
