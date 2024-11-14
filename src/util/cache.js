
function createCache(expirationInterval = 12 * 60 * 60 * 1000) {
    let cache = {};
    let timestamps = {};
    const expiration = expirationInterval;
  
    return {
      get(key) {
        if (timestamps[key] + expiration < Date.now()) {
          delete cache[key];
          return null;
        }
        return cache[key];
      },
      set(key, value) {
        cache[key] = value;
        timestamps[key] = Date.now();
      },
    };
  }
  export default createCache();
  