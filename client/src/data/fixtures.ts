import {
  HyperText,
  Node,
  NodeVersion,
  LinkAccess,
  Link,
  Workspace,
  WorkspaceVersion
} from "./classes";

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

const h7 = new HyperText("What is 2 + 3?");
const nv7 = new NodeVersion(h7, null);
const n7 = new Node(nv7);

const h8 = new HyperText("It's 5.");
const nv8 = new NodeVersion(h8, null);
const n8 = new Node(nv8);

const h9 = new HyperText({
  template: "workspace",
  question: { nodeId: n7.id },
  answer: { nodeId: n8.id }
});
const nv9 = new NodeVersion(h9, null);
// const n9 = new Node(nv9);

const ls1 = [
  new Link(nv7, { access: LinkAccess.Read, isExpanded: true, isRoot: false }),
  new Link(nv8, { access: LinkAccess.Write, isExpanded: true, isRoot: false }),
  new Link(nv9, { access: LinkAccess.Read, isExpanded: true, isRoot: true })
];
const wv = new WorkspaceVersion(ls1);
const w1 = new Workspace(wv, wv);

const data = [h1, h2, h3, h4, h5, h6, nv1, n1, w1];

export default data;
