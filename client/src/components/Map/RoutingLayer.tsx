import React from 'react';
import { Polyline, Popup, Marker } from 'react-leaflet';
import L from 'leaflet';

interface RouteData {
    totalDistanceKm: string;
    totalDurationMin: number;
    hasVehicleRestrictionViolations: boolean;
    warning: string | null;
    segments: {
        coordinates: [number, number][];
        isRestricted: boolean;
    }[];
}

interface RoutingLayerProps {
    routes: RouteData[];
    selectedIndex: number;
    onRouteSelect: (index: number) => void;
}

const RoutingLayer: React.FC<RoutingLayerProps> = ({ routes, selectedIndex, onRouteSelect }) => {
    if (!routes || routes.length === 0) return null;

    // Use the primary (first) route for markers
    const primaryRoute = routes[0];
    const startPoint = primaryRoute.segments[0].coordinates[0];
    const endPoint = primaryRoute.segments[primaryRoute.segments.length - 1].coordinates[primaryRoute.segments[primaryRoute.segments.length - 1].coordinates.length - 1];

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

            {/* Render all routes. Inactive routes first, active route last to ensure it's on top */}
            {[...routes]
                .map((r, i) => ({ ...r, originalIndex: i }))
                .sort((a, b) => (a.originalIndex === selectedIndex ? 1 : b.originalIndex === selectedIndex ? -1 : 0))
                .map((route) => {
                    const isSelected = route.originalIndex === selectedIndex;
                    const color = route.hasVehicleRestrictionViolations ? '#ef4444' : (isSelected ? '#3b82f6' : '#f59e0b');
                    const weight = isSelected ? 8 : 5;
                    const opacity = isSelected ? 1 : 0.6;

                    return (
                        <React.Fragment key={route.originalIndex}>
                            {/* Halo effect for active route */}
                            {isSelected && route.segments.map((seg, segIdx) => (
                                <Polyline
                                    key={`halo-${route.originalIndex}-${segIdx}`}
                                    positions={seg.coordinates}
                                    pathOptions={{
                                        color: '#ffffff',
                                        weight: weight + 4,
                                        opacity: 0.3,
                                        lineJoin: 'round'
                                    }}
                                />
                            ))}

                            {route.segments.map((seg, segIdx) => (
                                <Polyline
                                    key={`${route.originalIndex}-${segIdx}`}
                                    positions={seg.coordinates}
                                    eventHandlers={{
                                        click: (e) => {
                                            L.DomEvent.stopPropagation(e);
                                            onRouteSelect(route.originalIndex);
                                        }
                                    }}
                                    pathOptions={{
                                        color: color,
                                        dashArray: seg.isRestricted ? '10, 10' : undefined,
                                        weight: weight,
                                        opacity: opacity,
                                        lineJoin: 'round',
                                        interactive: true
                                    }}
                                >
                                    <Popup>
                                        <div className="font-sans min-w-[120px]">
                                            <p className="font-bold text-slate-900">{route.totalDurationMin} min</p>
                                            <p className="text-sm text-slate-600">{route.totalDistanceKm} km</p>
                                            {!isSelected && <p className="text-xs text-orange-600 mt-1 font-medium">Click to use this route</p>}
                                            {seg.isRestricted && <p className="text-xs text-red-500 mt-1 uppercase font-bold">Restriction Detected</p>}
                                        </div>
                                    </Popup>
                                </Polyline>
                            ))}
                        </React.Fragment>
                    );
                })}
        </>
    );
};

export default RoutingLayer;
