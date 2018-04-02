import {
  HyperText,
  Node,
  NodeVersion,
  LinkAccess,
  Link,
} from "./classes";

const h1 = new HyperText("This is just text.");
const n1 = new Node();
const nv1 = new NodeVersion({ node: n1, hyperText: h1 });
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
const nv7 = new NodeVersion({
  node: n7,
  hyperText: h7  
});
n7.setHead(nv7);

const h8 = new HyperText("It's 5.");
const n8 = new Node();
const nv8 = new NodeVersion({
  node: n8,
  hyperText: h8
});
n8.setHead(nv8);

// A workspace

const ls1 = [
  new Link({ nodeVersion: nv7, access: LinkAccess.Read }),
  new Link({ nodeVersion: nv8, access: LinkAccess.Write })
];

const h9 = new HyperText({
  template: "question-answer",
  question: { nodeId: n7.id },
  answer: { nodeId: n8.id }
});

const n9 = new Node();
const nv9 = new NodeVersion({
  node: n9,
  hyperText: h9,
  links: ls1
});
n9.setHead(nv9);
n9.setConsistent(nv9);

// Now let's create two new version of the question node,

// One with an update to links and workspace:

const h10 = new HyperText("What is 2 + 3, approximately?");
const nv10 = new NodeVersion({
  node: n7,
  hyperText: h10,
  previousVersion: nv7
});
n7.setHead(nv10);

const ls2 = [
  new Link({ nodeVersion: nv10, access: LinkAccess.Read }),
  new Link({ nodeVersion: nv8, access: LinkAccess.Write }),
];
const nv9b = new NodeVersion({
  node: n9,
  hyperText: h9,
  links: ls2
});
n9.setHead(nv9b)

// And one without:

const h11 = new HyperText("What is 2 + 3, very roughly?");
const nv11 = new NodeVersion({
  node: n7,
  hyperText: h11,
  previousVersion: nv10
});
n7.setHead(nv11);

// Add an example of a (non-question-answer) workspace with an unexpanded pointer

const h13 = new HyperText("This is invisible.");
const n11 = new Node();
const nv13 = new NodeVersion({
  node: n11,
  hyperText: h13
});
n11.setHead(nv13);

const h12 = new HyperText(["An unexpanded pointer:", { nodeId: n11.id }]);

const n10 = new Node();
const nv12 = new NodeVersion({
  node: n10,
  hyperText: h12
});
n10.setHead(nv12);

const data = [
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  h10,
  n1,
  n7,
  n8,
  n9,
  nv9b,
  nv10,
  nv11,
  nv12,
  n11,
  n10
];

export default data;
