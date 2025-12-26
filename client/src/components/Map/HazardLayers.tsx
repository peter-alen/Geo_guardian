import React from 'react';
import { Circle, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { AlertTriangle, Zap, Activity, Info } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

interface Hazard {
    _id: string;
    name: string;
    type: 'school_zone' | 'hospital_zone' | 'speed_breaker' | 'sharp_turn';
    location: {
        coordinates: [number, number]; // [lng, lat]
    };
    radiusMeters?: number;
}

interface HazardLayersProps {
    hazards: Hazard[];
    visibleTypes: Record<string, boolean>;
}

const createGlowIcon = (icon: React.ReactElement, colorClass: string, shadowColor: string) => {
    const html = renderToStaticMarkup(
        <div className={`relative flex items-center justify-center w-8 h-8 rounded-full bg-slate-900/90 border-2 ${colorClass} shadow-[0_0_15px_${shadowColor}] backdrop-blur-md`}>
            <div className={`text-white w-5 h-5 drop-shadow-[0_0_5px_${shadowColor}]`}>
                {icon}
            </div>
            <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${colorClass.replace('border-', 'bg-')}`}></div>
        </div>
    );
    return L.divIcon({
        html,
        className: 'bg-transparent',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });
};

const speedBreakerIcon = createGlowIcon(<Activity />, 'border-orange-500', 'rgba(249,115,22,0.6)');
const turnIcon = createGlowIcon(<Zap />, 'border-yellow-400', 'rgba(250,204,21,0.6)');
const schoolIcon = createGlowIcon(<Info />, 'border-blue-400', 'rgba(96,165,250,0.6)');
const hospitalIcon = createGlowIcon(<AlertTriangle />, 'border-red-500', 'rgba(239,68,68,0.6)');

const HazardLayers: React.FC<HazardLayersProps> = ({ hazards, visibleTypes }) => {
    // Icons need to be recreated if props change? No, static for now.

    return (
        <>
            {hazards.map(h => {
                const [lng, lat] = h.location.coordinates;
                if (!visibleTypes[h.type]) return null;

                let icon = speedBreakerIcon;
                let color = 'orange';

                if (h.type === 'school_zone') {
                    icon = schoolIcon;
                    color = 'blue';
                } else if (h.type === 'hospital_zone') {
                    icon = hospitalIcon;
                    color = 'red';
                } else if (h.type === 'sharp_turn') {
                    icon = turnIcon;
                    color = 'yellow';
                }

                const isZone = h.type === 'school_zone' || h.type === 'hospital_zone';

                return (
                    <React.Fragment key={h._id}>
                        {isZone && (
                            <Circle
                                center={[lat, lng]}
                                radius={h.radiusMeters || 100}
                                pathOptions={{
                                    color: color,
                                    fillColor: color,
                                    fillOpacity: 0.1,
                                    weight: 1,
                                    dashArray: '5, 10'
                                }}
                            />
                        )}
                        <Marker position={[lat, lng]} icon={icon}>
                            <Popup className="futuristic-popup">
                                <div className="font-orbitron font-bold text-sm uppercase tracking-wider">{h.name}</div>
                                <div className="text-xs text-slate-500 font-mono mt-1">{h.type.replace('_', ' ')}</div>
                            </Popup>
                        </Marker>
                    </React.Fragment>
                );
            })}
        </>
    );
};

export default HazardLayers;
