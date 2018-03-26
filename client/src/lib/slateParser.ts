import Plain from "slate-plain-serializer";

export function valueToDatabaseJSON(value: any) {
    return JSON.stringify(value.toJSON().document.nodes[0]);
}

export function databaseJSONToValue(databaseJson: any) {
    if (!!databaseJson) {
        return {
            object: "value",
            document: {
                object: "document",
                data: {},
                nodes: [
                    databaseJson,
                ],
            },
        };
    } else {
        return Plain.deserialize("");
    }
}