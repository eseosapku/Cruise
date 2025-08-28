import React from 'react';

interface LoadingProps {
    message?: string;
    size?: 'small' | 'medium' | 'large';
    className?: string;
}

const Loading: React.FC<LoadingProps> = ({
    message = 'Loading...',
    size = 'medium',
    className = ''
}) => {
    const sizeClasses = {
        small: 'w-6 h-6',
        medium: 'w-8 h-8',
        large: 'w-12 h-12'
    };

    return (
        <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
            <div
                className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4`}
            ></div>
            <p className="text-white text-lg">{message}</p>
        </div>
    );
};

export default Loading;