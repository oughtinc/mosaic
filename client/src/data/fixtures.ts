import { HyperText, Node, NodeVersion } from "./classes";

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
