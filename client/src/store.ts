import * as _ from 'lodash';

import { Node, HyperText } from './data/types';
import { data as initialData } from './data/fixtures';

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

export const seededStore = new Store(initialData);
