import * as _ from "lodash";
import { HyperTextValue, Serializable, Identifiable, Row } from "./types";

let id = 0;

function getId() {
  id += 1;
  return id.toString();
}

export class Link implements Identifiable, Serializable {
  public id: string;
  private nodeVersion: NodeVersion;
  private access: LinkAccess;

  constructor(options: { nodeVersion: NodeVersion; access: LinkAccess }) {
    this.id = getId();
    this.nodeVersion = options.nodeVersion;
    this.access = options.access;
  }

  serialize(): Row[] {
    return [
      {
        type: "Link",
        id: this.id,
        value: {
          nodeVersionId: this.nodeVersion.id,
          access: this.access
        }
      }
    ].concat(this.nodeVersion.serialize());
  }
}

export enum LinkAccess {
  Read,
  Write
}

export class Node implements Identifiable, Serializable {
  public id: string;
  public head: NodeVersion | null;
  public consistent: NodeVersion | null;

  constructor() {
    this.id = getId();
    this.head = null;
    this.consistent = null;
  }

  setHead(nodeVersion: NodeVersion) {
    this.head = nodeVersion;
  }

  setConsistent(nodeVersion: NodeVersion) {
    this.consistent = nodeVersion;
  }

  serialize(): Row[] {
    return [
      {
        type: "Node",
        id: this.id,
        value: {
          headId: this.head ? this.head.id : null,
          consistentId: this.consistent ? this.consistent.id : null
        }
      }
    ]
      .concat(this.head ? this.head.serialize() : [])
      .concat(this.consistent ? this.consistent.serialize() : []);
  }
}

export class NodeVersion implements Identifiable, Serializable {
  public id: string;
  private node: Node;
  private hyperText: HyperText;
  private previousVersion: NodeVersion | null;
  private links: Array<Link>;

  constructor(options: {
    node: Node;
    hyperText: HyperText;
    previousVersion?: NodeVersion;
    links?: Array<Link>;
  }) {
    this.id = getId();
    this.node = options.node;
    this.hyperText = options.hyperText;
    this.previousVersion = options.previousVersion || null;
    this.links = options.links || [];
  }

  serialize(): Row[] {
    return [
      {
        type: "NodeVersion",
        id: this.id,
        value: {
          nodeId: this.node.id,
          hyperTextId: this.hyperText.id,
          previousVersionId: this.previousVersion
            ? this.previousVersion.id
            : null,
          linkIds: this.links.map(link => link.id)
        }
      }
    ]
      .concat(this.hyperText.serialize())
      .concat(this.previousVersion ? this.previousVersion.serialize() : [])
      .concat(_.flatten(this.links.map(link => link.serialize())));
  }
}

export class HyperText implements Identifiable, Serializable {
  public id: string;

  constructor(private value: HyperTextValue) {
    // TODO (eventually): compute a hash, retrieve existing hypertext element
    // if available instead of creating new identical one
    this.id = getId();
  }

  serialize(): Row[] {
    return [
      {
        type: "HyperText",
        id: this.id,
        value: this.value
      }
    ];
  }
}
