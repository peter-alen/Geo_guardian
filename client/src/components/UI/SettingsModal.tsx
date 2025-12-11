import React from 'react';
import { useAuth } from '../../context/AuthContext';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md p-6 relative m-4 ring-1 ring-white/10" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white tracking-tight">Account Settings</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center space-x-4 pb-6 border-b border-slate-800">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-2xl font-bold border border-emerald-500/30">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                            <p className="text-slate-400 text-sm">{user.email}</p>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Role</label>
                            <span className="text-slate-200 font-medium capitalize">{user.role}</span>
                        </div>

                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Vehicle Type</label>
                            <span className="text-slate-200 font-medium capitalize flex items-center gap-2">
                                {user.vehicleType}
                                <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded ml-auto">Current Mode</span>
                            </span>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={onClose}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-2.5 rounded-xl border border-slate-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
