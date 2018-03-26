import _ = require("lodash");
import Plain from "slate-plain-serializer";
import { Value } from "slate"

export function getInlinesAsArray(node) {
  let array: any = [];

  node.nodes.forEach((child) => {
    if (child.object === "text") { return; }
    if (child.object === "inline") {
      array.push(child);
    } else {
      array = array.concat(getInlinesAsArray(child));
    }
  });

  return array;
}

export const POINTER_IMPORT = "pointerImport";
export const POINTER_EXPORT = "pointerExport";

export class SlateNode {
    public node;

    static fromSlateValue(nodeInJson){
        const _value = nodeInJson ? Value.fromJSON(nodeInJson) : Plain.deserialize("");
        return new this(_value.document)
    }

    static fromSlateNode(nodeInJson){
        console.log(0, nodeInJson)
        // const value = nodeInJson ? Value.fromJSON(nodeInJson) : Plain.deserialize("");
        return new this(nodeInJson);
        // if (value.document){
        //     return new this(value.document)
        // } else {
        //     return new this(value)
        // }
    }

    constructor(nodeInSlateFormat){
        this.node = nodeInSlateFormat;
        console.log("This created", this.node)
    }

    public pointerIds():string[]{
        return this.pointers().map(p => p.data.pointerId)
    }

    public pointersById(types=[POINTER_IMPORT, POINTER_EXPORT]){
        const pointers = this.pointers(types);
        let results = {}
        for (const pointer of pointers) {
            results[pointer.data.pointerId] = pointer;
        }
        return results
    }

    private pointers(types=[POINTER_IMPORT, POINTER_EXPORT]){
        console.log("FINDING POINTERS 1", this.node)
        console.log("FINDING POINTERS", this.outsideJson())
        const things = this.inlinesAsJsonArray()
        console.log("FOUND POINTERS", things.filter(p => _.includes(types, p.type)))
        return this.inlinesAsJsonArray().filter(p => _.includes(types, p.type))
    }

    private outsideJson(){
        return getInlinesAsArray(this.node);
    }

    private inlinesAsJsonArray(){
        return getInlinesAsArray(this.node);
    }
}