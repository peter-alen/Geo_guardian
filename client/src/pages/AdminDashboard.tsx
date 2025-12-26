import React from 'react';
import FuturisticCard from '../components/UI/FuturisticCard';
import NeonButton from '../components/UI/NeonButton';
import { AlertTriangle, Users, Activity, ShieldCheck, Plus, Search } from 'lucide-react';
import AdminHazardMap from './AdminHazardMap';

const AdminDashboard: React.FC = () => {
    const stats = [
        { label: 'Active Users', value: '1,234', icon: Users, color: 'text-cyan-400', border: 'border-cyan-500/50' },
        { label: 'Active Hazards', value: '42', icon: AlertTriangle, color: 'text-orange-400', border: 'border-orange-500/50' },
        { label: 'System Health', value: '98.9%', icon: Activity, color: 'text-green-400', border: 'border-green-500/50' },
        { label: 'Verified Reports', value: '856', icon: ShieldCheck, color: 'text-purple-400', border: 'border-purple-500/50' },
    ];

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/50 pb-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-orbitron font-bold text-white tracking-widest text-glow">
                        ADMIN CONSOLE
                    </h1>
                    <p className="text-slate-400 font-mono text-sm mt-2">SYSTEM OVERVIEW // HAZARD MANAGEMENT</p>
                </div>
                <div className="flex gap-3">
                    <NeonButton variant="secondary" className="flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        SEARCH LOGS
                    </NeonButton>
                    <NeonButton variant="primary" className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        NEW HAZARD
                    </NeonButton>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <FuturisticCard key={index} className="flex items-center justify-between group">
                        <div>
                            <p className="text-slate-400 text-xs font-mono uppercase tracking-wider">{stat.label}</p>
                            <p className={`text-2xl font-orbitron font-bold mt-1 ${stat.color} text-glow-sm`}>{stat.value}</p>
                        </div>
                        <div className={`p-3 rounded-xl bg-slate-900/50 border ${stat.border} group-hover:scale-110 transition-transform`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                    </FuturisticCard>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                {/* Hazard Map */}
                <FuturisticCard className="lg:col-span-3 flex flex-col p-1">
                    <div className="flex justify-between items-center mb-2 px-3 pt-2">
                        <h2 className="text-xl font-orbitron text-white flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-cyan-400" />
                            Live Hazard Management
                        </h2>
                        <span className="text-xs font-mono text-green-400 animate-pulse">● CLICK MAP TO ADD</span>
                    </div>
                    <div className="flex-1 rounded-xl overflow-hidden relative border border-slate-700/50">
                        <AdminHazardMap />
                    </div>
                </FuturisticCard>
            </div>
        </div>
    );
};

export default AdminDashboard;

