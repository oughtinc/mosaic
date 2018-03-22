import { LinkKind } from "./types";

const node3 = {
  id: "1341",
  content: "This is the third node",
  links: [],
  previousVersion: null
};

const node2 = {
  id: "6547",
  content: "This is hypertext for the second node",
  links: [],
  previousVersion: null
};

const node1 = {
  id: "8124",
  content: [
    "This is hypertext for the first node, with a link: ",
    { link: 0 },
    " And here's one we haven't expanded yet: ",
    { link: 1 }
  ],
  links: [
    { node: node2, kind: LinkKind.Import, expanded: true },
    { node: node3, kind: LinkKind.Import, expanded: false }
  ],
  previousVersion: null
};

export const data = [node1, node2, node3];
