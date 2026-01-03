import React, { useEffect, useMemo, useState } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { useMapContext } from '../../context/MapContext';
import { useAuth } from '../../context/AuthContext';
import { calculateBearing, getDistance } from '../../utils/mapUtils';
import carIcon from '../../assets/car1.svg';
import heavyIcon from '../../assets/heavy1.svg';
import emergencyIcon from '../../assets/emergency1.svg';

const UserMarker: React.FC = () => {
    const { userLocation } = useMapContext();
    const { user } = useAuth();
    const map = useMap();

    // State for smooth rotation
    const [currentHeading, setCurrentHeading] = useState(0);
    const [prevPosition, setPrevPosition] = useState<{ lat: number, lng: number } | null>(null);

    // Update heading based on movement
    useEffect(() => {
        if (!userLocation) return;

        if (prevPosition) {
            const dist = getDistance(prevPosition.lat, prevPosition.lng, userLocation.lat, userLocation.lng);

            // Only update heading if moved more than 3 meters to avoid jitter
            if (dist > 3) {
                const newBearing = calculateBearing(prevPosition.lat, prevPosition.lng, userLocation.lat, userLocation.lng);
                setCurrentHeading(newBearing);
                setPrevPosition({ lat: userLocation.lat, lng: userLocation.lng });
            }
        } else {
            // First mock position set
            setPrevPosition({ lat: userLocation.lat, lng: userLocation.lng });
        }
    }, [userLocation, prevPosition]); // Dependency only on userLocation changes

    // Priority: use API heading if high accuracy/speed (optional), otherwise use calculated
    // For this task, we prioritize our calculated heading for "realistic" movement smoothing
    const displayHeading = currentHeading;

    // Create custom icon based on vehicle type
    const customIcon = useMemo(() => {
        const vehicleType = user?.vehicleType || 'car';
        let iconSrc = carIcon;
        let size = 48;

        switch (vehicleType) {
            case 'heavy':
                iconSrc = heavyIcon;
                size = 56;
                break;
            case 'emergency':
                iconSrc = emergencyIcon;
                size = 52;
                break;
            default:
                iconSrc = carIcon;
                size = 48;
        }

        const iconMarkup = renderToStaticMarkup(
            <div className="relative flex items-center justify-center w-full h-full">
                {/* Pulsing effect underneath */}
                <div
                    className="absolute inset-0 rounded-full opacity-20 animate-ping bg-emerald-500/50"
                    style={{ transform: 'scale(0.8)' }}
                />

                {/* The Vehicle Icon - Rotated */}
                {/* We rotate this inner div via CSS based on the re-render state OR we could do it via ref for less re-renders.
                    Given prompt requirements for "Update rotation angle dynamically... Rotation must feel smooth", 
                    passing it here in styles works well with React reconciliation if userLocation updates frequently. 
                    However, for ultra-smoothness independent of React render cycle, direct DOM manipulation via ref is better.
                    BUT, since we are using L.divIcon string generation, we can't easily attach a React Ref to the string output.
                    So we rely on the `key` or re-render of this icon instance or use the inline style method below.
                */}
                <div
                    id="vehicle-icon-inner"
                    className="relative z-10 transition-transform duration-300 ease-linear shadow-xl drop-shadow-lg"
                    style={{
                        transform: `rotate(${displayHeading}deg)`,
                        width: `${size}px`,
                        height: `${size}px`,
                        backgroundImage: `url(${iconSrc})`,
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.3))'
                    }}
                />
            </div>
        );

        return L.divIcon({
            html: iconMarkup,
            className: 'custom-vehicle-icon bg-transparent',
            iconSize: [size * 1.5, size * 1.5],
            iconAnchor: [size * 0.75, size * 0.75],
            popupAnchor: [0, -size / 2]
        });
    }, [user?.vehicleType, displayHeading]);

    useEffect(() => {
        if (userLocation) {
            map.flyTo([userLocation.lat, userLocation.lng], map.getZoom(), {
                animate: true,
                duration: 1.0 // S slightly faster animation to keep up with movement
            });
        }
    }, [userLocation, map]);

    if (!userLocation) return null;

    return (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={customIcon}>
            <Popup>
                <div className="text-center p-2 min-w-[120px]">
                    <p className="font-orbitron font-bold text-sm mb-1 text-emerald-400">Current Location</p>
                    <div className="text-xs text-slate-300">
                        {user?.vehicleType && <span className="capitalize block mb-1 font-medium badge badge-outline">Mode: {user.vehicleType}</span>}
                        {userLocation.speed !== null && (
                            <span className="font-mono text-cyan-300">{(userLocation.speed * 3.6).toFixed(1)} km/h</span>
                        )}
                        <div className="mt-1 text-slate-500 text-[10px]">Heading: {displayHeading.toFixed(0)}°</div>
                    </div>
                </div>
            </Popup>
        </Marker>
    );
};

export default UserMarker;
