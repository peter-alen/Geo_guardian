import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMapContext } from '../../context/MapContext';
import { useAuth } from '../../context/AuthContext';
import carIcon from '../../assets/car1.png';
import heavyIcon from '../../assets/heavy1.svg';
import emergencyIcon from '../../assets/emergency1.svg';

interface MapLibreNavigationProps {
    routeSegments: any[];
    theme: 'light' | 'dark';
    viewMode: '2d' | '3d' | 'satellite';
}

const MapLibreNavigation: React.FC<MapLibreNavigationProps> = ({ routeSegments, theme, viewMode }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const markerRef = useRef<maplibregl.Marker | null>(null);
    const { userLocation, followMode, setFollowMode } = useMapContext();
    const { user } = useAuth();
    const [mapLoaded, setMapLoaded] = useState(false);

    // 1. Initialize MapLibre
    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://tiles.openfreemap.org/styles/liberty', // Default
            center: userLocation ? [userLocation.lng, userLocation.lat] : [-0.09, 51.505],
            zoom: 17,
            pitch: viewMode === '2d' ? 0 : 60,
            bearing: userLocation?.heading || 0
        });

        map.current.on('dragstart', () => setFollowMode(false));
        map.current.on('pitchstart', () => setFollowMode(false));

        map.current.on('load', () => {
            setMapLoaded(true);
            updateMapStyle(map.current!, theme, viewMode);
        });

        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, []);

    // 2. Handle Style & Theme Updates
    useEffect(() => {
        if (!map.current || !mapLoaded) return;
        updateMapStyle(map.current, theme, viewMode);
    }, [theme, viewMode, mapLoaded]);

    const updateMapStyle = (mapInstance: maplibregl.Map, currentTheme: string, currentView: string) => {
        // --- 1. View Mode (Perspective) ---
        if (currentView === '2d') {
            mapInstance.easeTo({ pitch: 0 });
        } else if (currentView === '3d' || currentView === 'satellite') {
            // Keep pitch for 3D/Sat if desired, or set it
            if (currentView === '3d') mapInstance.easeTo({ pitch: 60 });
            // Satellite might want 0 or 60 depending on preference, sticking to 60 for nav feel if tracking
        }

        // --- 2. Style / Colors ---
        // Basic Raster Satellite Layer handling could go here if we had a source URL
        // For now, we are modifying the vector style colors.

        const style = mapInstance.getStyle();
        if (!style || !style.layers) return;

        const isDark = currentTheme === 'dark';

        style.layers.forEach((layer) => {
            // Backgrounds
            if (layer.type === 'background') {
                mapInstance.setPaintProperty(layer.id, 'background-color', isDark ? '#0f172a' : '#f8fafc');
            }
            if (layer.type === 'fill') {
                // Land / Ground
                mapInstance.setPaintProperty(layer.id, 'fill-color', isDark ? '#1e293b' : '#e2e8f0');
            }

            // Roads
            if (layer.type === 'line') {
                // Heuristic: identify road layers
                if (layer.id.includes('road') || layer.id.includes('highway') || layer.id.includes('transportation')) {
                    mapInstance.setPaintProperty(layer.id, 'line-color', isDark ? '#64748b' : '#ffffff');
                }
            }

            // Text
            if (layer.type === 'symbol') {
                mapInstance.setPaintProperty(layer.id, 'text-color', isDark ? '#e2e8f0' : '#1e293b');
                mapInstance.setPaintProperty(layer.id, 'text-halo-color', isDark ? '#0f172a' : '#ffffff');
            }

            // Buildings (3D)
            if (layer.type === 'fill-extrusion') {
                // Toggle visibility based on viewMode?
                // Usually we want them in 3D, maybe not in 2D or Satellite?
                // For now, let's keep them but style them.

                mapInstance.setPaintProperty(layer.id, 'fill-extrusion-color', isDark ? '#334155' : '#cbd5e1');
                mapInstance.setPaintProperty(layer.id, 'fill-extrusion-opacity', currentView === '2d' ? 0 : 0.9);
            }
        });
    };

    // 3. Update Camera & Marker
    useEffect(() => {
        if (!map.current || !mapLoaded || !userLocation) return;

        const { lat, lng, heading } = userLocation;

        // Camera Follow
        if (followMode) {
            map.current.easeTo({
                center: [lng, lat],
                zoom: 18,
                pitch: viewMode === '2d' ? 0 : 60,
                bearing: heading || 0,
                duration: 1000,
                easing: (t) => t
            });
        }

        // Determine Icon
        const vehicleType = user?.vehicleType || 'car';
        let iconSrc = carIcon;
        if (vehicleType === 'heavy') iconSrc = heavyIcon;
        if (vehicleType === 'emergency') iconSrc = emergencyIcon;

        // Marker Update
        if (!markerRef.current) {
            const el = document.createElement('div');
            el.className = 'vehicle-marker-3d';
            el.style.width = '50px';
            el.style.height = '50px';

            const img = document.createElement('img');
            img.src = iconSrc;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.display = 'block';
            img.alt = "Vehicle";

            el.appendChild(img);

            markerRef.current = new maplibregl.Marker({ element: el })
                .setLngLat([lng, lat])
                .addTo(map.current);
        } else {
            markerRef.current.setLngLat([lng, lat]);
            const img = markerRef.current.getElement().querySelector('img');
            if (img && img.src !== iconSrc && !img.src.endsWith(iconSrc)) {
                img.src = iconSrc;
            }
        }

    }, [userLocation, mapLoaded, followMode, user?.vehicleType, viewMode]);

    // 4. Render Route
    useEffect(() => {
        if (!map.current || !mapLoaded || routeSegments.length === 0) return;

        const coordinates = routeSegments.flatMap(seg => seg.coordinates.map((c: number[]) => [c[1], c[0]]));

        if (map.current.getSource('route')) {
            (map.current.getSource('route') as maplibregl.GeoJSONSource).setData({
                type: 'Feature',
                properties: {},
                geometry: { type: 'LineString', coordinates }
            });
        } else {
            map.current.addSource('route', {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'properties': {},
                    'geometry': { type: 'LineString', coordinates }
                }
            });
            map.current.addLayer({
                'id': 'route',
                'type': 'line',
                'source': 'route',
                'layout': { 'line-join': 'round', 'line-cap': 'round' },
                'paint': {
                    'line-color': '#3b82f6',
                    'line-width': 8,
                    'line-opacity': 0.8
                }
            });
        }
    }, [routeSegments, mapLoaded]);

    return <div ref={mapContainer} className="w-full h-full" />;
};

export default MapLibreNavigation;
