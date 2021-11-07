module.exports = function (expirationInterval = 12*60*60*1000) {
    var cache = {};
    var timestamps = {};
    var expiration = expirationInterval;
    
    return {
        get: function (key) {
            if (timestamps[key] + expiration < Date.now()) {
                delete cache[key];
                return null;
            }
            return cache[key];
        },
        set: function (key, value) {
            cache[key] = value;
            timestamps[key] = Date.now();
        }
    }
}();