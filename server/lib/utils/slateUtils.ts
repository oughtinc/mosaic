import * as _ from "lodash";

export function getAllInlinesAsArray(node) {
    let array: any = [];

    node.nodes.forEach((child) => {
        if (child.object === "text") { return; }
        if (child.object === "inline") {
            array.push(child);
        }
        if (_.has(child, 'nodes')) {
            array = array.concat(getAllInlinesAsArray(child))
        }
    });

    return array;
}