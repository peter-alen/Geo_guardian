import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { formatDuration } from '../../utils/formatters';

interface LocationDetailsProps {
    location: any;
    distance?: number;
    duration?: number;
    onStartNavigation: () => void;
    onSimulate: () => void;
    onClear: () => void;
}

const LocationDetails: React.FC<LocationDetailsProps> = ({
    location,
    distance,
    duration,
    onStartNavigation,
    onSimulate,
    onClear
}) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loadingImage, setLoadingImage] = useState(false);

    useEffect(() => {
        const fetchImage = async () => {
            if (location?.extratags?.wikipedia) {
                setLoadingImage(true);
                try {
                    // Extract language and title from "lang:Title" format or just "Title"
                    const wikiEntry = location.extratags.wikipedia;
                    const parts = wikiEntry.split(':');
                    const lang = parts.length > 1 ? parts[0] : 'en';
                    const title = parts.length > 1 ? parts.slice(1).join(':') : parts[0];

                    const res = await axios.get(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);

                    if (res.data.thumbnail && res.data.thumbnail.source) {
                        setImageUrl(res.data.thumbnail.source);
                    } else if (res.data.originalimage && res.data.originalimage.source) {
                        setImageUrl(res.data.originalimage.source);
                    }
                } catch (error) {
                    console.error("Failed to fetch Wikipedia image", error);
                } finally {
                    setLoadingImage(false);
                }
            } else {
                setImageUrl(null);
            }
        };

        fetchImage();
    }, [location]);

    // Parse display name for cleaner title
    const displayName = location.namedetails?.name || location.display_name.split(',')[0];
    const address = location.display_name.split(',').slice(1).join(',').trim();

    return (
        <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 z-[400] w-[calc(100%-2rem)] md:w-96 animate-slide-up">
            <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl flex flex-col">

                {/* Image Section */}
                <div className="h-48 w-full bg-slate-800 relative overflow-hidden group">
                    {loadingImage ? (
                        <div className="absolute inset-0 flex items-center justify-center animate-pulse bg-slate-800">
                            <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    ) : imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={displayName}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 pattern-grid-lg text-slate-600">
                            <svg className="w-16 h-16 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    )}

                    {/* Close Button */}
                    <button
                        onClick={onClear}
                        className="absolute top-2 right-2 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white/80 hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>

                    {/* Title Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent">
                        <h2 className="text-xl font-bold text-white font-orbitron drop-shadow-lg">{displayName}</h2>
                    </div>
                </div>

                {/* Details Section */}
                <div className="p-4 space-y-4">
                    <p className="text-sm text-slate-400 line-clamp-2">{address}</p>

                    {/* Stats */}
                    {distance !== undefined && duration !== undefined && (
                        <div className="flex items-center justify-around py-3 border-t border-slate-800/50 bg-slate-900/50 rounded-lg">
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Distance</span>
                                <span className="text-emerald-400 font-bold font-mono text-lg">{distance.toFixed(1)} <span className="text-emerald-400/60 text-sm">km</span></span>
                            </div>
                            <div className="w-[1px] h-8 bg-slate-700/50"></div>

                            <div className="flex flex-col items-center">
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Duration</span>
                                <span className="text-blue-400 font-bold font-mono text-lg">{formatDuration(duration)}</span>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                            onClick={onSimulate}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold py-3 px-4 rounded-xl border border-slate-600 transition-all flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Simulate
                        </button>
                        <button
                            onClick={onStartNavigation}
                            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-bold py-3 px-4 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 border border-blue-400/30"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            </svg>
                            Start Navigation
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationDetails;
