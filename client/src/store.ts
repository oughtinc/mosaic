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
  
}

export const empty = new Store([]);

export const fromData = (data: Serializable[]) => new Store(data);
