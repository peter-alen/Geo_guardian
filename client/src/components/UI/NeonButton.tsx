import { motion, type HTMLMotionProps } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

interface NeonButtonProps extends HTMLMotionProps<'button'> {
    variant?: 'primary' | 'secondary' | 'danger';
    isLoading?: boolean;
    glow?: boolean;
}

const NeonButton = ({
    children,
    className,
    variant = 'primary',
    isLoading,
    glow = true,
    ...props
}: NeonButtonProps) => {
    const variants = {
        primary: "bg-cyan-500/10 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]",
        secondary: "bg-purple-500/10 border-purple-500/50 text-purple-400 hover:bg-purple-500/20 hover:border-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]",
        danger: "bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500/20 hover:border-red-400 hover:shadow-[0_0_20px_rgba(248,113,113,0.4)]"
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={twMerge(
                "relative px-6 py-3 rounded-xl border backdrop-blur-md transition-all duration-300",
                "font-orbitron font-semibold tracking-wide uppercase text-sm",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none",
                variants[variant],
                className
            )}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                </div>
            ) : (
                children
            )}
        </motion.button>
    );
};

export default NeonButton;
