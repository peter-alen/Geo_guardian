import React from 'react';
import { useAuth } from '../../context/AuthContext';

const VehicleSelector: React.FC = () => {
    const { user, login } = useAuth();
    const [isOpen, setIsOpen] = React.useState(false);

    // Close when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (isOpen && !target.closest('.vehicle-selector-container')) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    if (!user) return null;

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value as any;
        login({ ...user, vehicleType: newType });
        setIsOpen(false);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="vehicle-selector-container bg-slate-900/90 backdrop-blur-md p-3 rounded-full shadow-lg border border-slate-800 pointer-events-auto ring-1 ring-white/5 hover:bg-slate-800 transition-colors"
                title="Change Vehicle Mode"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300">
                    <rect x="1" y="3" width="15" height="13"></rect>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                    <circle cx="5.5" cy="18.5" r="2.5"></circle>
                    <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
            </button>
        );
    }

    return (
        <div className="vehicle-selector-container bg-slate-900/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-slate-800 pointer-events-auto ring-1 ring-white/5 animate-in fade-in zoom-in duration-200 origin-top-right min-w-[180px]">
            <span className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">Vehicle Mode</span>
            <select
                value={user.vehicleType}
                onChange={handleChange}
                className="w-full text-sm bg-slate-800 border-slate-700 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-slate-200 p-1.5"
                size={3}
            >
                <option value="car">Car</option>
                <option value="heavy">Heavy Vehicle</option>
                <option value="emergency">Emergency Vehicle</option>
            </select>
        </div>
    );
};

export default VehicleSelector;
