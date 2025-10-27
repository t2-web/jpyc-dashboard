import React from 'react';

const HeroBackground: React.FC = () => (
    <div className="absolute inset-0 z-0 opacity-20">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" style={{ stopColor: 'rgba(59, 130, 246, 0.4)', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: 'rgba(59, 130, 246, 0)', stopOpacity: 0 }} />
                </radialGradient>
                <pattern id="pattern-circles" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse">
                    <circle id="pattern-circle" cx="10" cy="10" r="1" fill="rgba(107, 114, 128, 0.5)"></circle>
                </pattern>
            </defs>

            <rect x="0" y="0" width="100%" height="100%" fill="url(#grad1)"></rect>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)"></rect>

            <line x1="10%" y1="90%" x2="40%" y2="60%" stroke="rgba(107, 114, 128, 0.3)" strokeWidth="1" />
            <line x1="40%" y1="60%" x2="50%" y2="70%" stroke="rgba(107, 114, 128, 0.3)" strokeWidth="1" />
            <line x1="50%" y1="70%" x2="60%" y2="50%" stroke="rgba(107, 114, 128, 0.3)" strokeWidth="1" />
            <line x1="60%" y1="50%" x2="90%" y2="20%" stroke="rgba(107, 114, 128, 0.3)" strokeWidth="1" />

            <line x1="0%" y1="50%" x2="30%" y2="20%" stroke="rgba(107, 114, 128, 0.3)" strokeWidth="1" />
            <line x1="30%" y1="20%" x2="55%" y2="45%" stroke="rgba(107, 114, 128, 0.3)" strokeWidth="1" />
            <line x1="55%" y1="45%" x2="70%" y2="30%" stroke="rgba(107, 114, 128, 0.3)" strokeWidth="1" />
            <line x1="70%" y1="30%" x2="100%" y2="60%" stroke="rgba(107, 114, 128, 0.3)" strokeWidth="1" />

            <circle cx="40%" cy="60%" r="4" fill="rgba(59, 130, 246, 0.5)" />
            <circle cx="60%" cy="50%" r="4" fill="rgba(59, 130, 246, 0.5)" />
            <circle cx="30%" cy="20%" r="4" fill="rgba(59, 130, 246, 0.5)" />
            <circle cx="70%" cy="30%" r="4" fill="rgba(59, 130, 246, 0.5)" />
        </svg>
    </div>
);

export default HeroBackground;