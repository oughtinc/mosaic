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
