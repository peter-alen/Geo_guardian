import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { getDistance } from '../utils/mapUtils';

export type SpeedStatus = 'normal' | 'near_limit' | 'overspeed';
export type RoadType = 'Highway' | 'State Highway' | 'City Road' | 'Residential Street' | 'School Zone' | 'Unknown';

export interface SpeedLimitState {
    currentSpeed: number; // km/h
    speedLimit: number; // km/h
    roadType: RoadType;
    status: SpeedStatus;
}

// Global cache to avoid double-fetching from multiple components
const roadCache = {
    lat: 0,
    lng: 0,
    roadType: 'Unknown' as RoadType,
    timestamp: 0
};

export const useSpeedLimit = (
    userLocation: { lat: number; lng: number; speed?: number | null } | null,
    vehicleType: string = 'car'
) => {
    const [speedState, setSpeedState] = useState<SpeedLimitState>({
        currentSpeed: 0,
        speedLimit: 60,
        roadType: 'Unknown',
        status: 'normal',
    });

    const prevLocationRef = useRef<{ lat: number; lng: number; timestamp: number } | null>(null);
    const speedSamplesRef = useRef<number[]>([]);
    const lastFetchRef = useRef<number>(0);
    const historyRef = useRef<{ timestamp: number, speed: number, limit: number, roadType: RoadType, overspeed: boolean }[]>([]);
    const demoRef = useRef({ startTime: 0, completed: false }); // Track trip simulation progression

    // Dynamic Speed Limit Matrix (Official Kerala Limits 2023/24)
    const getLimit = (road: RoadType, type: string) => {
        if (type === 'emergency') return 999; // Emergency vehicles have no effective limit
        if (type === 'walk') return 999;      // Walking has no effective speed limit
        if (road === 'School Zone') return 30; // 30 kmph universally for School Zones

        // Kerala speed limits (kmph):
        // Cars: NH (100 or 90), SH (80), Other/Res (70), City (50)
        // Two-wheelers: Strictly capped at 60 kmph across the state (50 in City)
        // Heavy (Goods/Passenger): NH (80-90), SH (65-80), Other (60-70), City (50)
        const limits: Record<RoadType, Record<string, number>> = {
            'Highway': { car: 100, heavy: 80, 'two-wheeler': 60 },
            'State Highway': { car: 80, heavy: 65, 'two-wheeler': 60 },
            'City Road': { car: 50, heavy: 50, 'two-wheeler': 50 },
            'Residential Street': { car: 70, heavy: 60, 'two-wheeler': 60 },
            'School Zone': { car: 30, heavy: 30, 'two-wheeler': 30 },
            'Unknown': { car: 70, heavy: 60, 'two-wheeler': 60 },
        };

        const category = limits[road] || limits['Unknown'];
        return category[type] || category['car'];
    };

    // Helper to Map OSM Highway tag to RoadType
    const mapOSMToRoadType = (highwayTag: string): RoadType => {
        if (['motorway', 'motorway_link', 'trunk', 'trunk_link'].includes(highwayTag)) return 'Highway';
        if (['primary', 'primary_link', 'secondary', 'secondary_link'].includes(highwayTag)) return 'State Highway';
        if (['tertiary', 'tertiary_link', 'unclassified'].includes(highwayTag)) return 'City Road';
        if (['residential', 'living_street', 'service', 'pedestrian'].includes(highwayTag)) return 'Residential Street';
        return 'Unknown'; 
    };

    const calculatedSpeedRef = useRef<number>(speedState.currentSpeed || 0);

    // Calculate Speed and determine limits
    useEffect(() => {
        if (!userLocation) return;
        const now = Date.now();

        // 1. Calculate realistic speed based on point-to-point if not provided.
        let calculatedSpeed = speedState.currentSpeed;
        
        // If the simulation is running, intelligently simulate a realistic driver 
        // who dynamically speeds up or down to stay under the current road's limit, with exactly one brief overspeed demo!
        if (typeof userLocation.speed === 'number' && userLocation.speed > 0) {
            if (demoRef.current.startTime === 0) {
                demoRef.current.startTime = now;
                demoRef.current.completed = false;
                calculatedSpeedRef.current = speedState.currentSpeed || 20; // Init
            }

            const currentLimit = getLimit(speedState.roadType, vehicleType);
            const elapsed = now - demoRef.current.startTime;
            
            // Base logic: hover steadily around (limit - 8 km/h) utilizing a sine wave for natural fluctuation
            const noise = Math.sin(now / 1500) * 4; 
            let targetSpeed = Math.max(10, currentLimit - 8 + noise); 

            if (vehicleType === 'emergency') {
                targetSpeed = 150 + noise; 
            } else if (vehicleType === 'walk') {
                targetSpeed = Math.max(3, 5 + (noise / 4)); // very slow walk with minimal noise
            }

            // Trigger the single overspeed demonstration specifically between seconds 10 and 16 of the simulated trip
            if (!demoRef.current.completed && elapsed > 10000 && elapsed < 16000) {
                // Ensure pedestrians and emergency vehicles do not suddenly "overspeed" artificially
                if (vehicleType !== 'emergency' && vehicleType !== 'walk') {
                    targetSpeed = currentLimit + 35; // Force the car to impressively overspeed!
                }
            } else if (elapsed >= 16000) {
                demoRef.current.completed = true; // Mark demo completed so it never accelerates over the limit again!
            }

            // Smoothly ease the car's current speed towards the targeted speed, simulating physical acceleration/deceleration
            calculatedSpeedRef.current += (targetSpeed - calculatedSpeedRef.current) * 0.05;
            calculatedSpeed = calculatedSpeedRef.current;
            
            // Bind directly to the physical mapping simulator to ensure the marker actively accelerates identically
            (window as any).__vSpeed = calculatedSpeedRef.current;

            prevLocationRef.current = { lat: userLocation.lat, lng: userLocation.lng, timestamp: now };
            speedSamplesRef.current = [calculatedSpeed];
            
        } else if (prevLocationRef.current) {
            demoRef.current.startTime = 0; // Reset demo memory for the next simulation trip
            (window as any).__vSpeed = 0; // Reset physics overrides
            
            const { lat: pLat, lng: pLng, timestamp: pTime } = prevLocationRef.current;
            const dist = getDistance(pLat, pLng, userLocation.lat, userLocation.lng); // in meters
            const timeDiff = (now - pTime) / 1000; // in seconds

            // Update ref and calculate speed only every ~0.5 seconds to accurately measure distance over time and ignore monitor refresh rate jitter.
            if (timeDiff > 0.5) {
                let speedMs = dist / timeDiff;
                let rawSpeedKmh = speedMs * 3.6; // m/s to km/h
                
                // Extremely absurd GPS hops or routing snaps are discarded (cap at 160 realistically for demo)
                if (rawSpeedKmh > 160) {
                    rawSpeedKmh = calculatedSpeed; // Fallback previous stable
                }
                
                // Apply a simple moving average of 3 samples to smooth the jittery simulation
                speedSamplesRef.current.push(rawSpeedKmh);
                if (speedSamplesRef.current.length > 3) speedSamplesRef.current.shift();
                
                calculatedSpeed = speedSamplesRef.current.reduce((a, b) => a + b, 0) / speedSamplesRef.current.length;
                
                // Only update the previous location when we've actually sampled the speed!
                prevLocationRef.current = { lat: userLocation.lat, lng: userLocation.lng, timestamp: now };
            }
        } else {
            demoRef.current.startTime = 0;
            (window as any).__vSpeed = 0;
            calculatedSpeed = 0;
            prevLocationRef.current = { lat: userLocation.lat, lng: userLocation.lng, timestamp: now };
            speedSamplesRef.current = [calculatedSpeed];
        }

        const currentSpeed = Math.round(calculatedSpeed);

        // 2. Determine Road Type from Overpass API (debounced to avoid rate limits)
        let roadType = speedState.roadType;
        
        // Cache hit check (within 15 meters and 3 seconds)
        const distToCache = roadCache.timestamp > 0 ? getDistance(roadCache.lat, roadCache.lng, userLocation.lat, userLocation.lng) : 1000;
        
        if (now - roadCache.timestamp < 3000 && distToCache < 15) {
            roadType = roadCache.roadType;
            updateState(currentSpeed, roadType);
        } else if (now - lastFetchRef.current > 3000) {
            lastFetchRef.current = now;
            const radius = 50; // Increased search radius to 50 meters
            // Explicitly ignore pedestrian paths so it snaps to the actual driving road
            const query = `[out:json];way(around:${radius},${userLocation.lat},${userLocation.lng})["highway"]["highway"!~"path|footway|pedestrian|steps|cycleway"];out tags;`;
            
            axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`)
                .then(res => {
                    const elements = res.data.elements;
                    if (elements && elements.length > 0) {
                        // Give priority to major roads over residential if near a junction
                        const getWeight = (hw: string) => {
                            if (hw.includes('motorway')) return 5;
                            if (hw.includes('trunk') || hw.includes('primary')) return 4;
                            if (hw.includes('secondary') || hw.includes('tertiary')) return 3;
                            if (hw.includes('residential')) return 2;
                            return 1;
                        };
                        
                        const sorted = elements.sort((a: any, b: any) => getWeight(b.tags.highway) - getWeight(a.tags.highway));
                        const tags = sorted[0].tags;
                        
                        if (tags && tags.highway) {
                            roadType = mapOSMToRoadType(tags.highway);
                        }
                    }
                    
                    // Update Cache
                    roadCache.lat = userLocation.lat;
                    roadCache.lng = userLocation.lng;
                    roadCache.roadType = roadType;
                    roadCache.timestamp = Date.now();
                })
                .catch(err => {
                    console.warn("Overpass API limit/err:", err.message);
                })
                .finally(() => {
                    updateState(currentSpeed, roadType);
                });
        } else {
            // Use existing state while waiting
            updateState(currentSpeed, roadType);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userLocation, vehicleType]);

    const updateState = (speed: number, road: RoadType) => {
        const limit = getLimit(road, vehicleType);
        
        // Status determination
        let status: SpeedStatus = 'normal';
        if (speed > limit) {
            status = 'overspeed';
        } else if (limit - speed <= 10) {
            status = 'near_limit';
        }

        setSpeedState(prev => {
            // Prevent unnecessary re-renders
            if (prev.currentSpeed === speed && prev.roadType === road && prev.status === status && prev.speedLimit === limit) {
                return prev;
            }

            // Log data history every time speed noticeably changes or status changes
            const now = Date.now();
            if (prev.status !== status || Math.abs(prev.currentSpeed - speed) > 5) {
                historyRef.current.push({
                    timestamp: now,
                    speed: speed,
                    limit: limit,
                    roadType: road,
                    overspeed: status === 'overspeed'
                });

                // Persist to local storage for Data Logging requirement
                try {
                    localStorage.setItem('geo_guardian_speed_history', JSON.stringify(historyRef.current.slice(-100))); // keep last 100
                } catch (e) {
                    // Ignore quota errors
                }
            }

            return {
                currentSpeed: speed,
                speedLimit: limit,
                roadType: road,
                status: status
            };
        });
    };

    return speedState;
};
