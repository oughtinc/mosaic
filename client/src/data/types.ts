export interface Row {
  id: string,
  type: string,
  value: Object
}

export interface Serializable {
  serialize: () => Row[]
}


// HyperText

export type HyperTextValue = string | HyperTextNode | HyperTextArray | HyperTextObject;

export interface HyperTextNode { node: number };

export interface HyperTextArray extends Array<HyperTextValue> {}

export interface HyperTextObject {
  [key: string]: HyperTextValue;
}

export interface HyperTextRow extends Row {
  value: HyperTextValue
}



export enum LinkKind {
  Import,
  Export
}

export interface Link {
  node: Node;
  kind: LinkKind;
  expanded: boolean;
}

export interface Node {
  id: string;
  content: HyperTextValue;
  links: Link[];
  previousVersion: Node | null;
}


