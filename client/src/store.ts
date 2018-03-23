import { Serializable, Row } from "./data/types";

interface DB { [key: string]: { [key: string]: Row } }

export default class Store {
  private db: DB;

  constructor(data: Serializable[]) {
    this.db = {};
    data.forEach(datum => {
      const objects = datum.serialize();
      objects.forEach(object => {
        if (!this.db[object.type]) {
          this.db[object.type] = {};
        }
        this.db[object.type][object.id] = object;
      })
    });
  }

  dump(): DB {
    return this.db;
  }

  get(objectType: string, id: string): Row | null {
    const table = this.db[objectType];
    if (!table) {
      return null;
    }
    return table[id] || null;
  }
  
}

export const empty = new Store([]);
