type Node = {
  content: string
};

export default class Store {
  constructor(private nodes: Array<Node>) {
  }
  getNodes() {
    return this.nodes;
  }
}

export const emptyStore = new Store([]);
