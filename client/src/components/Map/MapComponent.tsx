import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L, { type LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon missing in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import LocateControl from './LocateControl';
import UserMarker from './UserMarker';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;



const MapComponent: React.FC<{
    children?: React.ReactNode;
    activeStyle?: string;
    showTraffic?: boolean;
}> = ({ children, activeStyle = 'standard', showTraffic = false }) => {
    // Default position: London (or User's last known) - this could be dynamic
    const defaultPosition: LatLngExpression = [51.505, -0.09];

    return (
        <MapContainer center={defaultPosition} zoom={13} scrollWheelZoom={true} className="h-full w-full z-0">
            {activeStyle === 'standard' && (
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={19}
                />
            )}
            {activeStyle === 'satellite' && (
                <TileLayer
                    attribution='&copy; Google Maps'
                    url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                    maxZoom={20}
                />
            )}

            {showTraffic && (
                <TileLayer
                    url="https://mt1.google.com/vt/lyrs=h,traffic&x={x}&y={y}&z={z}"
                    maxZoom={20}
                    opacity={0.7}
                />
            )}

            <UserMarker />
            <LocateControl />
            {children}
        </MapContainer>
    );
};

export default MapComponent;
