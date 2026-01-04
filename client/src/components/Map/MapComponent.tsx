import React from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L, { type LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
// import LocateControl from './LocateControl';
import RecenterHandler from './RecenterHandler';
import UserMarker from './UserMarker';
import NavigationCamera from './NavigationCamera';
import { useMapContext } from '../../context/MapContext';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;



// Helper component to toggle 3D class on the map container
const Effect3DView = () => {
    const map = useMap(); // Get Leaflet instance
    const { isNavigating, followMode } = useMapContext();

    React.useEffect(() => {
        const container = map.getContainer();
        if (isNavigating && followMode) {
            container.classList.add('map-navigation-3d');
        } else {
            container.classList.remove('map-navigation-3d');
        }
    }, [map, isNavigating, followMode]);

    return null;
};

const MapComponent: React.FC<{
    children?: React.ReactNode;
    activeStyle?: string;
    showTraffic?: boolean;
}> = ({ children, activeStyle = 'standard', showTraffic = false }) => {
    // Default position: London (or User's last known) - this could be dynamic
    const defaultPosition: LatLngExpression = [51.505, -0.09];

    // Note: We don't use className prop on MapContainer for dynamic updates
    // because React-Leaflet might not propagate it after mount.
    // Instead we use the Effect3DView helper.

    return (
        <MapContainer center={defaultPosition} zoom={13} scrollWheelZoom={true} className="h-full w-full z-0">
            <Effect3DView />
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
            {/* <LocateControl /> - Replaced by UI Button in MapDashboard */}
            <RecenterHandler />
            <NavigationCamera />
            {children}
        </MapContainer>
    );
};

export default MapComponent;
