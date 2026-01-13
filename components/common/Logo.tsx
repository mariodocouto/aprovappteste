import React from 'react';

interface LogoProps {
    className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            fill="none"
            className={className}
            aria-label="AprovApp Logo"
        >
            <defs>
                <linearGradient id="logoGradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#8b5cf6" /> {/* Roxo */}
                    <stop offset="1" stopColor="#3b82f6" /> {/* Azul */}
                </linearGradient>
            </defs>
            
            <rect width="100" height="100" rx="22" fill="url(#logoGradient)" />
            
            {/* Design Minimalista Moderno: Um "Check" estilizado formando um A abstrato */}
            <path 
                d="M30 55 L45 70 L75 30" 
                stroke="white" 
                strokeWidth="10" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
            />
        </svg>
    );
};