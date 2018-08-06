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
  insertTextByKey(key: any, offset: number, text: string): Change;
  move(n: number): Change;
  moveToRangeOf(node: any): Change;
  removeTextByKey(key: string, offset: number, length: number): Change;
}

export interface TextNode {
  key: string;
  object: string;
  leaves: any[];
  text: string;
}
