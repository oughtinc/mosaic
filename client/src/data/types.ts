export type HyperText = string | { link: number } | HyperTextArray; // HyperTextObject

export interface HyperTextArray extends Array<HyperText> {}

export interface HyperTextObject {
  [key: string]: HyperText;
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
  content: HyperText;
  links: Link[];
  previousVersion: Node | null;
}
