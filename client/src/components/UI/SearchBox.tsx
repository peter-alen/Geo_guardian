import React, { useState } from 'react';
import axios from 'axios';

interface SearchBoxProps {
    onDestinationSelect: (lat: number, lng: number, name: string) => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({ onDestinationSelect }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query) return;

        try {
            const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            setResults(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="bg-slate-900/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-slate-800 w-80 pointer-events-auto ring-1 ring-white/5">
            <form onSubmit={handleSearch} className="flex gap-2">
                <input
                    type="text"
                    placeholder="Search destination..."
                    className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-500"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit" className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-emerald-500 transition-colors font-medium shadow-lg shadow-emerald-500/20">
                    Go
                </button>
            </form>

            {results.length > 0 && (
                <ul className="mt-2 text-sm max-h-40 overflow-y-auto bg-slate-800/95 border border-slate-700 rounded-lg shadow-xl scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
                    {results.map((r, idx) => (
                        <li
                            key={idx}
                            className="p-3 hover:bg-slate-700/50 cursor-pointer border-b border-slate-700/50 last:border-0 text-slate-300 transition-colors"
                            onClick={() => {
                                onDestinationSelect(parseFloat(r.lat), parseFloat(r.lon), r.display_name);
                                setResults([]);
                                setQuery(r.display_name.split(',')[0]);
                            }}
                        >
                            {r.display_name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchBox;
