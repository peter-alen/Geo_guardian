const axios = require('axios');
const fs = require('fs');
const logStream = fs.createWriteStream('osrm_consistency.txt', { flags: 'a' });

function log(msg) {
    console.log(msg);
    logStream.write(msg + '\n');
}

async function testProfile(profile) {
    const start = { lat: 9.95584025, lng: 76.56031575 };
    const end = { lat: 10.8966938, lng: 76.1134352 };

    // Construct URL exactly as the server does
    const url = `http://router.project-osrm.org/route/v1/${profile}/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&alternatives=3`;

    log(`Testing Profile: ${profile}`);
    log(`URL: ${url}`);

    try {
        const response = await axios.get(url);
        if (response.data.routes && response.data.routes.length > 0) {
            const r = response.data.routes[0];
            log(`Distance: ${r.distance} meters`);
            log(`Duration: ${r.duration} seconds`);
            log(`Weight: ${r.weight}`);
        } else {
            log('No routes found');
        }
    } catch (e) {
        log(`Error: ${e.message}`);
    }
    log('--------------------------------');
}

async function run() {
    await testProfile('driving');
    await testProfile('foot');
    await testProfile('bike');
}

run();
