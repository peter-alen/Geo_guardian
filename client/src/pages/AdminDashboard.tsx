import React from 'react';

const AdminDashboard: React.FC = () => {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-white tracking-tight border-b border-slate-800 pb-4">
                <span className="text-emerald-500 mr-2">◆</span>Admin Dashboard
            </h1>
            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                <p className="text-slate-400">Manage hazards and road restrictions here.</p>
                {/* Placeholder for future admin table */}
                <div className="mt-8 border border-dashed border-slate-700 rounded-lg h-64 flex items-center justify-center text-slate-500">
                    Admin Tools Placeholder
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
