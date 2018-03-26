import Plain from "slate-plain-serializer";

export function valueToDatabaseJSON(value: any) {
    return JSON.stringify(value.toJSON().document.nodes[0].nodes);
}

export function databaseJSONToValue(databaseJson: any) {
    if (!!databaseJson) {
        return {
            object: "value",
            document: {
                object: "document",
                data: {},
                nodes: [{
                    object: "block",
                    type: "line",
                    isVoid: false,
                    data: {},
                    nodes: databaseJson,
                }],
            },
        };
    } else {
        return Plain.deserialize("");
    }
}