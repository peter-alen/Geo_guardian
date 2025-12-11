import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface AQIData {
    aqi: number;
    category: string;
    advice: string;
}

const AQIWidget: React.FC = () => {
    const [data, setData] = useState<AQIData | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            // Check if screen width is less than 768px (md breakpoint)
            setIsMobile(window.innerWidth < 768);
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        // Mock fetch for current location (e.g., London)
        axios.get('http://localhost:5000/api/air-quality?lat=51.5&lng=-0.09')
            .then(res => setData(res.data))
            .catch(err => console.error(err));
    }, []);

    // Close when clicking outside on mobile
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (isMobile && isExpanded && !target.closest('.aqi-widget-container')) {
                setIsExpanded(false);
            }
        };

        if (isMobile) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMobile, isExpanded]);


    if (!data) return null;

    const getColor = (aqi: number) => {
        if (aqi <= 50) return 'bg-green-500';
        if (aqi <= 100) return 'bg-yellow-500';
        if (aqi <= 150) return 'bg-orange-500';
        return 'bg-red-600';
    };

    const getBgColor = (aqi: number) => {
        if (aqi <= 50) return 'bg-green-500/20 text-green-400 border-green-500/30';
        if (aqi <= 100) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        if (aqi <= 150) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        return 'bg-red-500/20 text-red-400 border-red-500/30';
    };

    // Mobile Collapsed View
    if (isMobile && !isExpanded) {
        return (
            <button
                onClick={() => setIsExpanded(true)}
                className={`aqi-widget-container p-3 rounded-full shadow-lg border backdrop-blur-md transition-all ${getBgColor(data.aqi)} border-slate-800`}
                title={`AQI: ${data.aqi}`}
            >
                <div className="flex flex-col items-center justify-center w-5 h-5">
                    <span className="text-[10px] font-bold">AQI</span>
                    <span className="text-[10px] font-bold leading-none">{data.aqi}</span>
                </div>
            </button>
        );
    }

    // Expanded View (Desktop or Mobile Open)
    return (
        <div className={`aqi-widget-container bg-slate-900/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-slate-800 w-64 pointer-events-auto ring-1 ring-white/5 ${isMobile ? 'animate-in fade-in zoom-in duration-200 origin-top-right absolute right-0 top-0' : ''}`}>
            <div className="flex justify-between items-center mb-2 border-b border-slate-800 pb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Air Quality</span>
                {isMobile && (
                    <button onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }} className="text-slate-500 hover:text-slate-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                )}
                {!isMobile && (
                    <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full shadow-sm ${getColor(data.aqi)}`}>
                        AQI {data.aqi}
                    </span>
                )}
            </div>

            {isMobile && (
                <div className="flex items-center justify-between mb-2">
                    <span className={`text-xl font-bold ${getColor(data.aqi).replace('bg-', 'text-')}`}>{data.aqi}</span>
                    <span className="text-xs font-medium text-slate-300">{data.category}</span>
                </div>
            )}

            {!isMobile && (
                <>
                    <div className="text-sm font-semibold text-slate-100">{data.category}</div>
                    <div className="text-xs text-slate-400 mt-1 leading-relaxed">{data.advice}</div>
                </>
            )}

            {isMobile && (
                <div className="text-xs text-slate-400 leading-relaxed border-t border-slate-800 pt-2">{data.advice}</div>
            )}
        </div>
    );
};

export default AQIWidget;
