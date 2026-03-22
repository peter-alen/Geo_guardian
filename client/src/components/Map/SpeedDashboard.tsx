import React, { useState } from 'react';
import { useSpeedLimit } from '../../hooks/useSpeedLimit';
import { useMapContext } from '../../context/MapContext';
import { useAuth } from '../../context/AuthContext';

const SpeedDashboard: React.FC = () => {
    const { userLocation } = useMapContext();
    const { user } = useAuth();
    const [isHovered, setIsHovered] = useState(false);
    
    // Persist mock Vehicle ID so it doesn't flutter on re-renders
    const [vehicleId] = useState(() => `VH-${Math.floor(Math.random() * 9000 + 1000)}`);
    
    const vehicleType = user?.vehicleType || 'car';
    const speedInfo = useSpeedLimit(userLocation, vehicleType);

    if (!userLocation) return null;

    const { currentSpeed, speedLimit, roadType, status } = speedInfo;

    // Derived styles based on status
    const getStatusColor = () => {
        if (status === 'overspeed') return '#ef4444'; // red-500
        if (status === 'near_limit') return '#f97316'; // orange-500
        return '#10b981'; // emerald-500
    };

    const statusColor = getStatusColor();
    const isOverspeed = status === 'overspeed';

    // Speedometer Gauge Math
    const maxGaugeSpeed = 160;
    const clampedSpeed = Math.min(currentSpeed, maxGaugeSpeed);
    const percentage = clampedSpeed / maxGaugeSpeed;
    
    const circumference = 2 * Math.PI * 60;
    const dashArray = `${circumference * 0.75} ${circumference}`;
    const dashOffset = (circumference * 0.75) * (1 - percentage);

    return (
        <div 
            className="absolute top-4 right-4 z-[500] pointer-events-auto md:top-24 flex flex-col items-end"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Expanded Full Dashboard */}
            <div className={`
                backdrop-blur-xl bg-slate-900/80 border overflow-hidden
                ${isOverspeed ? 'border-red-500/50 shadow-red-500/20' : 'border-slate-700/50 shadow-black/50'} 
                shadow-2xl rounded-2xl text-white transform origin-top-right transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                ${isHovered ? 'w-72 opacity-100 scale-100' : 'w-16 h-16 opacity-0 scale-50 pointer-events-none absolute'}
            `}>
                
                {/* Background warning red flash if overspeed */}
                <div className={`absolute inset-0 bg-red-500/10 transition-opacity duration-300 animate-pulse ${isOverspeed ? 'opacity-100' : 'opacity-0'}`} />

                <div className="relative z-10 p-5">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">Vehicle ID</div>
                            <div className="font-bold text-sm">{vehicleId}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">Type</div>
                            <div className="font-bold text-sm capitalize">{vehicleType}</div>
                        </div>
                    </div>

                    {/* Gauge Section */}
                    <div className="relative flex flex-col items-center justify-center my-6">
                        <svg width="140" height="140" viewBox="0 0 140 140" className="drop-shadow-lg">
                            <circle 
                                cx="70" cy="70" r="60" 
                                fill="none" 
                                stroke="#1e293b" 
                                strokeWidth="12" 
                                strokeLinecap="round"
                                style={{ strokeDasharray: dashArray, transform: 'rotate(135deg)', transformOrigin: '50% 50%' }} 
                            />
                            <circle 
                                cx="70" cy="70" r="60" 
                                fill="none" 
                                stroke={statusColor} 
                                strokeWidth="12" 
                                strokeLinecap="round"
                                className="transition-all duration-500 ease-out"
                                style={{ strokeDasharray: dashArray, strokeDashoffset: dashOffset, transform: 'rotate(135deg)', transformOrigin: '50% 50%' }} 
                            />
                            <text x="70" y="75" textAnchor="middle" fill="white" className="font-orbitron font-bold text-4xl" style={{ textShadow: `0 0 10px ${statusColor}80`}}>
                                {Math.round(currentSpeed)}
                            </text>
                            <text x="70" y="95" textAnchor="middle" fill="#94a3b8" className="text-xs tracking-widest font-mono">km/h</text>
                        </svg>

                        {/* Speed Limit Badge */}
                        <div className="absolute -bottom-2 flex items-center justify-center bg-slate-800 border-2 border-slate-600 rounded-full h-12 w-12 shadow-lg z-20">
                            <div className="flex flex-col items-center justify-center leading-none">
                                <span className="text-[9px] text-slate-400 font-bold uppercase mb-[1px]">Limit</span>
                                <span className="text-sm font-bold text-white">{speedLimit === 999 ? 'MAX' : speedLimit}</span>
                            </div>
                        </div>
                    </div>

                    {/* Info List */}
                    <div className="space-y-3 mt-8">
                        <div className="flex justify-between items-center bg-slate-800/50 p-2 rounded-lg">
                            <span className="text-xs text-slate-400">Road Type</span>
                            <span className="text-sm font-semibold truncate max-w-[120px]" title={roadType}>{roadType}</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-800/50 p-2 rounded-lg border-l-4" style={{ borderLeftColor: statusColor }}>
                            <span className="text-xs text-slate-400">Status</span>
                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: statusColor }}>
                                {status.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Collapsed Small Circle Badge */}
            <div className={`
                flex items-center justify-center w-16 h-16 rounded-full border-[3px]
                backdrop-blur-xl transition-all duration-300 shadow-xl cursor-pointer
                ${isHovered ? 'opacity-0 scale-50 absolute pointer-events-none' : 'opacity-100 scale-100 bg-slate-900/90'}
                ${isOverspeed ? 'border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.7)] animate-pulse' : 'border-slate-600/80'}
            `}>
                <div className="flex flex-col items-center justify-center mt-1">
                     <span className={`text-2xl leading-none font-bold font-orbitron ${isOverspeed ? 'text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'text-emerald-400'}`}>
                        {Math.round(currentSpeed)}
                     </span>
                     <span className="text-[10px] text-slate-400 font-mono mt-0.5 font-semibold">km/h</span>
                </div>
            </div>
            
        </div>
    );
};

export default SpeedDashboard;
