
const https = require('https');
const state = require('./state');
const { logDebug, addToCache, getFromCache, updateStats } = require('./utils');

async function fetchFromApi(endpoint) {
  const cachedData = getFromCache(endpoint);
  if (cachedData) {
    logDebug("Using cached data for", endpoint);
    return cachedData;
  }
  
  logDebug("Fetching from endpoint:", endpoint);

  return new Promise((resolve, reject) => {
    let responseData = '';

    const req = https.get(`https://swapi.dev/api/${endpoint}`, { rejectUnauthorized: false }, (res) => {
      if (res.statusCode >= 400) {
        state.errorCount++;
        return reject(new Error(`Request failed with status code ${res.statusCode}`));
      }

      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          addToCache(endpoint, parsed);
          updateStats(parsed);
          logDebug(`Successfully fetched data for ${endpoint}`);
          logDebug(`Cache size: ${Object.keys(state.cache).length}`);
          resolve(parsed);
        } catch (err) {
          state.errorCount++;
          reject(err);
        }
      });
    });

    req.on('error', (err) => {
      state.errorCount++;
      reject(err);
    });

    req.setTimeout(state.timeout, () => {
      req.abort();
      state.errorCount++;
      reject(new Error(`Request timeout for ${endpoint}`));
    });
  });
}

module.exports = fetchFromApi;