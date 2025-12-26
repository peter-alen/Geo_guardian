import React from 'react';

const LaneGuidance: React.FC<{ visible: boolean }> = ({ visible }) => {
    if (!visible) return null;

    return (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-slate-900/95 border border-slate-700/80 p-4 rounded-xl shadow-2xl z-[1000] flex gap-2 backdrop-blur-md animate-in slide-in-from-top-4 fade-in duration-300">
            {/* Lane 1 - Left Turn Only */}
            <div className="w-12 h-16 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700 opacity-50">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3H7a4 4 0 0 0-4 4v14" />
                    <path d="M17 3L13 7" />
                </svg>
            </div>

            {/* Lane 2 - Straight or Right (Recommended) */}
            <div className="w-12 h-16 bg-emerald-900/50 rounded-lg flex items-center justify-center border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 3h10a4 4 0 0 1 4 4v14" />
                    <path d="M7 3l4 4" />
                    <path d="M12 21V7" />
                </svg>
            </div>

            {/* Lane 3 - Straight Only */}
            <div className="w-12 h-16 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700 opacity-50">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14" />
                    <path d="M12 5l-4 4" />
                    <path d="M12 5l4 4" />
                </svg>
            </div>

            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-white bg-slate-900 px-2 py-0.5 rounded shadow whitespace-nowrap">
                200m
            </div>
        </div>
    );
};

export default LaneGuidance;
