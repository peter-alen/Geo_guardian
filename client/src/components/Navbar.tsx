import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Shield,
    Map as MapIcon,
    BarChart3,
    Menu,
    X,
    LogOut,
    Settings,
    MoreVertical,
    User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import NeonButton from './UI/NeonButton';

const Navbar: React.FC = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const isActive = (path: string) => location.pathname === path;

    const navLinks = [
        { path: '/', label: 'Live Map', icon: MapIcon },
        ...(user?.role === 'admin' ? [{ path: '/admin', label: 'Admin Console', icon: BarChart3 }] : []),
    ];

    if (!isAuthenticated) return null;

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="fixed top-0 left-0 right-0 z-50 h-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-700/50 shadow-lg"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                    <div className="flex items-center justify-between h-full">

                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center gap-3">
                            <div className="relative">
                                <Shield className="h-8 w-8 text-cyan-400" />
                                <div className="absolute inset-0 bg-cyan-400/20 blur-lg rounded-full" />
                            </div>
                            <div>
                                <h1 className="text-xl font-orbitron font-bold text-white tracking-widest text-glow">
                                    GEOGUARDIAN
                                </h1>
                                <div className="h-0.5 w-full bg-gradient-to-r from-cyan-500 to-transparent" />
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={clsx(
                                        "relative px-4 py-2 flex items-center gap-2 text-sm font-medium transition-all duration-300 group",
                                        isActive(link.path)
                                            ? "text-cyan-400"
                                            : "text-slate-400 hover:text-cyan-300"
                                    )}
                                >
                                    <link.icon className={clsx("w-4 h-4 transition-transform group-hover:scale-110", isActive(link.path) && "animate-pulse")} />
                                    <span className="font-orbitron tracking-wide">{link.label}</span>
                                    {isActive(link.path) && (
                                        <motion.div
                                            layoutId="navbar-indicator"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                                        />
                                    )}
                                </Link>
                            ))}
                        </div>

                        {/* User Profile & Actions */}
                        <div className="hidden md:flex items-center gap-6">
                            <div className="flex items-center gap-3 bg-slate-900/50 py-1.5 px-4 rounded-full border border-slate-700/50">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                <span className="text-xs font-mono text-slate-400">SYSTEM ONLINE</span>
                            </div>

                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-3 focus:outline-none group"
                                >
                                    <div className="text-right hidden lg:block">
                                        <div className="text-sm font-orbitron text-white group-hover:text-cyan-400 transition-colors">
                                            {user?.name}
                                        </div>
                                        <div className="text-xs font-mono text-slate-500 uppercase">
                                            {user?.role === 'admin' ? 'Administrator' : 'Operator'}
                                        </div>
                                    </div>
                                    <div className="relative w-10 h-10 rounded-lg bg-slate-800 border border-slate-600 flex items-center justify-center overflow-hidden group-hover:border-cyan-500 transition-colors">
                                        <User className="w-5 h-5 text-slate-300 group-hover:text-cyan-400" />
                                    </div>
                                    <MoreVertical className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                                </button>

                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-4 w-60 bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl py-2 z-50 ring-1 ring-white/5"
                                        >
                                            <div className="px-4 py-3 border-b border-slate-700/50">
                                                <p className="text-sm text-white font-orbitron">Account Status</p>
                                                <p className="text-xs text-emerald-400 font-mono mt-1">● VERIFIED LEVEL 4</p>
                                            </div>

                                            <div className="py-2">
                                                <button
                                                    onClick={() => {
                                                        setIsSettingsOpen(true);
                                                        setIsProfileOpen(false);
                                                    }}
                                                    className="w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/50 hover:text-cyan-400 flex items-center gap-3 transition-colors"
                                                >
                                                    <Settings className="w-4 h-4" />
                                                    Settings
                                                </button>
                                                <button
                                                    onClick={logout}
                                                    className="w-full px-4 py-2 text-sm text-slate-300 hover:bg-rose-900/20 hover:text-rose-400 flex items-center gap-3 transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Disconnect
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
                            >
                                {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="md:hidden bg-slate-900 border-b border-slate-800 overflow-hidden"
                        >
                            <div className="px-4 pt-2 pb-6 space-y-2">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={clsx(
                                            "block px-3 py-3 rounded-lg text-base font-medium flex items-center gap-3 font-orbitron",
                                            isActive(link.path)
                                                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                                : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                        )}
                                    >
                                        <link.icon className="w-5 h-5" />
                                        {link.label}
                                    </Link>
                                ))}
                                <div className="border-t border-slate-800 pt-4 mt-4">
                                    <div className="flex items-center px-3 mb-4">
                                        <div className="flex-shrink-0">
                                            <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold border border-slate-600">
                                                {user?.name?.charAt(0) || 'U'}
                                            </div>
                                        </div>
                                        <div className="ml-3">
                                            <div className="text-base font-medium leading-none text-white">{user?.name}</div>
                                            <div className="text-sm font-medium leading-none text-slate-400 mt-1">{user?.email}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setIsSettingsOpen(true);
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                                    >
                                        <Settings className="w-5 h-5" />
                                        Settings
                                    </button>
                                    <button
                                        onClick={() => {
                                            logout();
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-rose-400 hover:bg-rose-900/10"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        Disconnect
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>

            {/* Settings Modal - Styled Futuristically */}
            <AnimatePresence>
                {isSettingsOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-700/50 flex justify-between items-center bg-slate-950/30">
                                <h3 className="text-xl font-orbitron font-bold text-white flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-cyan-400" />
                                    SYSTEM CONFIG
                                </h3>
                                <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                        <label className="text-xs text-slate-400 font-mono uppercase tracking-wider block mb-1">User Identity</label>
                                        <p className="text-lg text-white font-medium">{user?.name}</p>
                                    </div>
                                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                        <label className="text-xs text-slate-400 font-mono uppercase tracking-wider block mb-1">Comms Link</label>
                                        <p className="text-lg text-white font-medium">{user?.email}</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex-1">
                                            <label className="text-xs text-slate-400 font-mono uppercase tracking-wider block mb-1">Clearance</label>
                                            <p className="text-white font-medium capitalize">{user?.role}</p>
                                        </div>
                                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex-1">
                                            <label className="text-xs text-slate-400 font-mono uppercase tracking-wider block mb-1">Unit Type</label>
                                            <p className="text-white font-medium capitalize">{user?.vehicleType || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <NeonButton onClick={() => setIsSettingsOpen(false)} className="w-full">
                                        CONFIRM & CLOSE
                                    </NeonButton>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
