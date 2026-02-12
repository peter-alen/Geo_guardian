const axios = require('axios');
const fs = require('fs');

const logStream = fs.createWriteStream('verification_results.txt', { flags: 'a' });

function log(message) {
    console.log(message);
    logStream.write(message + '\n');
}

async function testRoute(vehicleType) {
    log(`Testing route for vehicleType: ${vehicleType}`);
    try {
        const response = await axios.post('http://localhost:5000/api/route/calculate', {
            start: { lat: 51.505, lng: -0.09 },
            end: { lat: 51.515, lng: -0.1 },
            vehicleType: vehicleType
        });

        if (response.data && response.data.routes && response.data.routes.length > 0) {
            log(`Success! Routes found for ${vehicleType}.`);
            log(`Debug Profile: ${response.data.debugProfile}`);
            log(`Distance: ${response.data.routes[0].totalDistanceKm} km`);
            log(`Duration: ${response.data.routes[0].totalDurationMin} min`);
        } else {
            log(`Failed: No routes returned for ${vehicleType}`);
        }
    } catch (error) {
        log(`Error testing ${vehicleType}: ${error.message}`);
        if (error.response) {
            log(`Response status: ${error.response.status}`);
            log(`Response data: ${JSON.stringify(error.response.data)}`);
        }
    }
    log('-----------------------------------');
}

async function runTests() {
    // Clear file first
    fs.writeFileSync('verification_results.txt', '');

    await testRoute('car');
    await testRoute('walk');
    await testRoute('two-wheeler');
}

runTests();
