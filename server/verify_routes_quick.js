const axios = require('axios');

async function testRoute(vehicleType) {
    console.log(`Testing vehicleType: ${vehicleType}`);
    try {
        // Test with London coordinates (known to work)
        const response = await axios.post('http://localhost:5000/api/route/calculate', {
            start: { lat: 51.505, lng: -0.09 },
            end: { lat: 51.515, lng: -0.1 },
            vehicleType: vehicleType
        });

        if (response.data && response.data.routes && response.data.routes.length > 0) {
            console.log(`Success! Dist: ${response.data.routes[0].totalDistanceKm} km`);
        } else {
            console.log(`Failed!`);
        }
    } catch (error) {
        console.error(`Error:`, error.message);
    }
}

async function runTests() {
    await testRoute('car');
    await testRoute('walk');
    await testRoute('two-wheeler');
}

runTests();
