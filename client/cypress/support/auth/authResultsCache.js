class AuthResultsCache {
  constructor() {
    this.cache = {};
  }

  setCache(key, results) {
    this.cache[key] = results;
    this.haveResultsBeenCached = true;
  }

  hasCache(key) {
    return this.cache[key] !== undefined;
  }

  hasCacheExpired(key) {
    if (!this.hasCache(key)) {
      throw new Error(`Cache with key ${key} doesn't exit`);
    }

    if (this.getCache(key).expiresAt) {
      return Date.now() > Number(this.getCache(key).expiresAt);
    }

    return false;
  }

  hasValidCache(key) {
    return this.hasCache(key) && !this.hasCacheExpired(key);
  }

  getCache(key) {
    return this.cache[key];
  }
}

export const authResultsCache = new AuthResultsCache();
