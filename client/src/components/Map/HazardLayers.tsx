import React from 'react';
import { Circle, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

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

const speedBreakerIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2312/2312959.png', // Placeholder
    iconSize: [25, 25]
});

const turnIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/62/62512.png', // Placeholder
    iconSize: [25, 25]
});

const HazardLayers: React.FC<HazardLayersProps> = ({ hazards, visibleTypes }) => {
    return (
        <>
            {hazards.map(h => {
                const [lng, lat] = h.location.coordinates;

                // Check visibility
                if (!visibleTypes[h.type]) return null;

                if (h.type === 'school_zone') {
                    return (
                        <Circle
                            key={h._id}
                            center={[lat, lng]}
                            radius={h.radiusMeters || 100}
                            pathOptions={{ color: 'orange', fillColor: 'orange', fillOpacity: 0.2 }}
                        >
                            <Popup>School Zone: {h.name}</Popup>
                        </Circle>
                    );
                }

                if (h.type === 'hospital_zone') {
                    return (
                        <Circle
                            key={h._id}
                            center={[lat, lng]}
                            radius={h.radiusMeters || 100}
                            pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.2 }}
                        >
                            <Popup>Hospital Zone: {h.name}</Popup>
                        </Circle>
                    );
                }

                if (h.type === 'speed_breaker') {
                    return (
                        <Marker key={h._id} position={[lat, lng]} icon={speedBreakerIcon}>
                            <Popup>Speed Breaker</Popup>
                        </Marker>
                    )
                }

                if (h.type === 'sharp_turn') {
                    return (
                        <Marker key={h._id} position={[lat, lng]} icon={turnIcon}>
                            <Popup>Sharp Turn</Popup>
                        </Marker>
                    )
                }

                return (
                    <Marker key={h._id} position={[lat, lng]}>
                        <Popup>{h.name}</Popup>
                    </Marker>
                );
            })}
        </>
    );
};

export default HazardLayers;
