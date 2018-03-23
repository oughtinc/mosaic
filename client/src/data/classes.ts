import * as uuidv1 from "uuid/v1";
import { HyperTextValue, Serializable, Row } from "./types";

// import { LinkKind } from "./types";
//
// function makeRootWorkspace(question: string): Workspace {
//   const questionNode = Node.fromString(question);
//   const notesNode = Node.fromString("No notes yet.");
//   const answerNode = Node.fromString("No answer yet.");
//   const workspaceNode = Node.fromObject({
//     question: questionNode,
//     notes: notesNode,
//     answer: answerNode,
//     children: []
//   });
//   return Workspace.fromNode(workspaceNode);
// }
//
// // --------------------------------------------------------------------
//
// class Workspace {
//   static fromNode(node: Node): Workspace {}
//   constructor(
//     public head: WorkspaceVersion,
//     public consistent: WorkspaceVersion
//   ) {
//     null;
//   }
// }
//
// class WorkspaceVersion {
//   constructor(public links: Array<Link>) {
//     null;
//   }
// }
//
// class Link {
//   constructor(
//     public nodeVersion: NodeVersion,
//     public kind: LinkKind,
//     public isExpanded: boolean,
//     public isRoot: boolean
//   ) {
//     null;
//   }
// }
//
// // --------------------------------------------------------------------

export class Node implements Serializable {
  public id: string;

  constructor(public head: NodeVersion) {
    this.id = uuidv1();
  }

  serialize(): Row[] {
    return [
      {
        type: "Node",
        id: this.id,
        value: {
          headId: this.head.id
        }
      }
    ].concat(this.head.serialize());
  }
}

export class NodeVersion implements Serializable {
  public id: string;

  constructor(
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

export class HyperText implements Serializable {
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
