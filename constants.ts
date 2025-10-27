import { type ContractAddress, type DeFiProtocol, type TutorialSection, type Holder } from './types';

export const JPYC_PRICE_JPY = 1.00;
export const JPYC_PRICE_USD = 0.0068;
export const TOTAL_SUPPLY_BILLIONS = 2.8;
export const TOTAL_SUPPLY_FORMATTED = "2,847,392,156";
export const TOTAL_HOLDERS = "15,847";
export const OPERATION_WALLET = "0x431D5dff03120AFA4bDf332c61A6e1766eF37BDB";

export const CONTRACT_ADDRESSES: ContractAddress[] = [
  { chain: 'Ethereum', name: 'JPYC', address: '0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29', explorerUrl: 'https://etherscan.io/token/0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29' },
  { chain: 'Polygon', name: 'JPYC', address: '0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29', explorerUrl: 'https://polygonscan.com/token/0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29' },
  { chain: 'Avalanche', name: 'JPYC', address: '0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29', explorerUrl: 'https://snowtrace.io/token/0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29' },
];

export const ANNOUNCEMENTS = [
    { date: '2024年10月25日', text: 'Base チェーンでの JPYC 流動性プールが開始されました' },
    { date: '2024年10月20日', text: '新しい DeFi プロトコル Moonwell での JPYC 対応が開始' },
    { date: '2024年10月15日', text: 'JPYC 保有者数が 15,000 人を突破しました' },
];


export const DEFI_PROTOCOLS: DeFiProtocol[] = [
    { name: 'KyberSwap', logoUrl: 'https://picsum.photos/40/40?random=1', description: 'Swap JPYC with other assets seamlessly on multiple chains.', category: 'Swap', link: '#', tvl: '150M' },
    { name: 'Uniswap', logoUrl: 'https://picsum.photos/40/40?random=2', description: 'Provide liquidity for JPYC pairs and earn trading fees.', category: 'Swap', link: '#', tvl: '4.2B' },
    { name: 'Aave', logoUrl: 'https://picsum.photos/40/40?random=3', description: 'Lend your JPYC to earn interest or borrow against your assets.', category: 'Lend', link: '#', tvl: '12.5B', apr: '2.5%' },
    { name: 'Moonwell', logoUrl: 'https://picsum.photos/40/40?random=4', description: 'A lending and borrowing protocol on Base and Moonbeam.', category: 'Lend', link: '#', tvl: '300M', apr: '3.1%' },
    { name: 'Stargate', logoUrl: 'https://picsum.photos/40/40?random=5', description: 'Bridge JPYC across different blockchains with unified liquidity.', category: 'Bridge', link: '#', tvl: '500M' },
    { name: 'Gitcoin', logoUrl: 'https://picsum.photos/40/40?random=6', description: 'Donate to your favorite open-source projects using JPYC.', category: 'Donate', link: '#', tvl: 'N/A' },
];

export const TUTORIALS: TutorialSection[] = [
    {
        title: 'Onboarding',
        content: [
            { heading: '1. Create a MetaMask Wallet', text: 'First, you need a digital wallet. Go to the MetaMask website and install the browser extension. Follow the on-screen instructions, and make sure to store your seed phrase in a safe place.', imageUrl: 'https://picsum.photos/400/200?random=10' },
            { heading: '2. Get JPYC', text: 'You can get JPYC from a Decentralized Exchange (DEX) like KyberSwap. Connect your wallet, select the token you want to swap (e.g., USDC), choose JPYC as the destination token, and approve the transaction.', imageUrl: 'https://picsum.photos/400/200?random=11' },
            { heading: '3. Bridge to L2s (Polygon/Avalanche)', text: 'To use JPYC with lower gas fees, bridge it to a Layer 2 network like Polygon or Avalanche using a bridge like Stargate. This will move your tokens from Ethereum to the selected network.', imageUrl: 'https://picsum.photos/400/200?random=12' },
        ],
    },
    {
        title: 'Yield Farming',
        content: [
            { heading: '1. Provide Liquidity (LP)', text: 'You can earn fees by providing liquidity to a JPYC-USDC pool on a DEX like Uniswap. You deposit an equal value of both tokens. In return, you get LP tokens representing your share.', imageUrl: 'https://picsum.photos/400/200?random=13' },
            { heading: '2. Lend Your JPYC', text: 'On platforms like Aave or Moonwell, you can deposit your JPYC into a lending pool. Other users can borrow your JPYC, and you earn interest on your deposit.', imageUrl: 'https://picsum.photos/400/200?random=14' },
            { heading: '3. Swap Precautions', text: 'Always verify the contract address of JPYC before swapping. Scammers create fake tokens with the same name. Use the official addresses listed in our Community & Transparency tab.', imageUrl: 'https://picsum.photos/400/200?random=15' },
        ],
    },
];

export const TOP_HOLDERS: Holder[] = [
    { rank: 1, address: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B', quantity: '50,000,000', percentage: '5.00%', chain: 'Ethereum' },
    { rank: 2, address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', quantity: '32,500,000', percentage: '3.25%', chain: 'Polygon' },
    { rank: 3, address: '0x90e7a9C4C2F15C3C645B11bB8487786B851351B4', quantity: '21,000,000', percentage: '2.10%', chain: 'Avalanche' },
    { rank: 4, address: '0x5DF9B87991262F6BA471F09758CDE1c0FC1De734', quantity: '15,000,000', percentage: '1.50%', chain: 'Ethereum' },
    { rank: 5, address: '0x1Db3439a222C519ab44bb1144fC28167b4Fa6EE6', quantity: '12,000,000', percentage: '1.20%', chain: 'Polygon' },
];

export const priceChartData = [
  { name: 'Jan', price: 1.00, volume: 2400 },
  { name: 'Feb', price: 1.01, volume: 1398 },
  { name: 'Mar', price: 0.99, volume: 9800 },
  { name: 'Apr', price: 1.00, volume: 3908 },
  { name: 'May', price: 1.02, volume: 4800 },
  { name: 'Jun', price: 1.01, volume: 3800 },
  { name: 'Jul', price: 1.00, volume: 4300 },
];

export const holderChartData = [
  { name: 'Jan', holders: 1200 },
  { name: 'Feb', holders: 1500 },
  { name: 'Mar', holders: 1800 },
  { name: 'Apr', holders: 2500 },
  { name: 'May', holders: 3200 },
  { name: 'Jun', holders: 4100 },
  { name: 'Jul', holders: 5000 },
];

export const chainDistributionData = [
  { name: 'Ethereum', value: 40 },
  { name: 'Polygon', value: 35 },
  { name: 'Avalanche', value: 25 },
];