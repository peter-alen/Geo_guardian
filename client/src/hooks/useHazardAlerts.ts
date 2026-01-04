import { useEffect, useRef } from 'react';
import { useMapContext } from '../context/MapContext';

interface Hazard {
    _id: string; // Assuming ID exists
    type: string;
    name: string;
    location: {
        coordinates: [number, number]; // [lng, lat]
    };
}

interface UseHazardAlertsProps {
    hazards: Hazard[];
    onAlert: (message: string) => void;
}

const useHazardAlerts = ({ hazards, onAlert }: UseHazardAlertsProps) => {
    const { userLocation } = useMapContext();
    const alertedHazards = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!userLocation || hazards.length === 0) return;

        hazards.forEach(h => {
            const [hLng, hLat] = h.location.coordinates;
            const dist = getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, hLat, hLng);

            // Threshold: 0.2km (200m)
            if (dist < 0.2) {
                if (!alertedHazards.current.has(h._id)) {
                    const typeFormatted = h.type.replace('_', ' ').toUpperCase();
                    onAlert(`${typeFormatted} AHEAD: ${h.name}`);
                    alertedHazards.current.add(h._id);

                    // Reset alert after 30 seconds so it can trigger again if user leaves and returns? 
                    // Or keep it once per session? Prompt says "Trigger alert only once per hazard".
                    // We'll keep it simple: Once per session/mount.
                }
            } else {
                // Optional: Clear from alerted set if far away?
                // alertedHazards.current.delete(h._id); 
            }
        });
    }, [userLocation, hazards, onAlert]);

    // Helper: Haversine Formula
    function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    function deg2rad(deg: number) {
        return deg * (Math.PI / 180);
    }
};

export default useHazardAlerts;
