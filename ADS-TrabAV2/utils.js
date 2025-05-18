const state = require('./state');

function logDebug(...args) {
  if (state.debugMode) console.log(...args);
}

function addToCache(key, value) {
  state.cache[key] = value;
}

function getFromCache(key) {
  return state.cache[key];
}

function updateStats(data) {
  state.totalDataSize += JSON.stringify(data).length;
}

module.exports = {
  logDebug,
  addToCache,
  getFromCache,
  updateStats,
};