import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapComponent from '../components/Map/MapComponent';
import SearchBox from '../components/UI/SearchBox';
import LayerToggles from '../components/UI/LayerToggles';
import MapStyleSwitcher from '../components/UI/MapStyleSwitcher';
import HazardLayers from '../components/Map/HazardLayers';
import RoutingLayer from '../components/Map/RoutingLayer';
import AlertBanner from '../components/UI/AlertBanner';
import AQIWidget from '../components/UI/AQIWidget';
import VehicleSelector from '../components/UI/VehicleSelector';
import LaneGuidance from '../components/UI/LaneGuidance';
import { useAuth } from '../context/AuthContext';
import { useMapContext } from '../context/MapContext';

const MapDashboard: React.FC = () => {
    const { user } = useAuth();
    const { userLocation, setDestination } = useMapContext();
    const [layers, setLayers] = useState({
        school_zone: true,
        hospital_zone: true,
        speed_breaker: true,
        sharp_turn: true,
        restrictions: true,
        traffic: false
    });
    const [mapStyle, setMapStyle] = useState('standard');
    const [routeSegments, setRouteSegments] = useState<any[]>([]);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [hazards, setHazards] = useState<any[]>([]);

    useEffect(() => {
        // Fetch hazards
        axios.get('http://localhost:5000/api/hazards')
            .then(res => setHazards(res.data))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (userLocation) {
            checkProximity(userLocation.lat, userLocation.lng);
        }
    }, [userLocation]);

    const checkProximity = (lat: number, lng: number) => {
        if (!hazards.length) return;

        hazards.forEach(h => {
            const [hLng, hLat] = h.location.coordinates;
            const dist = getDistanceFromLatLonInKm(lat, lng, hLat, hLng);
            // Threshold 0.2km (200m)
            if (dist < 0.2) {
                const msg = `${h.type.replace('_', ' ').toUpperCase()} AHEAD: ${h.name}`;
                setAlertMessage(msg);
                speak(msg);
            }
        });
    };

    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            if (window.speechSynthesis.speaking) return;
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        }
    };

    function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2 - lat1);
        var dLon = deg2rad(lon2 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d;
    }

    function deg2rad(deg: number) {
        return deg * (Math.PI / 180)
    }

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

            setRouteSegments(res.data.segments);

            if (res.data.hasVehicleRestrictionViolations) {
                setAlertMessage(res.data.warning || 'Alert: Restriction Violation on Route');
            } else {
                setAlertMessage(null);
            }

        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="h-full w-full relative">
            <MapComponent activeStyle={mapStyle} showTraffic={layers.traffic}>
                <HazardLayers hazards={hazards} visibleTypes={layers} />
                <RoutingLayer segments={routeSegments} />
            </MapComponent>

            {alertMessage && <AlertBanner message={alertMessage} type="warning" onClose={() => setAlertMessage(null)} />}

            {/* Top Left - Search */}
            <div className="absolute top-4 left-4 right-4 md:left-14 md:right-auto md:w-auto z-[400]">
                <SearchBox onDestinationSelect={handleDestinationSelect} />
            </div>

            {/* Top Right - AQI */}
            <div className="absolute top-20 right-4 md:top-4 md:right-4 z-[400] flex flex-col gap-2">
                <AQIWidget />
            </div>

            {/* Lane Guidance Overlay - Mocked to show when route is active */}
            <LaneGuidance visible={routeSegments.length > 0} />

            {/* Bottom Right - Layer Toggles */}
            <div className="absolute bottom-20 right-4 md:bottom-8 md:right-4 z-[400] flex flex-col gap-4 items-end">
                <VehicleSelector />
                <LayerToggles toggles={layers} onToggleConfig={handleToggle} />
            </div>

            {/* Bottom Left - Map Style Switcher */}
            <div className="absolute bottom-4 left-4 md:bottom-8 md:left-4 z-[400]">
                <MapStyleSwitcher currentStyle={mapStyle} onStyleChange={setMapStyle} />
            </div>
        </div>
    );
};

export default MapDashboard;

