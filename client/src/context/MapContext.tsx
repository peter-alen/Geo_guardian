import React, { createContext, useContext, useState, type ReactNode } from 'react';
import useGeolocation from '../hooks/useGeolocation';
import { useSimulatedLocation } from '../hooks/useSimulatedLocation';

interface UserLocation {
    lat: number;
    lng: number;
    heading: number | null;
    speed: number | null;
}

interface MapContextProps {
    userLocation: UserLocation | null;
    locationError: string | null;
    isLocationLoaded: boolean;
    // Route state placeholders for future tasks
    destination: { lat: number; lng: number } | null;
    setDestination: (dest: { lat: number; lng: number } | null) => void;
    // Layer toggles
    showHazards: boolean;
    setShowHazards: (show: boolean) => void;
    // Navigation State
    isNavigating: boolean;
    setIsNavigating: (isNavigating: boolean) => void;
    followMode: boolean;
    setFollowMode: (followMode: boolean) => void;
    // Recenter Trigger
    recenterTrigger: number;
    triggerRecenter: () => void;
    // Simulation
    startSimulation: (route: [number, number][]) => void;
    stopSimulation: () => void;
    isSimulating: boolean;
}

const MapContext = createContext<MapContextProps | undefined>(undefined);

export const MapProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const geolocation = useGeolocation();
    const [destination, setDestination] = useState<{ lat: number; lng: number } | null>(null);
    const [showHazards, setShowHazards] = useState(true);
    const [isNavigating, setIsNavigating] = useState(false);
    const [followMode, setFollowMode] = useState(false);
    const [recenterTrigger, setRecenterTrigger] = useState(0);

    // Simulation State
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulationRoute, setSimulationRoute] = useState<[number, number][] | null>(null);
    const simLocation = useSimulatedLocation(simulationRoute, isSimulating, 30); // 30 km/h default

    const userLocation = isSimulating && simLocation.coordinates
        ? {
            lat: simLocation.coordinates.lat,
            lng: simLocation.coordinates.lng,
            heading: simLocation.heading || 0,
            speed: simLocation.speed || 0,
        }
        : geolocation.coordinates
            ? {
                lat: geolocation.coordinates.lat,
                lng: geolocation.coordinates.lng,
                heading: geolocation.heading || 0,
                speed: geolocation.speed || 0,
            }
            : null;

    const startSimulation = (route: [number, number][]) => {
        setSimulationRoute(route);
        setIsSimulating(true);
        setIsNavigating(true); // Auto-start nav mode usually
        setFollowMode(true);
    };

    const stopSimulation = () => {
        setIsSimulating(false);
        setSimulationRoute(null);
    };

    return (
        <MapContext.Provider
            value={{
                userLocation,
                locationError: geolocation.error ? geolocation.error.message : null,
                isLocationLoaded: geolocation.loaded,
                destination,
                setDestination,
                showHazards,
                setShowHazards,
                isNavigating,
                setIsNavigating,
                followMode,
                setFollowMode,
                recenterTrigger,
                triggerRecenter: () => setRecenterTrigger(prev => prev + 1),
                startSimulation,
                stopSimulation,
                isSimulating
            }}
        >
            {children}
        </MapContext.Provider>
    );
};

export const useMapContext = () => {
    const context = useContext(MapContext);
    if (!context) {
        throw new Error('useMapContext must be used within a MapProvider');
    }
    return context;
};
