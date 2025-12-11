import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [vehicleType, setVehicleType] = useState('car');
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Use localhost directly for now, later can be config
        const API_URL = 'http://localhost:5000/api/auth';

        try {
            if (isRegister) {
                const res = await axios.post(`${API_URL}/register`, {
                    name, email, password, vehicleType
                });
                login(res.data.user);
            } else {
                const res = await axios.post(`${API_URL}/login`, {
                    email, password
                });
                login(res.data.user);
            }
            navigate('/');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'An error occurred');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center relative">
            {/* Overlay */}
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>

            <div className="relative z-10 w-full max-w-md p-1">
                <div className="bg-slate-900/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-slate-800 ring-1 ring-white/10">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">GeoGuardian</h1>
                        <p className="text-slate-400 text-sm">
                            {isRegister ? 'Join the secure navigation network' : 'Welcome back, commander'}
                        </p>
                    </div>

                    <h2 className="text-xl font-semibold mb-6 text-emerald-400 border-b border-slate-800 pb-2">
                        {isRegister ? 'Create Account' : 'Sign In'}
                    </h2>

                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 mb-6 rounded-lg text-sm flex items-center gap-2">
                            <span className="text-rose-500">⚠</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {isRegister && (
                            <div>
                                <label className="block text-slate-300 text-xs uppercase tracking-wider font-semibold mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-800/50 border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                                    placeholder="John Doe"
                                    value={name} onChange={e => setName(e.target.value)} required
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-slate-300 text-xs uppercase tracking-wider font-semibold mb-1.5">Email Address</label>
                            <input
                                type="email"
                                className="w-full bg-slate-800/50 border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                                placeholder="name@company.com"
                                value={email} onChange={e => setEmail(e.target.value)} required
                            />
                        </div>

                        <div>
                            <label className="block text-slate-300 text-xs uppercase tracking-wider font-semibold mb-1.5">Password</label>
                            <input
                                type="password"
                                className="w-full bg-slate-800/50 border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                                placeholder="••••••••"
                                value={password} onChange={e => setPassword(e.target.value)} required
                            />
                        </div>

                        {isRegister && (
                            <div>
                                <label className="block text-slate-300 text-xs uppercase tracking-wider font-semibold mb-1.5">Vehicle Type</label>
                                <select
                                    className="w-full bg-slate-800/50 border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                                    value={vehicleType}
                                    onChange={e => setVehicleType(e.target.value)}
                                >
                                    <option value="car">Car (Standard)</option>
                                    <option value="heavy">Heavy Vehicle (Restriction Aware)</option>
                                    <option value="emergency">Emergency (Priority)</option>
                                </select>
                            </div>
                        )}

                        <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold p-3 rounded-lg shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/40 active:scale-95 mt-4">
                            {isRegister ? 'Start Journey' : 'Access Dashboard'}
                        </button>
                    </form>

                    <div className="mt-6 text-center pt-6 border-t border-slate-800">
                        <p className="text-slate-400 text-sm">
                            {isRegister ? 'Already have an account?' : "New to GeoGuardian?"} {' '}
                            <button
                                className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors ml-1"
                                onClick={() => setIsRegister(!isRegister)}
                            >
                                {isRegister ? 'Sign in' : 'Create account'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
