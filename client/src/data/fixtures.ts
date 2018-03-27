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
const n1 = new Node();
const nv1 = new NodeVersion(n1, h1, null);
n1.setHead(nv1);

const h2 = new HyperText(["An array", "that has", "three text elements"]);
const h3 = new HyperText({ nodeId: n1.id });
const h4 = new HyperText([
  "An array",
  "that includes",
  "a node:",
  { nodeId: n1.id }
]);
const h5 = new HyperText({
  template: "question-answer",
  question: "the literal question",
  answer: "the literal answer"
});
const h6 = new HyperText({
  template: "question-answer",
  question: { nodeId: n1.id },
  answer: { nodeId: n1.id }
});

const h7 = new HyperText("What is 2 + 3?");
const n7 = new Node();
const nv7 = new NodeVersion(n7, h7, null);
n7.setHead(nv7);

const h8 = new HyperText("It's 5.");
const n8 = new Node();
const nv8 = new NodeVersion(n8, h8, null);
n8.setHead(nv8);

const h9 = new HyperText({
  template: "question-answer",
  question: { nodeId: n7.id },
  answer: { nodeId: n8.id }
});
const n9 = new Node();
const nv9 = new NodeVersion(n9, h9, null);
n9.setHead(nv9);

// A workspace

const ls1 = [
  new Link(nv7, { access: LinkAccess.Read, isRoot: false }),
  new Link(nv8, { access: LinkAccess.Write, isRoot: false }),
  new Link(nv9, { access: LinkAccess.Read, isRoot: true })
];
const wv1 = new WorkspaceVersion(ls1);
const w1 = new Workspace(wv1, wv1);

// Now let's create two new version of the question node,

// One with an update to links and workspace:

const h10 = new HyperText("What is 2 + 3, approximately?");
const nv10 = new NodeVersion(n7, h10, nv7);

const ls2 = [
  new Link(nv10, { access: LinkAccess.Read, isRoot: false }),
  new Link(nv8, { access: LinkAccess.Write, isRoot: false }),
  new Link(nv9, { access: LinkAccess.Read, isRoot: true })
];
const wv2 = new WorkspaceVersion(ls2);
w1.setHead(wv2);

// And one without:

const h11 = new HyperText("What is 2 + 3, very roughly?");
const nv11 = new NodeVersion(n7, h11, nv10);
n7.setHead(nv11);

const data = [h1, h2, h3, h4, h5, h6, h10, n1, n7, n8, n9, nv10, w1, nv11];

export default data;
