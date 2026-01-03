import React from 'react';

interface NavigationOverlayProps {
    distanceKm: number;
    durationMin: number;
    destinationName?: string;
    onExit: () => void;
}

const NavigationOverlay: React.FC<NavigationOverlayProps> = ({ distanceKm, durationMin, destinationName, onExit }) => {
    return (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-5px_15px_rgba(0,0,0,0.1)] z-[1000] p-4 flex justify-between items-center animate-slide-up">
            <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-green-600">{durationMin} min</span>
                    <span className="text-lg text-gray-500">({distanceKm.toFixed(1)} km)</span>
                </div>
                {destinationName && (
                    <span className="text-sm text-gray-600 truncate max-w-[200px] md:max-w-md">
                        to {destinationName}
                    </span>
                )}
            </div>

            <button
                onClick={onExit}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full shadow-md transition-colors"
            >
                Exit
            </button>
        </div>
    );
};

export default NavigationOverlay;
