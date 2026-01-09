import express from 'express';
import axios from 'axios';
import RoadRestriction from '../models/RoadRestriction';

const router = express.Router();

const OSRM_API_URL = 'http://router.project-osrm.org/route/v1/driving';

// Helper to fetch routes from OSRM
async function getOsrmRoutes(start: { lat: number, lng: number }, end: { lat: number, lng: number }) {
    try {
        // OSRM expects: longitude,latitude
        // Added alternatives=3 to get multiple routes if available
        const url = `${OSRM_API_URL}/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&alternatives=3`;
        const response = await axios.get(url);

        if (response.data.code !== 'Ok' || !response.data.routes || response.data.routes.length === 0) {
            return [];
        }

        return response.data.routes.map((route: any) => ({
            coordinates: route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]),
            distance: route.distance, // meters
            duration: route.duration // seconds
        }));
    } catch (error) {
        console.error('Error fetching OSRM routes:', error);
        return [];
    }
}

router.post('/calculate', async (req, res) => {
    try {
        const { start, end, vehicleType } = req.body;

        if (!start || !end) {
            return res.status(400).json({ message: 'Start and End locations required' });
        }

        const osrmRoutes = await getOsrmRoutes(start, end);

        if (osrmRoutes.length === 0) {
            return res.status(502).json({ message: 'Failed to calculate route service' });
        }

        const restrictions = await RoadRestriction.find();

        const processedRoutes = osrmRoutes.map((osrmRoute: any) => {
            let hasViolations = false;
            let warning = '';

            // Simple mock check: if route passes "near" a restriction
            if (vehicleType === 'heavy') {
                const heavyRestrictions = restrictions.filter(r => r.noHeavyVehicles);
                if (heavyRestrictions.length > 0) {
                    hasViolations = true;
                    warning = 'Route contains roads restricted for heavy vehicles.';
                }
            }

            return {
                totalDistanceKm: (osrmRoute.distance / 1000).toFixed(2),
                totalDurationMin: Math.ceil(osrmRoute.duration / 60),
                hasVehicleRestrictionViolations: hasViolations,
                warning: hasViolations ? warning : null,
                segments: [
                    {
                        coordinates: osrmRoute.coordinates,
                        isRestricted: hasViolations
                    }
                ]
            };
        });

        res.json({ routes: processedRoutes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
