import express from 'express';
import axios from 'axios';
import RoadRestriction from '../models/RoadRestriction';

const router = express.Router();

const OSRM_API_URL = 'http://router.project-osrm.org/route/v1/driving';

// Helper to fetch routes from OSRM
async function getOsrmRoutes(start: { lat: number, lng: number }, end: { lat: number, lng: number }, profile: string = 'driving') {
    try {
        // OSRM expects: longitude,latitude
        // Added alternatives=3 to get multiple routes if available
        // Profiles: driving, bike, foot
        const url = `http://router.project-osrm.org/route/v1/${profile}/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&alternatives=3`;
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

        // Determine OSRM profile based on vehicleType
        let profile = 'driving';
        if (vehicleType === 'walk') {
            profile = 'foot';
        } else if (vehicleType === 'two-wheeler') {
            profile = 'bike';
        }

        const osrmRoutes = await getOsrmRoutes(start, end, profile);

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

            let duration = osrmRoute.duration; // seconds

            // OSRM Demo Server fallback: 
            // If the duration seems identical to driving or just to be safe for this demo,
            // we manually calculate typical duration for walk/bike if the API returns suspicious data pattern
            // or just strictly enforce average speeds for these modes.
            const distanceMeters = osrmRoute.distance;

            if (vehicleType === 'walk') {
                // ~5 km/h = 1.39 m/s
                duration = distanceMeters / 1.39;
            } else if (vehicleType === 'two-wheeler') {
                // Motorbike speed: ~45 km/h = 12.5 m/s
                // OSRM 'bike' profile gives bicycle speeds (~15-20km/h), so we override it.
                duration = distanceMeters / 12.5;
            } else if (vehicleType === 'heavy') {
                // Heavy vehicles are generally slower than cars due to speed limits/acceleration
                // Assume ~80% of car speed, so 1.25x duration
                duration = duration * 1.25;
            }

            return {
                totalDistanceKm: (distanceMeters / 1000).toFixed(2),
                totalDurationMin: Math.ceil(duration / 60),
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
