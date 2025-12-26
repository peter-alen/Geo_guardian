import React, { useEffect } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useMapContext } from '../../context/MapContext';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Ensure leafet icon is set up
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const UserMarker: React.FC = () => {
    const { userLocation } = useMapContext();
    const map = useMap();

    useEffect(() => {
        if (userLocation) {
            map.flyTo([userLocation.lat, userLocation.lng], map.getZoom(), {
                animate: true,
                duration: 1.5 // Smooth animation
            });
        }
    }, [userLocation, map]);

    if (!userLocation) return null;

    return (
        <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>
                <div className="text-center">
                    <p className="font-bold">You are here</p>
                    {userLocation.speed !== null && <p>Speed: {(userLocation.speed * 3.6).toFixed(1)} km/h</p>}
                </div>
            </Popup>
        </Marker>
    );
};

export default UserMarker;
