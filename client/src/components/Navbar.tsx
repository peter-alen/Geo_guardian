import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-[1000] bg-slate-900/80 backdrop-blur-md border-b border-slate-800 text-slate-100 px-6 py-4 flex justify-between items-center transition-all duration-300">
            <div className="flex items-center space-x-6">
                <Link to="/" className="text-2xl font-bold tracking-tight text-white hover:text-emerald-400 transition-colors flex items-center gap-2">
                    <span className="text-emerald-500">◆</span> GeoGuardian
                </Link>
                {isAuthenticated && (
                    <span className="text-[10px] font-semibold tracking-wider uppercase bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded border border-emerald-500/30">
                        {user?.vehicleType} Mode
                    </span>
                )}
            </div>

            <div className="flex items-center space-x-8 text-sm font-medium">
                {isAuthenticated ? (
                    <>
                        <Link to="/" className="text-slate-400 hover:text-white transition-colors">Map</Link>
                        {user?.role === 'admin' && (
                            <Link to="/admin" className="text-slate-400 hover:text-white transition-colors">Admin Panel</Link>
                        )}
                        <div className="flex items-center space-x-4 pl-6 border-l border-slate-700">
                            <span className="text-slate-400 hidden sm:block">
                                <span className="opacity-50 font-normal mr-1">Welcome,</span>
                                {user?.name}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 px-4 py-2 rounded-lg border border-rose-500/20 transition-all active:scale-95"
                            >
                                Logout
                            </button>
                        </div>
                    </>
                ) : (
                    <Link to="/login" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 rounded-lg shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/40 active:scale-95">
                        Sign In
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
