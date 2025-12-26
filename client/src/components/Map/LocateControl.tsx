import React from 'react';
import { useMap } from 'react-leaflet';

const LocateControl: React.FC = () => {
    const map = useMap();

    const handleLocate = (e: React.MouseEvent) => {
        // Prevent event propagation to map click handlers
        e.stopPropagation();

        map.locate({ setView: true, maxZoom: 16, enableHighAccuracy: true });
    };

    return (
        <div className="absolute bottom-36 right-4 md:bottom-24 md:right-4 z-[400]">
            <button
                onClick={handleLocate}
                className="bg-slate-900/90 backdrop-blur-md p-3 rounded-full shadow-lg border border-slate-800 pointer-events-auto ring-1 ring-white/5 hover:bg-slate-800 transition-colors group"
                title="Locate Me"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 group-hover:text-emerald-400 transition-colors">
                    <line x1="12" y1="2" x2="12" y2="5"></line>
                    <line x1="12" y1="19" x2="12" y2="22"></line>
                    <line x1="2" y1="12" x2="5" y2="12"></line>
                    <line x1="19" y1="12" x2="22" y2="12"></line>
                    <circle cx="12" cy="12" r="7"></circle>
                    <circle cx="12" cy="12" r="2"></circle>
                </svg>
            </button>
        </div>
    );
};

export default LocateControl;
