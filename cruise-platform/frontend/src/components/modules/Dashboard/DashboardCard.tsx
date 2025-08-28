import React from 'react';

interface DashboardCardProps {
    title: string;
    content: string;
    icon?: string;
    color?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    action?: {
        label: string;
        onClick: () => void;
    };
    footer?: React.ReactNode;
    className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
    title,
    content,
    icon,
    color = 'bg-blue-500',
    trend,
    action,
    footer,
    className = ''
}) => {
    return (
        <div className={`bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    {icon && (
                        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white text-xl`}>
                            {icon}
                        </div>
                    )}
                    <div>
                        <h3 className="text-sm font-medium text-blue-200 uppercase tracking-wide">
                            {title}
                        </h3>
                    </div>
                </div>

                {trend && (
                    <div className={`flex items-center space-x-1 text-sm ${trend.isPositive ? 'text-green-400' : 'text-red-400'
                        }`}>
                        <span>{trend.isPositive ? '↗' : '↘'}</span>
                        <span>{Math.abs(trend.value)}%</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="mb-4">
                <p className="text-2xl font-bold text-white mb-1">{content}</p>
                {trend && (
                    <p className="text-xs text-gray-400">
                        {trend.isPositive ? 'Increase' : 'Decrease'} from last period
                    </p>
                )}
            </div>

            {/* Action Button */}
            {action && (
                <button
                    onClick={action.onClick}
                    className="w-full py-2 px-4 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                    {action.label}
                </button>
            )}

            {/* Footer */}
            {footer && (
                <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                    {footer}
                </div>
            )}
        </div>
    );
};

export default DashboardCard;