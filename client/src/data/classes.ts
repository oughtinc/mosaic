import * as _ from "lodash";
import * as uuidv1 from "uuid/v1";
import { HyperTextValue, Serializable, Identifiable, Row } from "./types";

export class Workspace implements Identifiable, Serializable {
  public id: string;

  constructor(
    public head: WorkspaceVersion,
    public consistent: WorkspaceVersion
  ) {
    this.id = uuidv1();
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
    this.id = uuidv1();
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
  private isExpanded: boolean;
  private isRoot: boolean;

  constructor(
    private nodeVersion: NodeVersion,
    options: {
      access: LinkAccess;
      isExpanded: boolean;
      isRoot: boolean;
    }
  ) {
    this.id = uuidv1();
    this.access = options.access;
    this.isExpanded = options.isExpanded;
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
          isExpanded: this.isExpanded,
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
    this.id = uuidv1();
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
    this.id = uuidv1();
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
    this.id = uuidv1();
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
