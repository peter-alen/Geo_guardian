import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapContext } from '../../context/MapContext';
import carIcon from '../../assets/car.png'; // Assuming same icon usage

// Ensure this token is set in your .env file as VITE_MAPBOX_TOKEN
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface MapboxNavigationProps {
    routeSegments: any[]; // Adjust type if strictly defined
}

const MapboxNavigation: React.FC<MapboxNavigationProps> = ({ routeSegments }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markerRef = useRef<mapboxgl.Marker | null>(null);
    const { userLocation } = useMapContext();
    const [mapLoaded, setMapLoaded] = useState(false);

    // 1. Initialize Map
    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        if (!mapboxgl.accessToken) {
            console.error("Mapbox Token missing! Please add VITE_MAPBOX_TOKEN to .env");
            return;
        }

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12', // Or navigation-night-v1 for cool dark mode
            center: userLocation ? [userLocation.lng, userLocation.lat] : [-0.09, 51.505],
            zoom: 18,
            pitch: 60, // 3D Tilt
            bearing: userLocation?.heading || 0,
            antialias: true // standard for 3D
        });

        map.current.on('load', () => {
            setMapLoaded(true);

            // 2. Add 3D Buildings Layer
            const layers = map.current?.getStyle().layers;
            const labelLayerId = layers?.find(
                (layer) => layer.type === 'symbol' && layer.layout?.['text-field']
            )?.id;

            map.current?.addLayer(
                {
                    'id': '3d-buildings',
                    'source': 'composite',
                    'source-layer': 'building',
                    'filter': ['==', 'extrude', 'true'],
                    'type': 'fill-extrusion',
                    'minzoom': 15,
                    'paint': {
                        'fill-extrusion-color': '#aaa',
                        'fill-extrusion-height': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            15,
                            0,
                            15.05,
                            ['get', 'height']
                        ],
                        'fill-extrusion-base': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            15,
                            0,
                            15.05,
                            ['get', 'min_height']
                        ],
                        'fill-extrusion-opacity': 0.6
                    }
                },
                labelLayerId // Insert below labels
            );
        });

        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, []); // Run once on mount

    // 3. Update Camera & Marker on Location Change
    useEffect(() => {
        if (!map.current || !mapLoaded || !userLocation) return;

        const { lat, lng, heading } = userLocation;

        // Smooth Camera Follow
        map.current.easeTo({
            center: [lng, lat],
            zoom: 18,
            pitch: 60,
            bearing: heading || 0,
            duration: 1000, // Smooth transition
            easing: (t) => t
        });

        // Update Marker
        // If marker doesn't exist, create it
        if (!markerRef.current) {
            const el = document.createElement('div');
            el.className = 'vehicle-marker-3d';
            el.style.backgroundImage = `url(${carIcon})`; // Use local asset
            el.style.width = '40px';
            el.style.height = '40px';
            el.style.backgroundSize = 'contain';
            el.style.backgroundRepeat = 'no-repeat';
            el.style.transition = 'transform 0.5s';

            // Note: Mapbox markers rotate with the map, but we want the marker to "face" the heading relative to the MAP or the World?
            // Actually, if we rotate the camera to match heading, the car should appear "up" on the screen always?
            // Or if we permit looking around, we rotate the marker.
            // Standard approach: Camera Follows Heading => Car points UP.

            markerRef.current = new mapboxgl.Marker(el)
                .setLngLat([lng, lat])
                .addTo(map.current);
        } else {
            markerRef.current.setLngLat([lng, lat]);
            // If we rotate the camera to `heading`, the car stays fixed relative to screen (pointing up).
            // But if we want it strictly aligned, we might not need to rotate the marker element if the map bears with it.
            // Let's test standard behavior first.
        }

    }, [userLocation, mapLoaded]);

    // 4. Render Route functionality (simplified for polyline)
    useEffect(() => {
        if (!map.current || !mapLoaded || routeSegments.length === 0) return;

        // Convert routeSegments (likely [[lat,lng], ...]) into GeoJSON LineString
        // Note: Mapbox expects [lng, lat]
        const coordinates = routeSegments.flatMap(seg => seg.coordinates.map((c: number[]) => [c[1], c[0]]));

        if (map.current.getSource('route')) {
            (map.current.getSource('route') as mapboxgl.GeoJSONSource).setData({
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: coordinates
                }
            });
        } else {
            map.current.addSource('route', {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'properties': {},
                    'geometry': {
                        'type': 'LineString',
                        'coordinates': coordinates
                    }
                }
            });
            map.current.addLayer({
                'id': 'route',
                'type': 'line',
                'source': 'route',
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                'paint': {
                    'line-color': '#3b82f6', // Blue route
                    'line-width': 8,
                    'line-opacity': 0.8
                }
            });
        }

    }, [routeSegments, mapLoaded]);

    return (
        <div ref={mapContainer} className="w-full h-full" />
    );
};

export default MapboxNavigation;
