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

export function listOfSlateNodesToText(list: Array<any>) {
  return _.map(_.map(list, slateNodeToText), _.trim).join(" ");
}

export function slateNodeToText(node: any) {
  let prefix = "";
  let mid = "";
  let suffix = "";
  if (node.type === "pointerExport") {
    prefix = "[";
    suffix = "]";
  } else {
    prefix = "";
    suffix = "";
  }

  if (_.has(node, "nodes")) {
    mid = listOfSlateNodesToText(node.nodes);
  } else if (_.has(node, "leaves")) {
    mid = listOfSlateNodesToText(node.leaves);
  } else if (_.has(node, "text")) {
    mid = node.text;
  }
  return prefix + mid + suffix;
}
