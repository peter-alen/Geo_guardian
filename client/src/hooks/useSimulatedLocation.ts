import { useState, useEffect, useRef } from 'react';

interface LocationState {
    loaded: boolean;
    coordinates?: { lat: number; lng: number };
    heading?: number | null;
    speed?: number | null;
}

export const useSimulatedLocation = (
    routeCoords: [number, number][] | null, // [lat, lng]
    isActive: boolean,
    speedKmh: number = 60
) => {
    const [location, setLocation] = useState<LocationState>({ loaded: false });
    const progressRef = useRef(0);
    const lastTimeRef = useRef<number>(0);
    const requestRef = useRef<number>(0);

    useEffect(() => {
        if (!isActive || !routeCoords || routeCoords.length < 2) {
            cancelAnimationFrame(requestRef.current);
            return;
        }

        // Reset if starting new
        if (progressRef.current === 0) {
            // Set start immediately
            setLocation({
                loaded: true,
                coordinates: { lat: routeCoords[0][0], lng: routeCoords[0][1] },
                heading: 0,
                speed: 0
            });
        }

        lastTimeRef.current = performance.now();

        const animate = (time: number) => {
            const deltaTime = (time - lastTimeRef.current) / 1000; // seconds
            lastTimeRef.current = time;

            // Calculate distance to move: Speed (m/s) * time
            // const speedMs = (speedKmh * 1000) / 3600;
            // const distToMove = speedMs * deltaTime; // meters (approx)

            // Simplistic: Move index-based or distance-based? 
            // Distance based is smoother. 
            // For now, let's just interpret "progress" as index in the array for simplicity
            // BUT, points might be far apart. We should interpolate.

            // Let's use a "current segment" approach
            // We need a total distance of the route to map "progress" properly?
            // Or just store "currentSegmentIndex" and "segmentProgress (0-1)"

            // To be robust without complex turf.js:
            // Let's just traverse the routeCoords array at a fixed speed?
            // "Speed" in array indices per second? No, that's erratic.

            // Re-think: Just simplistic interpolation between points.
            // Re-think: Just simplistic interpolation between points.
            moveAlongRoute();

            requestRef.current = requestAnimationFrame(animate);
        };

        const moveAlongRoute = () => {
            // We need state for current position: segmentIndex and t (0..1)
            // This needs to be persisted in refs to survive re-renders if we don't want to cause them too fast
            // Actually, we are causing re-renders via setLocation every frame? That might be heavy.
            // Maybe throttle updates to 10hz? Leaflet animates smooth moves anyway.

            // ... Implementing a simple "advance by index" for robustness in this first pass
            // If we have many points (OSRM gives detailed geometry), just iterating points is often "good enough" for visual test.
            // Let's try advanced "point skipping" based on speed.

            // For V1: Just advance 1 point every X ms?
            // No, OSRM points are dense.

            // Let's do:
            // index += speedFactor

            progressRef.current += (0.05 * (speedKmh / 30)); // Arbitrary advancement

            const currentIndex = Math.floor(progressRef.current);
            const nextIndex = currentIndex + 1;

            if (nextIndex >= routeCoords.length) {
                // Arrived
                cancelAnimationFrame(requestRef.current);
                return;
            }

            const p1 = routeCoords[currentIndex];
            const p2 = routeCoords[nextIndex];
            const t = progressRef.current - currentIndex; // 0..1

            // Interpolate
            const lat = p1[0] + (p2[0] - p1[0]) * t;
            const lng = p1[1] + (p2[1] - p1[1]) * t;

            // Calculate Heading
            // const dLon = (p2[1] - p1[1]);
            // Rough heading... actually for small segments just atan2(dy, dx) on flat plane is close enough for visual
            const bearing = (Math.atan2(p2[1] - p1[1], p2[0] - p1[0]) * 180 / Math.PI);

            setLocation({
                loaded: true,
                coordinates: { lat, lng },
                heading: bearing,
                speed: speedKmh
            });
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(requestRef.current);
    }, [isActive, routeCoords, speedKmh]);

    // Reset function
    const resetSimulation = () => {
        progressRef.current = 0;
    };

    return { ...location, resetSimulation };
};
