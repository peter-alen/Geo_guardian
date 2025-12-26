import createGlobe from 'cobe';
import { useEffect, useRef } from 'react';


const GlobeBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let phi = 0;

        if (!canvasRef.current) return;

        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 2,
            width: window.innerWidth * 2,
            height: window.innerHeight * 2,
            phi: 0,
            theta: 0,
            dark: 1,
            diffuse: 1.2,
            mapSamples: 16000,
            mapBrightness: 6,
            baseColor: [0.05, 0.05, 0.1],
            markerColor: [0.1, 0.8, 1],
            glowColor: [0.1, 0.5, 1],
            markers: [
                // Example markers
                { location: [37.7595, -122.4367], size: 0.03 },
                { location: [40.7128, -74.0060], size: 0.03 },
                { location: [51.5074, -0.1278], size: 0.03 },
                { location: [35.6762, 139.6503], size: 0.03 },
                { location: [22.3193, 114.1694], size: 0.03 },
                { location: [-33.8688, 151.2093], size: 0.03 },
            ],
            onRender: (state) => {
                // Called on every animation frame.
                // `state` will be an empty object, return updated params.
                state.phi = phi;
                phi += 0.003;
            },
        });

        return () => {
            globe.destroy();
        };
    }, []);

    return (
        <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
            <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
};

export default GlobeBackground;
