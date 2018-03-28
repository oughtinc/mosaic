import * as _ from "lodash";
import { HyperTextValue, Serializable, Identifiable, Row } from "./types";

let id = 0;

function getId() {
  id += 1;
  return id.toString();
}

export class Workspace implements Identifiable, Serializable {
  public id: string;

  constructor(
    public head: WorkspaceVersion,
    public consistent: WorkspaceVersion
  ) {
    this.id = getId();
  }

  setHead(workspaceVersion: WorkspaceVersion) {
    this.head = workspaceVersion;
  }

  serialize(): Row[] {
    return [
      {
        type: "Workspace",
        id: this.id,
        value: {
          headId: this.head.id,
          consistentId: this.consistent.id
        }
      }
    ]
      .concat(this.head.serialize())
      .concat(this.consistent.serialize());
  }
}

export class WorkspaceVersion implements Identifiable, Serializable {
  public id: string;

  constructor(private links: Array<Link>) {
    this.id = getId();
  }

  serialize(): Row[] {
    return [
      {
        type: "WorkspaceVersion",
        id: this.id,
        value: {
          linkIds: this.links.map(link => link.id)
        }
      }
    ].concat(_.flatten(this.links.map(link => link.serialize())));
  }
}

export class Link implements Identifiable, Serializable {
  public id: string;
  private access: LinkAccess;
  private isRoot: boolean;

  constructor(
    private nodeVersion: NodeVersion,
    options: {
      access: LinkAccess;
      isRoot: boolean;
    }
  ) {
    this.id = getId();
    this.access = options.access;
    this.isRoot = options.isRoot;
  }

  serialize(): Row[] {
    return [
      {
        type: "Link",
        id: this.id,
        value: {
          nodeVersionId: this.nodeVersion.id,
          access: this.access,
          isRoot: this.isRoot
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

  constructor() {
    this.id = getId();
    this.head = null;
  }

  setHead(nodeVersion: NodeVersion) {
    this.head = nodeVersion;
  }

  serialize(): Row[] {
    return [
      {
        type: "Node",
        id: this.id,
        value: {
          headId: this.head ? this.head.id : null
        }
      }
    ].concat(this.head ? this.head.serialize() : []);
  }
}

export class NodeVersion implements Identifiable, Serializable {
  public id: string;

  constructor(
    private node: Node,
    private hyperText: HyperText,
    private previousVersion: NodeVersion | null
  ) {
    this.id = getId();
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
            : null
        }
      }
    ]
      .concat(this.hyperText.serialize())
      .concat(this.previousVersion ? this.previousVersion.serialize() : []);
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
