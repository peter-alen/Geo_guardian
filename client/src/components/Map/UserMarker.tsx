import React, { useEffect, useMemo, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { useMapContext } from '../../context/MapContext';
import { useAuth } from '../../context/AuthContext';
import { calculateBearing, getDistance } from '../../utils/mapUtils';
import carIcon from '../../assets/car1.png';
import heavyIcon from '../../assets/heavy1.svg';
import emergencyIcon from '../../assets/emergency1.svg';

const UserMarker: React.FC = () => {
    const { userLocation, isNavigating } = useMapContext();
    const { user } = useAuth();


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

    const customIcon = useMemo(() => {
        // If not navigating, show Google Maps style "View Mode" marker (Dot + Beam)
        if (!isNavigating) {
            const size = 80; // Size for the beam container

            const iconMarkup = renderToStaticMarkup(
                <div className="relative flex items-center justify-center w-full h-full">
                    {/* The Beam - Rotated with heading */}
                    <div
                        className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-linear"
                        style={{
                            transform: `rotate(${displayHeading}deg)`
                        }}
                    >
                        {/* 
                           Beam using conic-gradient.
                           We want a sector pointing UP (0deg).
                           Width: ~60 degrees.
                           Fade edges.
                        */}
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                background: `conic-gradient(from 330deg at 50% 50%, 
                                    rgba(66, 133, 244, 0) 0deg, 
                                    rgba(66, 133, 244, 0.5) 30deg, 
                                    rgba(66, 133, 244, 0) 60deg
                                )`,
                                borderRadius: '50%',
                            }}
                        />
                    </div>

                    {/* The Dot - Stays centered, on top */}
                    <div className="relative z-10 w-4 h-4 bg-[#4285F4] border-[2px] border-white rounded-full shadow-[0_0_10px_rgba(0,0,0,0.2)]" />
                </div>
            );

            return L.divIcon({
                html: iconMarkup,
                className: 'custom-view-icon bg-transparent',
                // Size must be large enough to contain the beam
                iconSize: [size, size],
                // Anchor at center
                iconAnchor: [size / 2, size / 2],
                popupAnchor: [0, -10]
            });
        }

        // Navigation Mode: Show Vehicle Icon
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
                <div
                    id="vehicle-icon-inner"
                    className="relative z-10 transition-transform duration-500 ease-linear"
                    style={{
                        transform: `rotate(${displayHeading}deg)`,
                        width: `${size}px`,
                        height: `${size}px`,
                        backgroundImage: `url(${iconSrc})`,
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
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
    }, [user?.vehicleType, displayHeading, isNavigating]);



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
