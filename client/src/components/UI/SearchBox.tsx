import React, { useState } from 'react';
import axios from 'axios';

interface SearchBoxProps {
    onDestinationSelect: (lat: number, lng: number, name: string) => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({ onDestinationSelect }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isFocused, setIsFocused] = useState(false);

    const handleSearch = async (val: string) => {
        if (!val || val.length < 3) {
            setResults([]);
            return;
        }

        try {
            // Use backend proxy to avoid CORS and add User-Agent
            const res = await axios.get(`http://localhost:5000/api/search?q=${encodeURIComponent(val)}`);
            setResults(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    // Debounce search effect
    React.useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (query.length >= 3) {
                handleSearch(query);
            } else {
                setResults([]);
            }
        }, 800); // 800ms debounce to be kind to Nominatim API

        return () => clearTimeout(timeoutId);
    }, [query]);

    // Manual submit handler
    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch(query);
    };

    return (
        <div className="bg-slate-950/80 backdrop-blur-xl p-4 rounded-2xl shadow-[0_0_20px_rgba(173,216,230,0.15)] border border-blue-300/30 w-full md:w-96 pointer-events-auto ring-1 ring-blue-300/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(173,216,230,0.25)] hover:border-blue-300/50
">
            <form onSubmit={onSubmit} className="flex gap-3 relative">
                <div className={`relative flex-1 transition-all duration-300 rounded-xl ${isFocused ? 'ring-2 ring-blue-300/50 shadow-[0_0_15px_rgba(173,216,230,0.3)]' : ''}`}>
                    <input
                        type="text"
                        placeholder="Enter Destination"
                        className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-cyan-100 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-slate-500 font-medium tracking-wide"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                    </div>
                </div>
                <button
                    type="submit"
                    className="bg-gradient-to-r from-cyan-600 to-cyan-500 text-white text-sm px-6 py-2 rounded-xl hover:from-cyan-500 hover:to-cyan-400 transition-all font-orbitron font-bold tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] uppercase transform hover:scale-105 active:scale-95 border border-cyan-400/50"
                >
                    Search
                </button>
            </form>

            {results.length > 0 && (
                <ul className="mt-3 text-sm max-h-60 overflow-y-auto bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] scrollbar-thin scrollbar-thumb-cyan-600/50 scrollbar-track-slate-800/50 divide-y divide-cyan-500/10">
                    {results.map((r, idx) => (
                        <li
                            key={idx}
                            className="p-3 hover:bg-cyan-900/20 cursor-pointer text-slate-300 hover:text-cyan-300 transition-all duration-200 border-l-2 border-transparent hover:border-cyan-500 flex items-center gap-3 group"
                            onClick={() => {
                                onDestinationSelect(parseFloat(r.lat), parseFloat(r.lon), r.display_name);
                                setResults([]);
                                setQuery(r.display_name.split(',')[0]);
                            }}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-500 transition-colors shadow-[0_0_5px_rgba(6,182,212,0)] group-hover:shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                            <span className="font-medium">{r.display_name}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchBox;
