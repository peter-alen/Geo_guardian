const axios = require('axios');

async function testRoute() {
    // Coordinates near Pathanapuram, Kerala, India
    const start = { lat: 9.0880, lng: 76.8580 };
    const end = { lat: 9.0900, lng: 76.8600 }; // Short distance away

    console.log('Testing foot route in India...');

    // Manual URL construction to verify OSRM directly
    // foot profile
    const url = `http://router.project-osrm.org/route/v1/foot/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&alternatives=3`;

    try {
        const response = await axios.get(url);
        console.log('Response Code:', response.data.code);
        if (response.data.routes && response.data.routes.length > 0) {
            console.log('Distance:', response.data.routes[0].distance, 'meters');
            console.log('Duration:', response.data.routes[0].duration, 'seconds');
        } else {
            console.log('No routes found.');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testRoute();
