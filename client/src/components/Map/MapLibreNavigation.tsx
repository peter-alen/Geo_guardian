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
}

const MapLibreNavigation: React.FC<MapLibreNavigationProps> = ({ routeSegments }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const markerRef = useRef<maplibregl.Marker | null>(null);
    const { userLocation, followMode, setFollowMode } = useMapContext();
    const { user } = useAuth(); // Get user for vehicleType
    const [mapLoaded, setMapLoaded] = useState(false);

    // 1. Initialize MapLibre
    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://tiles.openfreemap.org/styles/liberty', // Free style with OSM data
            center: userLocation ? [userLocation.lng, userLocation.lat] : [-0.09, 51.505],
            zoom: 17,
            pitch: 60,
            bearing: userLocation?.heading || 0
        });

        // Disable follow mode on interaction
        map.current.on('dragstart', () => setFollowMode(false));
        map.current.on('pitchstart', () => setFollowMode(false));

        map.current.on('load', () => {
            setMapLoaded(true);

            // --- Force "Night Mode" by overwriting all layer colors ---
            const mapInstance = map.current!;
            const style = mapInstance.getStyle();

            style.layers?.forEach((layer) => {
                // 1. Backgrounds & Land
                if (layer.type === 'background') {
                    mapInstance.setPaintProperty(layer.id, 'background-color', '#0f172a'); // Deep Blue/Black
                }
                if (layer.type === 'fill') {
                    // This creates a uniform dark ground, covering "landuse" (yellow) layers
                    mapInstance.setPaintProperty(layer.id, 'fill-color', '#1e293b'); // Dark Slate
                    mapInstance.setPaintProperty(layer.id, 'fill-opacity', 1);
                }

                // 2. Roads
                if (layer.type === 'line') {
                    // Make roads lighter so they pop against dark ground
                    mapInstance.setPaintProperty(layer.id, 'line-color', '#64748b'); // Slate-500
                }

                // 3. Text
                if (layer.type === 'symbol') {
                    mapInstance.setPaintProperty(layer.id, 'text-color', '#e2e8f0'); // White-ish
                    mapInstance.setPaintProperty(layer.id, 'text-halo-color', '#0f172a'); // Dark halo
                }

                // 4. Existing 3D Buildings (Restyle them)
                if (layer.type === 'fill-extrusion') {
                    mapInstance.setPaintProperty(layer.id, 'fill-extrusion-color', '#334155'); // Dark Grey
                    mapInstance.setPaintProperty(layer.id, 'fill-extrusion-opacity', 0.9);

                    // Force minimum height to ensure visibility even if data is missing
                    mapInstance.setPaintProperty(layer.id, 'fill-extrusion-height', [
                        'interpolate', ['linear'], ['zoom'],
                        13, 0,
                        14, ['coalesce', ['get', 'render_height'], ['get', 'height'], 20]
                    ]);
                    mapInstance.setPaintProperty(layer.id, 'fill-extrusion-base', [
                        'interpolate', ['linear'], ['zoom'],
                        13, 0,
                        14, ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], 0]
                    ]);
                }
            });
        });

        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, []);

    // 3. Update Camera & Marker
    useEffect(() => {
        if (!map.current || !mapLoaded || !userLocation) return;

        const { lat, lng, heading } = userLocation;

        // Camera Follow
        if (followMode) {
            map.current.easeTo({
                center: [lng, lat],
                zoom: 18,
                pitch: 60,
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
        if (!userLocation) return;

        if (!markerRef.current) {
            console.log("Creating new Vehicle Marker", vehicleType);
            const el = document.createElement('div');
            el.className = 'vehicle-marker-3d';

            // Explicit dimensions are crucial
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
            console.log("Updating Vehicle Marker Position", lng, lat);
            // Update Position
            markerRef.current.setLngLat([lng, lat]);

            // Update Icon if changed (dynamic switching)
            const img = markerRef.current.getElement().querySelector('img');
            if (img && img.src !== iconSrc && !img.src.endsWith(iconSrc)) {
                // Note: img.src is full URL, iconSrc might be relative/imported.
                // Safe check: just update it. React won't re-render this DOM, we do it manually.
                img.src = iconSrc;
            }
        }

    }, [userLocation, mapLoaded, followMode, user?.vehicleType]);

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
