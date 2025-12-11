import React from 'react';

interface AlertBannerProps {
    message: string;
    type: 'warning' | 'info';
    onClose: () => void;
}

const AlertBanner: React.FC<AlertBannerProps> = ({ message, type, onClose }) => {
    if (!message) return null;

    const bgClass = type === 'warning' ? 'bg-red-500' : 'bg-blue-500';

    return (
        <div className={`fixed top-16 left-1/2 transform -translate-x-1/2 z-[1000] ${bgClass} text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-4 animate-bounce-in`}>
            <span className="font-bold text-lg">⚠️</span>
            <span>{message}</span>
            <button onClick={onClose} className="text-white hover:text-gray-200 font-bold ml-4">✕</button>
        </div>
    );
};

export default AlertBanner;
