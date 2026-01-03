import express from 'express';
import axios from 'axios';

const router = express.Router();

// Helper to map 1-5 to our UI format
function mapAQIToUI(owmAqi: number) {
    // OpenWeatherMap: 1 = Good, 2 = Fair, 3 = Moderate, 4 = Poor, 5 = Very Poor
    // Our UI expects roughly 0-500 scale but logic relies on thresholds: 50, 100, 150, 200
    // Mapping:
    // 1 -> 25 (Good <= 50)
    // 2 -> 75 (Fair/Moderate <= 100)
    // 3 -> 125 (Unhealthy Sens. <= 150)
    // 4 -> 175 (Unhealthy <= 200 ??? No, 175 is > 150 which is Red/Unhealthy in UI)
    // 5 -> 250 (Very Unhealthy)

    let aqi = 25;
    let category = "Good";
    let advice = "Air quality is satisfactory.";

    switch (owmAqi) {
        case 1:
            aqi = 30; // Good
            category = "Good";
            advice = "Air quality is considered satisfactory, and air pollution poses little or no risk.";
            break;
        case 2:
            aqi = 75; // Fair (Moderate in US AQI terms roughly)
            category = "Fair";
            advice = "Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very small number of people who are unusually sensitive to air pollution.";
            break;
        case 3:
            aqi = 125; // Moderate (Unhealthy for Sens. in US roughly)
            category = "Moderate";
            advice = "Members of sensitive groups may experience health effects. The general public is not likely to be affected.";
            break;
        case 4:
            aqi = 175; // Poor
            category = "Poor";
            advice = "Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.";
            break;
        case 5:
            aqi = 250; // Very Poor
            category = "Very Poor";
            advice = "Health warnings of emergency conditions. The entire population is more likely to be affected.";
            break;
        default:
            aqi = 30;
    }

    return { aqi, category, advice };
}

router.get('/', async (req, res) => {
    try {
        const { lat, lng } = req.query;
        const apiKey = process.env.OPENWEATHER_API_KEY;

        if (!lat || !lng) {
            res.status(400).json({ message: 'Missing lat or lng parameters' });
            return;
        }

        if (!apiKey) {
            console.error("OPENWEATHER_API_KEY is missing in server .env");
            // Fallback to mock if no key, to prevent crash, or error?
            // Let's return error to notify dev
            res.status(500).json({ message: 'Server configuration error: Missing API Key' });
            return;
        }

        const url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lng}&appid=${apiKey}`;

        const response = await axios.get(url);
        const data = response.data;

        // Response format: { list: [ { main: { aqi: 1..5 }, ... } ] }
        if (data && data.list && data.list.length > 0) {
            const owmAqi = data.list[0].main.aqi;
            const uiData = mapAQIToUI(owmAqi);
            res.json(uiData);
        } else {
            console.warn("No data from OpenWeatherMap", data);
            res.status(500).json({ message: 'No AQI data available for this location' });
        }

    } catch (err) {
        console.error("AQI Fetch Error:", err);
        res.status(500).json({ message: 'Server Error fetching AQI' });
    }
});

export default router;
