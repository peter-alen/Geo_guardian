import { useState, useEffect } from 'react';

interface LocationState {
    loaded: boolean;
    coordinates?: { lat: number; lng: number };
    error?: { code: number; message: string };
    heading?: number | null;
    speed?: number | null;
}

const useGeolocation = () => {
    const [location, setLocation] = useState<LocationState>({
        loaded: false,
    });

    useEffect(() => {
        if (!("geolocation" in navigator)) {
            setLocation({
                loaded: true,
                error: {
                    code: 0,
                    message: "Geolocation not supported",
                },
            });
            return;
        }

        const onSuccess = (location: GeolocationPosition) => {
            setLocation({
                loaded: true,
                coordinates: {
                    lat: location.coords.latitude,
                    lng: location.coords.longitude,
                },
                heading: location.coords.heading,
                speed: location.coords.speed,
            });
        };

        const onError = (error: GeolocationPositionError) => {
            setLocation({
                loaded: true,
                error: {
                    code: error.code,
                    message: error.message,
                },
            });
        };

        const options = {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 1000,
        };

        const watcherId = navigator.geolocation.watchPosition(onSuccess, onError, options);

        return () => {
            navigator.geolocation.clearWatch(watcherId);
        };
    }, []);

    return location;
};

export default useGeolocation;
