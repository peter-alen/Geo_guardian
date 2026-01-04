import React, { useEffect, useRef } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useMapContext } from '../../context/MapContext';

const NavigationCamera: React.FC = () => {
    const map = useMap();
    const { userLocation, isNavigating, followMode, setFollowMode } = useMapContext();
    const isFirstNav = useRef(true);

    // 1. Detect manual user interaction to disable auto-follow
    useMapEvents({
        dragstart: () => {
            if (isNavigating && followMode) {
                setFollowMode(false);
            }
        }
    });

    // 2. Handle Navigation Start (Zoom In)
    useEffect(() => {
        if (isNavigating) {
            // Smooth zoom to driving level
            map.flyTo(map.getCenter(), 18, { animate: true, duration: 1.5 });
            setFollowMode(true); // Auto-enable follow on start
            isFirstNav.current = false;
        } else {
            // Optional: Zoom out or restore view on stop?
            // For now, we leave it as is or zoom out slightly if user wants
            if (!isFirstNav.current) {
                map.flyTo(map.getCenter(), 15, { animate: true, duration: 1.0 });
            }
        }
    }, [isNavigating, map, setFollowMode]);

    // 3. Auto-Follow Logic
    useEffect(() => {
        if (!isNavigating || !followMode || !userLocation) return;

        const vehicleLatLng = L.latLng(userLocation.lat, userLocation.lng);

        // Calculate offset to place vehicle at ~65% of screen height (lower part)
        // We want the map center to be "above" the vehicle on screen (lower Y value)
        // 1. Project vehicle to pixel point
        const zoom = map.getZoom();
        const vehiclePoint = map.project(vehicleLatLng, zoom);

        // 2. Calculate vertical offset in pixels
        // If map height is H, we want vehicle at 0.65 * H.
        // Center is at 0.5 * H.
        // So we need to shift the center such that the vehicle ends up at 0.65H.
        // Current Center Y is effectively what determines the view.
        // If we center on vehicle, vehicle is at 0.5 H.
        // We want it at 0.65 H. So we need to move the Map Center "Down" relative to the world? No.
        // If we want the vehicle to be LOWER on screen, we need to look at a point "NORTH" (Up) of the vehicle.
        // So Target Center pixels Y = Vehicle Y - (0.15 * Screen Height)

        const mapSize = map.getSize();
        const verticalOffset = mapSize.y * 0.15; // 0.65 - 0.50 = 0.15 (15% offset)

        // Target Point in pixels (relative to world origin at this zoom)
        // Note: Pixel Y increases downwards.
        // To show vehicle lower (larger Y on screen), we must center on a point with Smaller Y (higher up in world).
        const targetPoint = vehiclePoint.subtract([0, verticalOffset]);
        const targetLatLng = map.unproject(targetPoint, zoom);

        // Smooth Pan
        map.panTo(targetLatLng, { animate: true, duration: 0.8 }); // slightly faster than GPS update usually

    }, [userLocation, isNavigating, followMode, map]);

    return null;
};

export default NavigationCamera;
