import { LinkAccess } from "./classes";
import Store from "../store";

export interface Row {
  id: string;
  type: string;
  value: any;
}

export interface Serializable {
  serialize: () => Row[];
}

export interface Identifiable {
  id: string;
}

// HyperText

export type HyperTextValue =
  | string
  | HyperTextNode
  | HyperTextArray
  | HyperTextObject;

export interface HyperTextNode {
  nodeId: string;
}

export interface HyperTextArray extends Array<HyperTextValue> {}

export interface HyperTextObject {
  [key: string]: HyperTextValue;
}

export interface HyperTextRow extends Row {
  value: HyperTextValue;
}

// Node version

export interface NodeVersionValue {
  nodeId: string | null;
  hyperTextId: string;
  previousVersionId: string | null;
  linkIds: Array<string>;
}

export interface NodeVersionRow extends Row {
  value: NodeVersionValue;
}

export enum NodeVersionTag {
  Head = "Head",
  Consistent = "Consistent",
  Latest = "Latest"
}

// Link

export interface LinkValue {
  nodeVersionId: string;
  access: LinkAccess;
  isRoot: boolean;
}

export interface LinkRow {
  value: LinkValue;
}

// Node

export interface NodeValue {
  headId: string | null;
  consistentId: string | null;
}

export interface NodeRow {
  value: NodeValue;
}

export type RenderNode = React.StatelessComponent<{
  value: HyperTextNode;
  store: Store;
}>;
