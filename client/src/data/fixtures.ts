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

class Node implements Serializable {
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

class NodeVersion implements Serializable {
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

class HyperText implements Serializable {
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

const h1 = new HyperText("This is just text.");
const nv1 = new NodeVersion(h1, null);
const n1 = new Node(nv1);

const h2 = new HyperText(["An array", "that has", "three text elements"]);
const h3 = new HyperText({ nodeId: n1.id });
const h4 = new HyperText([
  "An array",
  "that includes",
  "a node:",
  { nodeId: n1.id }
]);
const h5 = new HyperText({
  template: "workspace",
  question: "the literal question",
  answer: "the literal answer"
});
const h6 = new HyperText({
  template: "workspace",
  question: { nodeId: n1.id },
  answer: { nodeId: n1.id }
});

const data = [h1, h2, h3, h4, h5, h6, nv1, n1];

export default data;
