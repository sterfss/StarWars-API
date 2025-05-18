const fetchFromApi = require('./fetchFromApi');
const state = require('./state');
const { LARGE_POPULATION, LARGE_DIAMETER, NUM_STARSHIPS_TO_DISPLAY } = require('./constants');

async function printCharacterDetails() {
  const character = await fetchFromApi(`people/${state.currentCharacterId}`);
  console.log('\nCharacter:', character.name);
  console.log('Height:', character.height);
  console.log('Mass:', character.mass);
  console.log('Birthday:', character.birth_year);
  if (character.films?.length) {
    console.log('Appears in', character.films.length, 'films');
  }
}

async function printStarshipsOverview() {
  const starships = await fetchFromApi('starships/?page=1');
  console.log('\nTotal Starships:', starships.count);

  for (let i = 0; i < NUM_STARSHIPS_TO_DISPLAY && i < starships.results.length; i++) {
    const ship = starships.results[i];
    console.log(`\nStarship ${i + 1}:`);
    console.log('Name:', ship.name);
    console.log('Model:', ship.model);
    console.log('Manufacturer:', ship.manufacturer);
    console.log('Cost:', ship.cost_in_credits !== 'unknown' ? ship.cost_in_credits + ' credits' : 'unknown');
    console.log('Speed:', ship.max_atmosphering_speed);
    console.log('Hyperdrive Rating:', ship.hyperdrive_rating);
    if (ship.pilots?.length) {
      console.log('Pilots:', ship.pilots.length);
    }
  }
}

async function printLargePlanets() {
  const planets = await fetchFromApi('planets/?page=1');
  console.log('\nLarge populated planets:');
  for (const planet of planets.results) {
    const pop = parseInt(planet.population);
    const dia = parseInt(planet.diameter);

    if (!isNaN(pop) && pop > LARGE_POPULATION && !isNaN(dia) && dia > LARGE_DIAMETER) {
      console.log(`${planet.name} - Pop: ${planet.population} - Diameter: ${planet.diameter} - Climate: ${planet.climate}`);
      if (planet.films?.length) {
        console.log(`  Appears in ${planet.films.length} films`);
      }
    }
  }
}

async function printFilmsChronologically() {
  const films = await fetchFromApi('films/');
  const sorted = films.results.sort((a, b) => new Date(a.release_date) - new Date(b.release_date));

  console.log('\nStar Wars Films in chronological order:');
  sorted.forEach((film, index) => {
    console.log(`${index + 1}. ${film.title} (${film.release_date})`);
    console.log(`   Director: ${film.director}`);
    console.log(`   Producer: ${film.producer}`);
    console.log(`   Characters: ${film.characters.length}`);
    console.log(`   Planets: ${film.planets.length}`);
  });
}

async function printFeaturedVehicle() {
  const vehiclesData = await fetchFromApi('vehicles/?page=1');
  if (!vehiclesData.results || vehiclesData.results.length === 0) {
    console.log('No vehicles found.');
    return;
  }

  console.log('\nFeatured Vehicles:');
  for (let i = 0; i < Math.min(3, vehiclesData.results.length); i++) {
    const vehicle = vehiclesData.results[i];
    console.log(`\nVehicle ${i + 1}:`);
    console.log('Name:', vehicle.name);
    console.log('Model:', vehicle.model);
    console.log('Manufacturer:', vehicle.manufacturer);
    console.log('Cost:', vehicle.cost_in_credits, 'credits');
    console.log('Length:', vehicle.length);
    console.log('Crew Required:', vehicle.crew);
    console.log('Passengers:', vehicle.passengers);
  }
}

function printStats() {
  if (!state.debugMode) return;

  console.log('\nStats:');
  console.log('API Calls:', state.apiCallCount);
  console.log('Cache Size:', Object.keys(state.cache).length);
  console.log('Total Data Size:', state.totalDataSize, 'bytes');
  console.log('Error Count:', state.errorCount);
}

module.exports = {
  printCharacterDetails,
  printStarshipsOverview,
  printLargePlanets,
  printFilmsChronologically,
  printFeaturedVehicle,
  printStats,
};