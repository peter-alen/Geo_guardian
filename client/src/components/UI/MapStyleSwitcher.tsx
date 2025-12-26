import React, { useState } from 'react';
import { Layers, Map as MapIcon, Satellite } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface MapStyleSwitcherProps {
    currentStyle: string;
    onStyleChange: (style: string) => void;
}

const styles = [
    { id: 'standard', label: 'Map', icon: MapIcon },
    { id: 'satellite', label: 'Satellite', icon: Satellite },
];

const MapStyleSwitcher: React.FC<MapStyleSwitcherProps> = ({ currentStyle, onStyleChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Close when clicking outside logic embedded in backdrop if needed, 
    // but for simple dropdown, we can use a click handler on the container or similar.
    // For now, simple toggle is fine.

    return (
        <div className="relative group p-2">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 p-3 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.3)] text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 transition-all z-20 relative"
                title="Change Map Style"
            >
                <Layers className="w-6 h-6" />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -20, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -20, scale: 0.9 }}
                        className="absolute bottom-16 left-0 bg-slate-900/90 backdrop-blur-xl border border-slate-700 p-2 rounded-2xl shadow-2xl w-48 z-10"
                    >
                        <div className="space-y-1">
                            {styles.map((style) => (
                                <button
                                    key={style.id}
                                    onClick={() => {
                                        onStyleChange(style.id);
                                        setIsOpen(false);
                                    }}
                                    className={clsx(
                                        "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all font-orbitron tracking-wide",
                                        currentStyle === style.id
                                            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                    )}
                                >
                                    <style.icon className="w-4 h-4" />
                                    {style.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MapStyleSwitcher;
