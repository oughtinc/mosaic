export enum MutationStatus {
  NotStarted = 0,
  Loading,
  Complete,
  Error
}

export interface Change {
  value: any;
  collapseToEnd(): Change;
  collapseToStart(): Change;
  insertInline(inlineOrProperties: any): Change;
  insertTextByKey(key: any, offset: number, text: string): Change;
  mergeNodeByKey(key: string): Change;
  move(n: number): Change;
  moveAnchor(n: number): Change;
  moveAnchorToEndOfPreviousText(): Change;
  moveFocus(n: number): Change;
  moveFocusToEndOfPreviousText(): Change;
  moveToRangeOf(node: any): Change;
  removeNodeByKey(key: string): Change;
  removeTextByKey(key: string, offset: number, length: number): Change;
  unwrapInlineByKey(key: string, properties: any): Change;
}

export interface TextNode {
  key: string;
  object: string;
  leaves: any[];
  text: string;
}

export interface Value {
  document: any;
  selection: any;
}
