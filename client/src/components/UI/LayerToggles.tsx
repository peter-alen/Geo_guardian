import React from 'react';

interface LayerTogglesProps {
    toggles: Record<string, boolean>;
    onToggleConfig: (key: string) => void;
}

const LayerToggles: React.FC<LayerTogglesProps> = ({ toggles, onToggleConfig }) => {
    const labels: Record<string, string> = {
        school_zone: 'Schools',
        hospital_zone: 'Hospitals',
        speed_breaker: 'Speed Breakers',
        sharp_turn: 'Sharp Turns',
        restrictions: 'Road Restrictions'
    };

    return (
        <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-slate-800 pointer-events-auto ring-1 ring-white/5 min-w-[200px]">
            <span className="text-[10px] font-bold text-slate-400 block mb-3 uppercase tracking-wider border-b border-slate-800 pb-2">Active Layers</span>
            <div className="space-y-2">
                {Object.keys(toggles).map(key => (
                    <label key={key} className="flex items-center space-x-3 text-sm cursor-pointer group">
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                checked={toggles[key]}
                                onChange={() => onToggleConfig(key)}
                                className="peer h-4 w-4 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500/20 focus:ring-offset-0 transition-all"
                            />
                        </div>
                        <span className="text-slate-300 group-hover:text-white transition-colors">{labels[key] || key}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default LayerToggles;
