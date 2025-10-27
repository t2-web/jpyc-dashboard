import React from 'react';

const iconProps = {
  className: "w-6 h-6 inline-block",
  strokeWidth: 1.5
};

export const HomeIcon = () => <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
export const ChartIcon = () => <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>;
export const DropletIcon = () => <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path></svg>;
export const TutorialIcon = () => <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;
export const CommunityIcon = () => <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;

export const ExternalLinkIcon = () => <svg className="w-4 h-4 inline-block ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>;
// Fix: Updated CopyIcon to accept SVG props, allowing onClick handlers to be passed.
export const CopyIcon = (props: React.ComponentProps<'svg'>) => <svg {...props} className="w-4 h-4 inline-block ml-2 cursor-pointer" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>;

export const TwitterIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.39.106-.803.163-1.227.163-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"></path></svg>;

export const ChevronDownIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>;
export const RepeatIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>;

export const TrendUpIcon = () => <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>;
export const TrendDownIcon = () => <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>;

export const SupplyIcon = () => <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
export const HoldersIcon = () => <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
export const PriceIcon = () => <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;

export const PlayIcon = () => <svg className="w-16 h-16 text-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"></path></svg>

// Chain Logos
const chainLogoProps = { className: "w-5 h-5" };
export const EthereumLogo = () => <svg {...chainLogoProps} viewBox="0 0 32 32"><path fill="#627EEA" d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zM16.486 4.714l-.35 15.654l7.46-4.507l-7.11-11.147zM15.513 4.714l7.11 11.147l-7.46 4.507l.35-15.654zM9.428 17.1l6.768 10.187l.304-13.844l-7.072 3.657zm13.144 0l-7.072-3.657l.304 13.844l6.768-10.187z"/></svg>;
export const PolygonLogo = () => <svg {...chainLogoProps} viewBox="0 0 24 24"><path fill="#8247E5" d="M16.49.33L9.04 4.87v9.28l7.45-4.53V.33zM7.51 5.34L.06 9.87v4.28l7.45-4.52V5.34zm9.04 9.34l7.45-4.43v-4.3l-7.45 4.52v4.21zM7.51 18.66l-7.45-4.5V9.9l7.45 4.53v4.23z"/></svg>;
export const AvalancheLogo = () => <svg {...chainLogoProps} viewBox="0 0 24 24"><path fill="#E84142" d="M1.383 15.34L12 2.316l10.617 13.024h-5.04L12 9.042l-5.577 6.298zM17.433 16.11l-5.433-6.196l-5.433 6.196H.825L12 22.036L23.175 16.11z"/></svg>;

export const getChainLogo = (chain: string, props?: any) => {
    switch (chain) {
        case 'Ethereum': return <EthereumLogo {...props} />;
        case 'Polygon': return <PolygonLogo {...props} />;
        case 'Avalanche': return <AvalancheLogo {...props} />;
        default: return null;
    }
}