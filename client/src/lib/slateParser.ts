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
        nodes: [].concat(databaseJson)
      }
    };
  } else {
    return Plain.deserialize("");
  }
}

export function listOfSlateNodesToText(
  list: Array<any>,
  shouldTurnExportsIntoImports: boolean
) {
  const arrayOfStrings = _.map(list, x =>
    slateNodeToText(x, shouldTurnExportsIntoImports)
  );
  const trimmedArrayOfStrings = _.map(arrayOfStrings, _.trim);
  const joinedTrimmedArrayOfStrings = trimmedArrayOfStrings.join(" ");
  return joinedTrimmedArrayOfStrings;
}

export function slateNodeToText(
  node: any,
  shouldTurnExportsIntoImports: boolean
) {
  let prefix = "";
  let mid = "";
  let suffix = "";
  if (node.type === "pointerImport") {
    return "ɪᴍᴘᴏʀᴛ";
  } else if (node.type === "pointerExport") {
    if (shouldTurnExportsIntoImports) {
      return "ɪᴍᴘᴏʀᴛ";
    }
    prefix = "[";
    suffix = "]";
  }

  if (_.has(node, "nodes")) {
    mid = listOfSlateNodesToText(node.nodes, shouldTurnExportsIntoImports);
  } else if (_.has(node, "leaves")) {
    mid = listOfSlateNodesToText(node.leaves, shouldTurnExportsIntoImports);
  } else if (_.has(node, "text")) {
    mid = node.text;
  }
  return prefix + mid + suffix;
}
