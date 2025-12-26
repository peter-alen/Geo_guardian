import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

interface FuturisticCardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
}

const FuturisticCard = ({ children, className, title }: FuturisticCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={twMerge(
                "relative overflow-hidden rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 shadow-2xl",
                className
            )}
        >
            {/* Animated Gradient Border */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent translate-x-[-100%] animate-[shimmer_3s_infinite]" />

            {/* Glow effects */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            {title && (
                <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-900/50 flex items-center justify-between">
                    <h3 className="font-orbitron font-bold text-lg tracking-wider text-cyan-400 text-glow">
                        {title}
                    </h3>
                    <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                        <div className="w-2 h-2 rounded-full bg-cyan-500/50" />
                        <div className="w-2 h-2 rounded-full bg-cyan-500/20" />
                    </div>
                </div>
            )}

            <div className="p-6 relative z-10">
                {children}
            </div>
        </motion.div>
    );
};

export default FuturisticCard;
