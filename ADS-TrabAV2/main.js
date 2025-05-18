const state = require('./state');
const {
  printCharacterDetails,
  printStarshipsOverview,
  printLargePlanets,
  printFilmsChronologically,
  printFeaturedVehicle,
  printStats
} = require('./displayFunctions');

async function fetchAndDisplayStarWarsData() {
  try {
    if (state.debugMode) {
      console.log("🔎 Fetching and displaying Star Wars data...");
    }

    state.apiCallCount++;

    await printCharacterDetails();
    await printStarshipsOverview();
    await printLargePlanets();
    await printFilmsChronologically();
    await printFeaturedVehicle();

    printStats();

  } catch (error) {
    console.error('❌ Error:', error.message);
    state.errorCount++;
  }
}

module.exports = fetchAndDisplayStarWarsData;
