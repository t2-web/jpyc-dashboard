import React from 'react';

const backgroundUrl = new URL('../image/jpyc_background.jpg', import.meta.url).href;

const HeroBackground: React.FC = () => (
    <div className="absolute inset-0 z-0 pointer-events-none">
        <div
            className="absolute inset-0 bg-cover bg-center scale-105"
            style={{ backgroundImage: `url(${backgroundUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-slate-950/70" />
        <div
            className="absolute inset-0 opacity-40"
            style={{
                backgroundImage:
                    'radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.45), transparent 55%), radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.35), transparent 60%)',
            }}
        />
    </div>
);

export default HeroBackground;
