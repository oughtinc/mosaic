export interface Row {
  id: string,
  type: string,
  value: any
}

export interface Serializable {
  serialize: () => Row[]
}

export interface Identifiable {
  id: string
}


// HyperText

export type HyperTextValue = string | HyperTextNode | HyperTextArray | HyperTextObject;

export interface HyperTextNode { nodeId: number };

export interface HyperTextArray extends Array<HyperTextValue> {}

export interface HyperTextObject {
  [key: string]: HyperTextValue;
}

export interface HyperTextRow extends Row {
  value: HyperTextValue
}

// Node version

export interface NodeVersionValue {
  hyperTextId: string,
  previousVersionId: string | null
}

export interface NodeVersionRow extends Row {
  value: NodeVersionValue
}


// export interface Link {
//   node: Node;
//   kind: LinkKind;
//   expanded: boolean;
// }



