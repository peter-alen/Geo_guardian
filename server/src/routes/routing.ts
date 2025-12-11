import express from 'express';
import axios from 'axios';
import RoadRestriction from '../models/RoadRestriction';

const router = express.Router();

const OSRM_API_URL = 'http://router.project-osrm.org/route/v1/driving';

// Helper to fetch route from OSRM
async function getOsrmRoute(start: { lat: number, lng: number }, end: { lat: number, lng: number }) {
    try {
        // OSRM expects: longitude,latitude
        const url = `${OSRM_API_URL}/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
        const response = await axios.get(url);

        if (response.data.code !== 'Ok' || !response.data.routes || response.data.routes.length === 0) {
            return null;
        }

        const route = response.data.routes[0];
        // OSRM returns [lon, lat], we need [lat, lon] for Leaflet
        const coordinates = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);

        return {
            coordinates,
            distance: route.distance, // meters
            duration: route.duration // seconds
        };
    } catch (error) {
        console.error('Error fetching OSRM route:', error);
        return null;
    }
}

router.post('/calculate', async (req, res) => {
    try {
        const { start, end, vehicleType } = req.body;

        if (!start || !end) {
            return res.status(400).json({ message: 'Start and End locations required' });
        }

        const osrmRoute = await getOsrmRoute(start, end);

        if (!osrmRoute) {
            return res.status(502).json({ message: 'Failed to calculate route service' });
        }

        const routePoints = osrmRoute.coordinates;

        const restrictions = await RoadRestriction.find();

        let hasViolations = false;
        let warning = '';

        // Simple mock check: if route passes "near" a restriction
        // We will just randomly flag it for demo if vehicleType is heavy
        if (vehicleType === 'heavy') {
            // Check if any restriction has noHeavyVehicles = true
            // This is just a dummy logic for prototype
            const heavyRestrictions = restrictions.filter(r => r.noHeavyVehicles);
            if (heavyRestrictions.length > 0) {
                // Assume we hit one for demo purposes if route length > something or just random
                // Let's actually check distance to be slightly realistic mock
                // if distance between start and restriction < 1km
                hasViolations = true;
                warning = 'Route contains roads restricted for heavy vehicles.';
            }
        }

        const response = {
            totalDistanceKm: (osrmRoute.distance / 1000).toFixed(2),
            totalDurationMin: Math.ceil(osrmRoute.duration / 60),
            hasVehicleRestrictionViolations: hasViolations,
            warning: hasViolations ? warning : null,
            segments: [
                {
                    coordinates: routePoints, // Leaflet expects [lat, lng]
                    isRestricted: hasViolations
                }
            ]
        };

        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
