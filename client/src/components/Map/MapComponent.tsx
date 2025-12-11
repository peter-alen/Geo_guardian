import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon missing in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const LocationMarker: React.FC<{ onLocationUpdate?: (lat: number, lng: number) => void }> = ({ onLocationUpdate }) => {
    const [position, setPosition] = useState<LatLngExpression | null>(null);
    const map = useMap();

    useEffect(() => {
        map.locate().on("locationfound", function (e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
            if (onLocationUpdate) onLocationUpdate(e.latlng.lat, e.latlng.lng);
        });
    }, [map, onLocationUpdate]);

    return position === null ? null : (
        <Marker position={position}>
            <Popup>You are here</Popup>
        </Marker>
    );
};

const MapComponent: React.FC<{ children?: React.ReactNode; onLocationUpdate?: (lat: number, lng: number) => void }> = ({ children, onLocationUpdate }) => {
    // Default position: London
    const defaultPosition: LatLngExpression = [51.505, -0.09];

    return (
        <MapContainer center={defaultPosition} zoom={13} scrollWheelZoom={true} className="h-full w-full z-0">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker onLocationUpdate={onLocationUpdate} />
            {children}
        </MapContainer>
    );
};

export default MapComponent;
