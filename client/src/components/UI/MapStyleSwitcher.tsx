import React from 'react';

interface MapStyleSwitcherProps {
    currentStyle: string;
    onStyleChange: (style: string) => void;
}

const MapStyleSwitcher: React.FC<MapStyleSwitcherProps> = ({ currentStyle, onStyleChange }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    // Close when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (isOpen && !target.closest('.map-style-switcher-container')) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const styles = [
        { id: 'standard', label: 'Standard' },
        { id: 'satellite', label: 'Satellite' },
        { id: 'detailed', label: 'Detailed' }
    ];

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="map-style-switcher-container bg-slate-900/90 backdrop-blur-md p-3 rounded-full shadow-lg border border-slate-800 pointer-events-auto ring-1 ring-white/5 hover:bg-slate-800 transition-colors"
                title="Change Map Style"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300">
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                    <line x1="8" y1="2" x2="8" y2="18"></line>
                    <line x1="16" y1="6" x2="16" y2="22"></line>
                </svg>
            </button>
        );
    }

    return (
        <div className="map-style-switcher-container bg-slate-900/90 backdrop-blur-md p-2 rounded-xl shadow-lg border border-slate-800 pointer-events-auto ring-1 ring-white/5 flex gap-2 animate-in fade-in slide-in-from-left-4 duration-200">
            {styles.map((style) => (
                <button
                    key={style.id}
                    onClick={() => {
                        onStyleChange(style.id);
                        setIsOpen(false);
                    }}
                    className={`
                        px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap
                        ${currentStyle === style.id
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
                        }
                    `}
                >
                    {style.label}
                </button>
            ))}
        </div>
    );
};

export default MapStyleSwitcher;
