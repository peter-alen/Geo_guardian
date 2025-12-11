import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface AQIData {
    aqi: number;
    category: string;
    advice: string;
}

const AQIWidget: React.FC = () => {
    const [data, setData] = useState<AQIData | null>(null);

    useEffect(() => {
        // Mock fetch for current location (e.g., London)
        // In real app, pass current user location props
        axios.get('http://localhost:5000/api/air-quality?lat=51.5&lng=-0.09')
            .then(res => setData(res.data))
            .catch(err => console.error(err));
    }, []);

    if (!data) return null;

    const getColor = (aqi: number) => {
        if (aqi <= 50) return 'bg-green-500';
        if (aqi <= 100) return 'bg-yellow-500';
        if (aqi <= 150) return 'bg-orange-500';
        return 'bg-red-600';
    };

    return (
        <div className="bg-slate-900/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-slate-800 w-64 pointer-events-auto ring-1 ring-white/5">
            <div className="flex justify-between items-center mb-2 border-b border-slate-800 pb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Air Quality</span>
                <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full shadow-sm ${getColor(data.aqi)}`}>
                    AQI {data.aqi}
                </span>
            </div>
            <div className="text-sm font-semibold text-slate-100">{data.category}</div>
            <div className="text-xs text-slate-400 mt-1 leading-relaxed">{data.advice}</div>
        </div>
    );
};

export default AQIWidget;
