import React from 'react';

interface LayerTogglesProps {
    toggles: Record<string, boolean>;
    onToggleConfig: (key: string) => void;
}

const LayerToggles: React.FC<LayerTogglesProps> = ({ toggles, onToggleConfig }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    // Close when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (isOpen && !target.closest('.layer-toggles-container')) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const labels: Record<string, string> = {
        school_zone: 'Schools',
        hospital_zone: 'Hospitals',
        speed_breaker: 'Speed Breakers',
        sharp_turn: 'Sharp Turns',
        restrictions: 'Road Restrictions'
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="layer-toggles-container bg-slate-900/90 backdrop-blur-md p-3 rounded-full shadow-lg border border-slate-800 pointer-events-auto ring-1 ring-white/5 hover:bg-slate-800 transition-colors"
                title="Toggle Layers"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                    <polyline points="2 17 12 22 22 17"></polyline>
                    <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
            </button>
        );
    }

    return (
        <div className="layer-toggles-container bg-slate-900/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-slate-800 pointer-events-auto ring-1 ring-white/5 min-w-[200px] animate-in fade-in zoom-in duration-200 origin-bottom-right">
            <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Layers</span>
                <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
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
