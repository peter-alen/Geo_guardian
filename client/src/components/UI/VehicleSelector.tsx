import React from 'react';
import { useAuth } from '../../context/AuthContext';

const VehicleSelector: React.FC = () => {
    const { user, login } = useAuth();

    if (!user) return null;

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value as any;
        login({ ...user, vehicleType: newType });
    };

    return (
        <div className="bg-slate-900/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-slate-800 pointer-events-auto ring-1 ring-white/5">
            <span className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">Vehicle Mode</span>
            <select
                value={user.vehicleType}
                onChange={handleChange}
                className="w-full text-sm bg-slate-800 border-slate-700 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-slate-200 p-1.5"
            >
                <option value="car">Car</option>
                <option value="heavy">Heavy Vehicle</option>
                <option value="emergency">Emergency Vehicle</option>
            </select>
        </div>
    );
};

export default VehicleSelector;
