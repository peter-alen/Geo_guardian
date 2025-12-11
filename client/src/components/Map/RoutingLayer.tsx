import React from 'react';
import { Polyline, Popup, Marker } from 'react-leaflet';
import L from 'leaflet';

interface RouteSegment {
    coordinates: [number, number][];
    isRestricted: boolean;
}

interface RoutingLayerProps {
    segments: RouteSegment[];
}

const RoutingLayer: React.FC<RoutingLayerProps> = ({ segments }) => {
    if (!segments || segments.length === 0) return null;

    const startPoint = segments[0].coordinates[0];
    const endPoint = segments[segments.length - 1].coordinates[segments[segments.length - 1].coordinates.length - 1];

    return (
        <>
            {/* Start Marker */}
            <Marker position={startPoint} icon={new L.Icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
                iconSize: [25, 41], iconAnchor: [12, 41]
            })}>
                <Popup>Start</Popup>
            </Marker>

            {/* End Marker */}
            <Marker position={endPoint} icon={new L.Icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
                iconSize: [25, 41], iconAnchor: [12, 41]
            })}>
                <Popup>Destination</Popup>
            </Marker>

            {segments.map((seg, i) => (
                <Polyline
                    key={i}
                    positions={seg.coordinates}
                    pathOptions={{
                        color: seg.isRestricted ? 'red' : 'blue',
                        dashArray: seg.isRestricted ? '10, 10' : undefined,
                        weight: 5
                    }}
                >
                    {seg.isRestricted && <Popup>Restricted Road for your vehicle!</Popup>}
                </Polyline>
            ))}
        </>
    );
};

export default RoutingLayer;
