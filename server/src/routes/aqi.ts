import express from 'express';

const router = express.Router();

// Mock AQI Data generator
function getMockAQI(lat: number, lng: number) {
    // Randomize slightly based on coords to make it feel dynamic
    const baseAQI = Math.floor(Math.random() * 200) + 20;
    let category = "Good";
    let advice = "Air quality is considered satisfactory.";

    if (baseAQI > 50) {
        category = "Moderate";
        advice = "Air quality is acceptable; however, for some pollutants there may be a moderate health concern.";
    }
    if (baseAQI > 100) {
        category = "Unhealthy for Sensitive Groups";
        advice = "Members of sensitive groups may experience health effects.";
    }
    if (baseAQI > 150) {
        category = "Unhealthy";
        advice = "Everyone may begin to experience health effects.";
    }
    if (baseAQI > 200) {
        category = "Very Unhealthy";
        advice = "Health warnings of emergency conditions.";
    }

    return { aqi: baseAQI, category, advice };
}

router.get('/', (req, res) => {
    try {
        const { lat, lng } = req.query;
        // In real app, call WAQI API or OpenWeatherMap
        const data = getMockAQI(Number(lat), Number(lng));
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
