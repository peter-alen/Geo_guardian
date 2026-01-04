import React from 'react';
import { useMapContext } from '../../context/MapContext';

const LocateButton: React.FC = () => {
    const { triggerRecenter } = useMapContext();

    return (
        <button
            onClick={triggerRecenter}
            className="bg-slate-900/90 backdrop-blur-md p-3 rounded-full shadow-lg border border-slate-800 pointer-events-auto ring-1 ring-white/5 hover:bg-slate-800 transition-all flex items-center justify-center text-slate-300 hover:text-emerald-400 w-12 h-12 group"
            title="Locate Me"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 group-hover:text-emerald-400 transition-colors">
                <line x1="12" y1="2" x2="12" y2="5"></line>
                <line x1="12" y1="19" x2="12" y2="22"></line>
                <line x1="2" y1="12" x2="5" y2="12"></line>
                <line x1="19" y1="12" x2="22" y2="12"></line>
                <circle cx="12" cy="12" r="7"></circle>
                <circle cx="12" cy="12" r="2"></circle>
            </svg>
        </button>
    );
};

export default LocateButton;
