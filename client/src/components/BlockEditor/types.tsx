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
  insertTextByKey(key: any): Change;
  move(n: number): Change;
  moveToRangeOf(node: any): Change;
}

export interface TextNode {
  key: string;
  object: string;
  leaves: any[];
  text: string;
}
