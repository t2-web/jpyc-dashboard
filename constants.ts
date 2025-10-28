import { type ContractAddress, type DeFiProtocol, type TutorialSection, type EcosystemResource, type ScamContract, type HolderAccount, type SupportedChain } from './types';
export const OPERATION_WALLET = "0x431D5dff03120AFA4bDf332c61A6e1766eF37BDB";

export const CONTRACT_ADDRESSES: ContractAddress[] = [
  { chain: 'Ethereum', name: 'JPYC', address: '0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29', explorerUrl: 'https://etherscan.io/token/0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29' },
  { chain: 'Polygon', name: 'JPYC', address: '0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29', explorerUrl: 'https://polygonscan.com/token/0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29' },
  { chain: 'Avalanche', name: 'JPYC', address: '0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29', explorerUrl: 'https://snowtrace.io/token/0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29' },
];

export const ANNOUNCEMENTS = [
    { date: '2024年10月27日', text: 'Avalanche チェーンでの JPYC 流動性プールが開始されました' },
    { date: '2024年10月27日', text: 'Ethereum チェーンでの JPYC 流動性プールが開始されました' },
    { date: '2024年10月27日', text: 'Polygon チェーンでの JPYC 流動性プールが開始されました' },
];
//TODO: Update with real logoUrl
export const DEFI_PROTOCOLS: DeFiProtocol[] = [
    { name: 'Uniswap', logoUrl: 'https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png?1696512319', description: 'JPYC ペアへ流動性を提供し、取引手数料を獲得できます。', category: 'スワップ', link: '#', tvl: '4.2B' },
    { name: 'KyberSwap', logoUrl: 'https://assets.coingecko.com/markets/images/678/small/kyberswap-dex.png?1695156333', description: '複数チェーンで JPYC と他通貨をシームレスにスワップできます。', category: 'スワップ', link: '#', tvl: '150M' },
    { name: 'Aave', logoUrl: 'https://assets.coingecko.com/coins/images/12645/small/AAVE.png?1696512361', description: 'JPYC を預け入れて利息を得たり、担保にして借入ができます。', category: 'レンディング', link: '#', tvl: '12.5B', apr: '2.5%' },
    { name: 'Moonwell', logoUrl: 'https://assets.coingecko.com/coins/images/26452/small/Mark_200x200.png?1658129113', description: 'Base と Moonbeam 上で利用できるレンディング／ボローイングプロトコルです。', category: 'レンディング', link: '#', tvl: '300M', apr: '3.1%' },
    { name: 'Stargate', logoUrl: 'https://assets.coingecko.com/coins/images/24413/small/STG_LOGO.png?1647654518', description: '統一流動性を使って JPYC を異なるブロックチェーン間でブリッジ。', category: 'ブリッジ', link: '#', tvl: '500M' },
    { name: 'Gitcoin', logoUrl: 'https://assets.coingecko.com/coins/images/731/small/gitcoin.png?1656678724', description: 'JPYC でお気に入りの OSS プロジェクトに寄付できます。', category: '寄付', link: '#', tvl: 'N/A' },
];

export const ECOSYSTEM_RESOURCES: EcosystemResource[] = [
    {
        name: 'JPYCの発行と償還',
        description: 'JPYC の発行・償還プロセスや仕組みを詳しく解説した公式ページです。',
        category: '公式情報',
        link: 'https://jpyc.co.jp/about/',
    },
    {
        name: 'JPYC公式',
        description: 'JPYC株式会社の公式コーポレートサイト。各種ポリシーや会社情報を確認できます。',
        category: '公式情報',
        link: 'https://corporate.jpyc.co.jp/',
    },
    {
        name: 'JPYCブログ',
        description: '最新のお知らせやイベントレポート、ユースケースをまとめた公式ブログです。',
        category: '導入ガイド',
        link: 'https://blog.jpyc.jp/',
    },
];

export const TUTORIALS: TutorialSection[] = [
    {
        title: 'オンボーディング',
        content: [
            { heading: '1. MetaMask ウォレットを作成', text: 'まずはデジタルウォレットを用意しましょう。MetaMask 公式サイトから拡張機能をインストールし、表示される手順に従ってセットアップします。シードフレーズは必ず安全な場所に保管してください。', imageUrl: 'https://picsum.photos/400/200?random=10' },
            { heading: '2. JPYC を入手', text: 'KyberSwap などの分散型取引所 (DEX) で JPYC を取得できます。ウォレットを接続し、交換元のトークン（例: USDC）を選択、交換先に JPYC を指定してトランザクションを承認します。', imageUrl: 'https://picsum.photos/400/200?random=11' },
            { heading: '3. L2 へブリッジ', text: 'ガス代を抑えるには Polygon や Avalanche といった L2 にブリッジしましょう。Stargate などのブリッジを使えば、Ethereum から選択したネットワークへトークンを移動できます。', imageUrl: 'https://picsum.photos/400/200?random=12' },
        ],
    },
    {
        title: 'イールドファーミング',
        content: [
            { heading: '1. 流動性を提供', text: 'Uniswap などの DEX で JPYC-USDC プールに流動性を追加すると、取引手数料の一部を獲得できます。両トークンを同額ずつ預け入れると、持分を示す LP トークンが受け取れます。', imageUrl: 'https://picsum.photos/400/200?random=13' },
            { heading: '2. JPYC をレンディング', text: 'Aave や Moonwell では JPYC をレンディングプールへ預け入れられます。他ユーザーが借り入れることで、預けた分の利息を得られます。', imageUrl: 'https://picsum.photos/400/200?random=14' },
            { heading: '3. スワップ時の注意点', text: 'スワップする前に必ず JPYC のコントラクトアドレスを確認しましょう。同名の偽トークンが存在する可能性があります。「コミュニティと透明性」タブに掲載している公式アドレスを参照してください。', imageUrl: 'https://picsum.photos/400/200?random=15' },
        ],
    },
];

export const HOLDER_ACCOUNTS: HolderAccount[] = [
    { rank: 1, address: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B', chain: 'Ethereum', label: 'JPYC Treasury（例）' },
    { rank: 2, address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', chain: 'Polygon' },
    { rank: 3, address: '0x90e7a9C4C2F15C3C645B11bB8487786B851351B4', chain: 'Avalanche' },
    { rank: 4, address: '0x5DF9B87991262F6BA471F09758CDE1c0FC1De734', chain: 'Ethereum' },
    { rank: 5, address: '0x1Db3439a222C519ab44bb1144fC28167b4Fa6EE6', chain: 'Polygon' },
];

export const MORALIS_CHAIN_IDS: Record<SupportedChain, string> = {
    Ethereum: '0x1',
    Polygon: '0x89',
    Avalanche: '0xa86a',
};

export const SCAN_API_CONFIG: Record<SupportedChain, { envKey: string; baseUrl: string; chainId?: string } | null> = {
    Ethereum: { envKey: 'VITE_ETHERSCAN_API_KEY', baseUrl: 'https://api.etherscan.io/v2/api', chainId: '1' },
    Polygon: { envKey: 'VITE_POLYGONSCAN_API_KEY', baseUrl: 'https://api.etherscan.io/v2/api', chainId: '137' },
    Avalanche: { envKey: 'VITE_SNOWTRACE_API_KEY', baseUrl: 'https://api.snowtrace.io/api', chainId: '43114' },
};

// TODO: Update with real data
export const priceChartData = [
  { name: '1月', price: 1.00, volume: 2400 },
  { name: '2月', price: 1.01, volume: 1398 },
  { name: '3月', price: 0.99, volume: 9800 },
  { name: '4月', price: 1.00, volume: 3908 },
  { name: '5月', price: 1.02, volume: 4800 },
  { name: '6月', price: 1.01, volume: 3800 },
  { name: '7月', price: 1.00, volume: 4300 },
];

// TODO: Update with real data
export const holderChartData = [
  { name: '1月', holders: 1200 },
  { name: '2月', holders: 1500 },
  { name: '3月', holders: 1800 },
  { name: '4月', holders: 2500 },
  { name: '5月', holders: 3200 },
  { name: '6月', holders: 4100 },
  { name: '7月', holders: 5000 },
];

// TODO: Update with real data
export const chainDistributionData = [
  { name: 'イーサリアム', value: 40 },
  { name: 'ポリゴン', value: 35 },
  { name: 'アバランチ', value: 25 },
];

export const SCAM_CONTRACTS: ScamContract[] = [
    {
        name: 'JPYC Fake Token 001',
        chain: 'Ethereum',
        address: '0x1111111111111111111111111111111111111111',
        reportedAt: '2024-08-12',
        status: '注意喚起',
        note: 'SNS 経由で出回った偽トークン。公式アドレスと一致しないため注意。',
    },
    {
        name: 'JPYC Scam Vault',
        chain: 'Polygon',
        address: '0x2222222222222222222222222222222222222222',
        reportedAt: '2024-07-30',
        status: '無効化済み',
        note: '偽ステーキング案件として報告。現在はアクセス不可。',
    },
    {
        name: 'JPYC Rug Pull Pool',
        chain: 'Avalanche',
        address: '0x3333333333333333333333333333333333333333',
        reportedAt: '2024-05-18',
        status: '調査中',
    },
];

export const SCAM_REPORT_FORM_URL = 'https://forms.gle/jpyc-scam-report';
