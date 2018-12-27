import * as _ from "lodash";
import Plain from "slate-plain-serializer";

export function valueToDatabaseJSON(value: any) {
  return JSON.stringify(value.toJSON().document.nodes);
}

export function databaseJSONToValue(databaseJson: any) {
  if (!!databaseJson) {
    return {
      object: "value",
      document: {
        object: "document",
        data: {},
        nodes: [].concat(databaseJson),
      }
    };
  } else {
    return Plain.deserialize("");
  }
}

export function listOfSlateNodesToText(list: Array<any>, availablePointers: Array<any>) {
  return _.map(_.map(list, x => slateNodeToText(x, availablePointers)), _.trim).join(" ");
}

export function slateNodeToText(node: any, availablePointers: Array<any>) {
  let prefix = "";
  let mid = "";
  let suffix = "";
  if (node.type === "pointerImport") {
    const exportPointer = _.find(availablePointers, x => x.data.pointerId === node.data.pointerId);
    return slateNodeToText(exportPointer, availablePointers);
  } else if (node.type === "pointerExport") {
    prefix = "[";
    suffix = "]";
  }

  if (_.has(node, "nodes")) {
    mid = listOfSlateNodesToText(node.nodes, availablePointers);
  } else if (_.has(node, "leaves")) {
    mid = listOfSlateNodesToText(node.leaves, availablePointers);
  } else if (_.has(node, "text")) {
    mid = node.text;
  }
  return prefix + mid + suffix;
}
