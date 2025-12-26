import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Car, Truck, Ambulance } from 'lucide-react';

const VehicleSelector: React.FC = () => {
    const { user, updateUser } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    if (!user) return null;

    const vehicleTypes = [
        { id: 'car', label: 'Car', icon: Car },
        { id: 'heavy', label: 'Heavy Vehicle', icon: Truck },
        { id: 'emergency', label: 'Emergency', icon: Ambulance },
    ] as const;

    const currentVehicle = vehicleTypes.find(v => v.id === user.vehicleType) || vehicleTypes[0];

    return (
        <div className="relative group">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-slate-900/90 backdrop-blur-md p-3 rounded-full shadow-lg border border-slate-800 pointer-events-auto ring-1 ring-white/5 hover:bg-slate-800 transition-all flex items-center justify-center text-slate-300 hover:text-emerald-400 w-12 h-12"
                title="Select Vehicle Type"
            >
                <currentVehicle.icon size={20} />
            </button>

            {/* Dropdown / Tooltip-like selection */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 bg-slate-900/95 backdrop-blur-xl border border-slate-700 p-2 rounded-xl shadow-2xl flex flex-col gap-1 min-w-[160px] animate-in slide-in-from-bottom-2 fade-in duration-200">
                    <div className="px-2 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Vehicle Mode
                    </div>
                    {vehicleTypes.map((v) => (
                        <button
                            key={v.id}
                            onClick={() => {
                                updateUser({ vehicleType: v.id });
                                setIsOpen(false);
                            }}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${user.vehicleType === v.id
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <v.icon size={16} />
                            <span>{v.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default VehicleSelector;
