import * as uuidv1 from "uuid/v1";

import { HyperTextValue } from "./types";

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
//
// class Node {
//   static fromHyperText(hyperText: HyperText): Node {
//     // TODO
//   }
//   static fromString(s: string): Node {
//     return Node.fromHypertext(HyperText.fromString(s));
//   }
//   static fromObject(o: Object): Node {
//     // ...
//   }
//   constructor(public head: NodeVersion) {
//     null;
//   }
// }
//
// class NodeVersion {
//   constructor(
//     public content: HyperText,
//     public previousVersion: NodeVersion | null
//   ) {
//     null;
//   }
// }


class HyperText {
  private id: string;

  constructor(private value: HyperTextValue) {
    // TODO (eventually): compute a hash, retrieve existing hypertext element
    // if available instead of creating new identical one
    this.id = uuidv1();
  }

  serialize() {
    return [{
      type: "HyperText",
      id: this.id,
      value: this.value
    }];
  }
}

const h1 = new HyperText("This is just text.");
const h2 = new HyperText(["An array", "that has", "three text elements"]);
const h3 = new HyperText({ node: 1 });
const h4 = new HyperText(["An array", "that includes", "a node:", { node: 1 }]);
const h5 = new HyperText({ template: "workspace", question: "the literal question", answer: "the literal answer" });
const h6 = new HyperText({ template: "workspace", question: { node: 1 }, answer: { node: 2} });

const data = [h1, h2, h3, h4, h5, h6];

export default data;
