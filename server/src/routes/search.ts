import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            res.status(400).json({ message: 'Missing search query' });
            return;
        }

        // Forward request to Nominatim API
        // REQUIRED: User-Agent header to comply with usage policy
        const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
            params: {
                format: 'json',
                q: q,
                addressdetails: 1,
                limit: 5
            },
            headers: {
                'User-Agent': 'GeoGuardianApp/1.0'
            }
        });

        res.json(response.data);

    } catch (err) {
        console.error("Search Proxy Error:", err);
        res.status(500).json({ message: 'Error fetching search results' });
    }
});

export default router;
