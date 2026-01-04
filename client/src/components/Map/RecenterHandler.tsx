import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { useMapContext } from '../../context/MapContext';

const RecenterHandler: React.FC = () => {
    const map = useMap();
    const { userLocation, recenterTrigger } = useMapContext();

    useEffect(() => {
        // Only trigger if we have a location and the trigger count > 0 (meaning button processed)
        // Or if we specifically want to handle initial load, but usually that's separate.
        // We check > 0 to avoid flying on initial mount if recenterTrigger initializes at 0.
        if (recenterTrigger > 0 && userLocation) {
            map.flyTo([userLocation.lat, userLocation.lng], 16, {
                animate: true,
                duration: 1.5,
                easeLinearity: 0.25
            });
        }
    }, [recenterTrigger, userLocation, map]);

    return null;
};

export default RecenterHandler;
