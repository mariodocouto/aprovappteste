import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    // FIX: Added optional onClick prop to allow the Card component to handle click events.
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
    return (
        <div onClick={onClick} className={`bg-neutral-800/50 rounded-xl p-4 md:p-6 shadow-lg border border-neutral-700/50 ${className}`}>
            {children}
        </div>
    );
};

interface CardHeaderProps {
    icon: React.ElementType;
    title: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ icon: Icon, title }) => {
    return (
        <div className="flex items-center gap-3 mb-4">
            <Icon className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-semibold text-neutral-200">{title}</h3>
        </div>
    );
}