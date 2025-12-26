import React, { useState, useEffect } from 'react';
import { useMapEvents, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import { Trash2, Save, X } from 'lucide-react';
import MapComponent from '../components/Map/MapComponent';
import HazardLayers from '../components/Map/HazardLayers';

// Inline simple Modal for prototype speed
const HazardFormModal: React.FC<{
    lat: number;
    lng: number;
    onClose: () => void;
    onSave: (data: any) => void;
}> = ({ lat, lng, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState('school_zone');
    const [radius, setRadius] = useState(100);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            name,
            type,
            radiusMeters: radius,
            location: { coordinates: [lng, lat] } // Backend expects [lng, lat]
        });
    };

    return (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-96 shadow-2xl animate-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-orbitron text-white">Add Hazard</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Name</label>
                        <input className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:border-cyan-500 outline-none"
                            value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Sharp Turn" />
                    </div>
                    <div>
                        <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Type</label>
                        <select className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:border-cyan-500 outline-none"
                            value={type} onChange={e => setType(e.target.value)}>
                            <option value="school_zone">School Zone</option>
                            <option value="hospital_zone">Hospital Zone</option>
                            <option value="speed_breaker">Speed Breaker</option>
                            <option value="sharp_turn">Sharp Turn</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Radius (meters)</label>
                        <input type="number" className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:border-cyan-500 outline-none"
                            value={radius} onChange={e => setRadius(Number(e.target.value))} />
                    </div>
                    <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded flex items-center justify-center gap-2 mt-4">
                        <Save size={16} /> Save Hazard
                    </button>
                </form>
            </div>
        </div>
    );
};

const MapEvents: React.FC<{ onMapClick: (lat: number, lng: number) => void }> = ({ onMapClick }) => {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

const AdminHazardMap: React.FC = () => {
    const [hazards, setHazards] = useState<any[]>([]);
    const [selectedPos, setSelectedPos] = useState<{ lat: number, lng: number } | null>(null);

    const fetchHazards = () => {
        axios.get('http://localhost:5000/api/hazards')
            .then(res => setHazards(res.data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchHazards();
    }, []);

    const handleSave = async (data: any) => {
        try {
            await axios.post('http://localhost:5000/api/hazards', data);
            fetchHazards();
            setSelectedPos(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`http://localhost:5000/api/hazards/${id}`);
            fetchHazards();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="relative h-full w-full rounded-xl overflow-hidden border border-slate-700">
            <MapComponent activeStyle="standard">
                <MapEvents onMapClick={(lat, lng) => setSelectedPos({ lat, lng })} />
                <HazardLayers hazards={hazards} visibleTypes={{ school_zone: true, hospital_zone: true, speed_breaker: true, sharp_turn: true }} />
                {selectedPos && <Marker position={[selectedPos.lat, selectedPos.lng]}><Popup>New Hazard Location</Popup></Marker>}
            </MapComponent>

            {selectedPos && (
                <HazardFormModal
                    lat={selectedPos.lat}
                    lng={selectedPos.lng}
                    onClose={() => setSelectedPos(null)}
                    onSave={handleSave}
                />
            )}

            {/* Simple list overlay for deletion */}
            <div className="absolute top-4 right-4 z-[500] bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-700 max-h-[400px] overflow-y-auto w-64 shadow-2xl">
                <h4 className="text-white font-orbitron mb-3 text-sm">Manage Hazards ({hazards.length})</h4>
                <div className="space-y-2">
                    {hazards.map(h => (
                        <div key={h._id} className="flex items-center justify-between p-2 bg-slate-800 rounded border border-slate-700/50">
                            <div>
                                <p className="text-white text-xs font-bold">{h.name}</p>
                                <p className="text-[10px] text-slate-500">{h.type}</p>
                            </div>
                            <button onClick={() => handleDelete(h._id)} className="text-red-400 hover:text-red-300 p-1">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminHazardMap;
