import * as _ from 'lodash';

export type HyperText = string | { link: number } | HyperTextArray;  // HyperTextObject

export interface HyperTextArray extends Array<HyperText> { }

export interface HyperTextObject { [key: string]: HyperText; }

export enum LinkKind { Import, Export }

export interface Link {
  node: Node;
  kind: LinkKind;
  expanded: boolean;
}

export interface Node {
  id: string;
  content: HyperText;
  links: Link[];
  previousVersion: Node | null;
}

export function isLink(value: HyperText): boolean {
  return _.isObject(value) && _.has(value, 'link');
}

export default class Store {
  private nodeMap: { [key: string]: Node };
  
  constructor(private nodes: Node[]) {
    this.nodeMap = {};
    nodes.forEach(node => {
      this.nodeMap[node.id] = node;
    });
  }
  getNodes() {
    return this.nodes;
  }
  getNode(id: string): Node | undefined {
    return this.nodeMap[id];
  }
}

export const emptyStore = new Store([]);

const node3 = {
  id: '1341',
  content: 'This is the third node',
  links: [],
  previousVersion: null
};

const node2 = {
  id: '6547',
  content: 'This is hypertext for the second node',
  links: [],
  previousVersion: null
};

const node1 = {
  id: '8124',
  content: ['This is hypertext for the first node, with a link: ',
            { link: 0 },
            ' And here\'s one we haven\'t expanded yet: ',
            { link: 1 }],
  links: [{ node: node2, kind: LinkKind.Import, expanded: true },
          { node: node3, kind: LinkKind.Import, expanded: false }],
  previousVersion: null
};

export const seededStore = new Store([node1, node2, node3]);
