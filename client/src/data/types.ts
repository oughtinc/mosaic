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
}

export interface NodeVersionRow extends Row {
  value: NodeVersionValue;
}

// Workspace version

export interface WorkspaceVersionValue {
  linkIds: Array<string>;
}

export interface WorkspaceVersionRow {
  value: WorkspaceVersionValue;
}

// Workspace

export interface WorkspaceValue {
  headId: string;
  consistentId: string;
}

export interface WorkspaceRow {
  value: WorkspaceValue;
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
  headId: string;
}

export interface NodeRow {
  value: NodeValue;
}

export type RenderNode = React.StatelessComponent<{
  value: HyperTextNode;
  store: Store;
}>;
