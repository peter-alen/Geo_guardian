import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapComponent from '../components/Map/MapComponent';
import SearchBox from '../components/UI/SearchBox';
import LayerToggles from '../components/UI/LayerToggles';
import MapStyleSwitcher from '../components/UI/MapStyleSwitcher';
import HazardLayers from '../components/Map/HazardLayers';
import RoutingLayer from '../components/Map/RoutingLayer';
import NavigationOverlay from '../components/Map/NavigationOverlay';
import AlertBanner from '../components/UI/AlertBanner';
import AQIWidget from '../components/UI/AQIWidget';
import VehicleSelector from '../components/UI/VehicleSelector';
import LocateButton from '../components/UI/LocateButton';
import LaneGuidance from '../components/UI/LaneGuidance';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useMapContext } from '../context/MapContext';
import useHazardAlerts from '../hooks/useHazardAlerts';
import useNavigationLogic from '../hooks/useNavigationLogic';
import MapLibreNavigation from '../components/Map/MapLibreNavigation';

const MapDashboard: React.FC = () => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const { userLocation, destination, setDestination, isNavigating, setIsNavigating, followMode, setFollowMode, triggerRecenter, startSimulation, stopSimulation, isSimulating } = useMapContext();
    const [layers, setLayers] = useState({
        school_zone: true,
        hospital_zone: true,
        speed_breaker: true,
        sharp_turn: true,
        restrictions: true,
        traffic: false
    });
    const [viewMode, setViewMode] = useState<'2d' | '3d' | 'satellite'>('2d');
    const [allRoutes, setAllRoutes] = useState<any[]>([]);
    const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [hazards, setHazards] = useState<any[]>([]);

    // Navigation Stats
    const [navStats, setNavStats] = useState({
        distance: 0, // km
        duration: 0  // min
    });

    // Hooks
    useHazardAlerts({
        hazards,
        onAlert: (msg) => {
            setAlertMessage(msg);
            speak(msg);
        }
    });

    const currentRoute = allRoutes[selectedRouteIndex];

    useNavigationLogic({
        routeSegments: currentRoute?.segments || [],
        onInstruction: (msg) => {
            setAlertMessage(msg);
            speak(msg);
        }
    });

    useEffect(() => {
        // Fetch hazards
        axios.get('http://localhost:5000/api/hazards')
            .then(res => setHazards(res.data))
            .catch(err => console.error(err));
    }, []);


    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            if (window.speechSynthesis.speaking) return;
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        }
    };


    const handleToggle = (key: string) => {
        setLayers(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
    };

    const handleDestinationSelect = async (lat: number, lng: number, name: string) => {
        console.log('Selected destination:', lat, lng, name);
        setDestination({ lat, lng });

        // Mock Start as current userLocation if available, else deafult
        const start = userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : { lat: 51.505, lng: -0.09 };
        const end = { lat, lng };

        try {
            const res = await axios.post('http://localhost:5000/api/route/calculate', {
                start, end, vehicleType: user?.vehicleType || 'car'
            });

            const fetchedRoutes = res.data.routes;
            setAllRoutes(fetchedRoutes);
            setSelectedRouteIndex(0); // Default to first route

            const primaryRoute = fetchedRoutes[0];
            // Use road-based distance and duration from backend primary route
            setNavStats({
                distance: parseFloat(primaryRoute.totalDistanceKm),
                duration: primaryRoute.totalDurationMin
            });

            if (primaryRoute.hasVehicleRestrictionViolations) {
                setAlertMessage(primaryRoute.warning || 'Alert: Restriction Violation on Route');
            } else {
                setAlertMessage(null);
            }

        } catch (err) {
            console.error(err);
        }
    };

    const handleRouteSelect = (index: number) => {
        const selected = allRoutes[index];
        if (!selected) return;

        setSelectedRouteIndex(index);
        setNavStats({
            distance: parseFloat(selected.totalDistanceKm),
            duration: selected.totalDurationMin
        });

        if (selected.hasVehicleRestrictionViolations) {
            setAlertMessage(selected.warning || 'Alert: Restriction Violation on Route');
        } else {
            setAlertMessage(null);
        }
    };

    return (
        <div className="h-full w-full relative">
            {isNavigating ? (
                <MapLibreNavigation
                    routeSegments={currentRoute?.segments || []}
                    theme={theme}
                    viewMode={viewMode}
                />
            ) : (
                <MapComponent
                    activeStyle={viewMode === 'satellite' ? 'satellite' : 'standard'}
                    viewMode={viewMode}
                    showTraffic={layers.traffic}
                >
                    <HazardLayers hazards={hazards} visibleTypes={layers} />
                    <RoutingLayer
                        routes={allRoutes}
                        selectedIndex={selectedRouteIndex}
                        onRouteSelect={handleRouteSelect}
                    />
                </MapComponent>
            )}

            {alertMessage && <AlertBanner message={alertMessage} type="warning" onClose={() => setAlertMessage(null)} />}

            {/* Top Left - Search */}
            {!isNavigating && (
                <div className="absolute top-4 left-4 right-4 md:left-14 md:right-auto md:w-auto z-[400]">
                    <SearchBox onDestinationSelect={handleDestinationSelect} />
                </div>
            )}

            {/* Top Right - AQI */}
            <div className="absolute top-20 right-4 md:top-4 md:right-4 z-[400] flex flex-col gap-2">
                <AQIWidget />
            </div>

            {/* Lane Guidance Overlay - Mocked to show when route is active */}
            <LaneGuidance visible={allRoutes.length > 0} />

            {/* Bottom Right - Layer Toggles */}
            <div className="absolute bottom-20 right-4 md:bottom-8 md:right-4 z-[400] flex flex-col gap-4 items-end">
                <LocateButton />
                <VehicleSelector />
                <LayerToggles toggles={layers} onToggleConfig={handleToggle} />
            </div>

            {/* Bottom Left - Map Style Switcher */}
            <div className="absolute bottom-4 left-4 md:bottom-8 md:left-4 z-[400]">
                <MapStyleSwitcher currentViewMode={viewMode} onViewModeChange={setViewMode} />
            </div>

            {/* Pre-Navigation Route Info & Start Button */}
            {allRoutes.length > 0 && !isNavigating && (
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-[400] flex flex-col items-center gap-3">
                    {/* Route Stats Card */}
                    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-3 rounded-2xl shadow-2xl flex items-center gap-4 animate-slide-up">
                        <div className="flex flex-col">
                            <span className="text-emerald-400 font-orbitron font-bold text-lg leading-none">
                                {navStats.duration} min
                            </span>
                            <span className="text-slate-400 text-xs">
                                {navStats.distance.toFixed(1)} km
                            </span>
                        </div>
                        <div className="h-8 w-[1px] bg-slate-700" />
                        <button
                            onClick={() => {
                                setDestination(null);
                                setAllRoutes([]);
                                triggerRecenter();
                            }}
                            className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-red-400"
                            title="Clear Route"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Start Button */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setIsNavigating(true);
                                setFollowMode(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 ring-4 ring-blue-600/20"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            </svg>
                            Start Navigation
                        </button>

                        {/* Simulation Button */}
                        <button
                            onClick={() => {
                                // Flatten segments to get raw coordinates path
                                const flatRoute = routeSegments.flatMap(s => s.coordinates);
                                startSimulation(flatRoute);
                            }}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 ring-4 ring-purple-600/20"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Simulate
                        </button>
                    </div>
                </div>
            )}

            {/* Re-Center Button */}
            {isNavigating && !followMode && (
                <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-[400]">
                    <button
                        onClick={() => setFollowMode(true)}
                        className="bg-white text-blue-600 font-bold py-2 px-6 rounded-full shadow-lg border border-blue-200 animate-bounce"
                    >
                        Re-center
                    </button>
                </div>
            )}

            {/* Navigation Overlay */}
            {isNavigating && (
                <NavigationOverlay
                    distanceKm={navStats.distance}
                    durationMin={navStats.duration}
                    onExit={() => {
                        setIsNavigating(false);
                        setFollowMode(false);
                        // Trigger recenter on the Leaflet map so it's not stuck at London or previous view
                        triggerRecenter();
                    }}
                    onStop={() => {
                        if (isSimulating) {
                            stopSimulation();
                        }
                        setIsNavigating(false);
                        setFollowMode(false);
                        setDestination(null);
                        setAllRoutes([]);
                        triggerRecenter();
                    }}
                />
            )}
        </div>
    );
};

export default MapDashboard;
