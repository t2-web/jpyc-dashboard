# Technology Stack - JPYC Analytics Dashboard

## Architecture

### Overall Architecture Pattern
- **Frontend-Only Application**: フロントエンドから直接ブロックチェーン RPC とスキャン API を呼び出す
- **JAMstack Approach**: 静的生成されたフロントエンド + API による動的データ取得
- **No Backend Required**: バックエンドサーバー不要のシンプルな構成
- **Client-Side Rendering (CSR)**: React による動的レンダリング

### Data Flow
```
User Browser → Vite Dev Server / Static Build
    ↓
React Components
    ↓
Custom Hooks (useJpycOnChainData)
    ↓
RPC Clients (Ethereum, Polygon, Avalanche)
    ↓
Blockchain Networks + Scan APIs
```

## Frontend

### Core Framework
- **React 19.2.0**: UI コンポーネントライブラリ
  - Function Components + Hooks パターン
  - TypeScript による型安全性
  - React.FC 型定義の活用

### Build Tool
- **Vite 6.2.0**: 次世代フロントエンドビルドツール
  - 高速な HMR (Hot Module Replacement)
  - ES モジュールネイティブサポート
  - ロールアップベースの最適化されたビルド
  - `@vitejs/plugin-react` による React サポート

### Language
- **TypeScript 5.8.2**: 型安全な JavaScript
  - ES2022 ターゲット
  - Experimental Decorators サポート
  - JSX: react-jsx モード
  - Path エイリアス: `@/*` → `./*`
  - `noEmit: true` (Vite が型チェックとビルドを分離)

### UI & Styling
- **Tailwind CSS**: ユーティリティファーストの CSS フレームワーク
  - カスタムカラースキーム（Primary, Secondary, Accent）
  - レスポンシブデザインユーティリティ
  - ダークモード対応

### Data Visualization
- **Recharts 3.3.0**: React ベースのチャートライブラリ
  - LineChart: トレンド可視化
  - PieChart: 分布表示
  - 宣言的な API
  - レスポンシブ対応

### State Management
- **React Hooks**: ローカル状態管理
  - `useState`: コンポーネント状態
  - `useEffect`: 副作用処理
  - Custom Hooks: `useJpycOnChainData` でビジネスロジック抽出

## Blockchain Integration

### Web3 Libraries
- **Native Fetch API**: RPC 呼び出し用
  - ethers.js や web3.js の代わりに軽量な実装
  - 直接 JSON-RPC リクエスト送信

### Supported Chains
1. **Ethereum Mainnet**
   - デフォルト RPC: `https://eth.llamarpc.com`
   - スキャン API: Etherscan

2. **Polygon (Matic)**
   - デフォルト RPC: `https://polygon.llamarpc.com`
   - スキャン API: Polygonscan

3. **Avalanche C-Chain**
   - デフォルト RPC: `https://avax.meowrpc.com`
   - スキャン API: Snowtrace

### Contract Interactions
- **balanceOf**: ERC20 トークン残高取得
- **totalSupply**: 総供給量取得
- **ABI エンコーディング**: 手動での関数セレクタ生成

## Development Environment

### Required Tools
- **Node.js**: JavaScript ランタイム（推奨: v18 以上）
- **npm**: パッケージマネージャー
- **Git**: バージョン管理

### Development Dependencies
- **@playwright/test 1.56.1**: E2E テスト フレームワーク
- **@types/node 22.14.0**: Node.js 型定義
- **typescript 5.8.2**: TypeScript コンパイラ

### Editor Setup (推奨)
- **VS Code** + TypeScript 拡張機能
- **ESLint** + Prettier (将来追加予定)

## Common Commands

### Development
```bash
npm install          # 依存関係のインストール
npm run dev          # 開発サーバー起動 (http://localhost:5173)
```

### Building
```bash
npm run build        # プロダクションビルド (dist/ に出力)
npm run preview      # ビルド結果のプレビュー
```

### Testing
```bash
npx playwright test                    # E2E テスト実行
npx playwright test --reporter=html    # HTML レポート生成
npx playwright show-report             # テストレポート表示
```

## Environment Variables

### RPC Endpoints
- `VITE_ETHEREUM_RPC_URL`: Ethereum RPC エンドポイント
  - デフォルト: `https://eth.llamarpc.com`

- `VITE_POLYGON_RPC_URL`: Polygon RPC エンドポイント
  - デフォルト: `https://polygon.llamarpc.com`

- `VITE_AVALANCHE_RPC_URL`: Avalanche RPC エンドポイント
  - デフォルト: `https://avax.meowrpc.com`

### API Keys
- `VITE_MORALIS_API_KEY`: Moralis API キー
  - 用途: Ethereum/Avalanche の保有者数 24h 変化量取得
  - 未設定時: 24h 変化量が非表示

- `VITE_ETHERSCAN_API_KEY`: Etherscan API キー
  - 用途: Ethereum のコントラクト情報取得

- `VITE_POLYGONSCAN_API_KEY`: Polygonscan API キー
  - 用途: Polygon のデータ取得
  - 未設定時: Polygon 分が "Comming Soon" 表示

- `VITE_SNOWTRACE_API_KEY`: Snowtrace API キー
  - 用途: Avalanche のデータ取得

### Configuration File
- **`.env.local`**: ローカル開発用の環境変数（Git 無視）
- **`.envexample`**: 環境変数のサンプル（要リネーム予定: `.env.example`）

## Port Configuration

### Development Server
- **5173**: Vite 開発サーバーのデフォルトポート
  - `--host 127.0.0.1` で明示的にバインド
  - HMR WebSocket も同じポートを使用

### Playwright Test Server
- **5173**: テスト時も同じポートを使用
  - `webServer` 設定で自動起動
  - `reuseExistingServer: true` で既存サーバー利用

### HTML Report Server
- **9323**: Playwright HTML レポートサーバー（デフォルト）

## Performance Optimizations

### Build Optimizations
- **Code Splitting**: Vite による自動コード分割
- **Tree Shaking**: 未使用コードの削除
- **Minification**: プロダクションビルドでの圧縮

### Runtime Optimizations
- **Lazy Loading**: 動的インポートによるコンポーネント遅延読み込み（将来実装予定）
- **Memoization**: React.memo や useMemo による再レンダリング最適化（必要に応じて）
- **Image Optimization**: SVG 利用による軽量化

## Testing Strategy

### E2E Testing (Playwright)
- **ブラウザ**: Chromium（デフォルト）
- **タイムアウト**: 60秒（テスト全体）、8秒（アサーション）
- **並列実行**: `fullyParallel: true`
- **リトライ**: CI では1回、ローカルでは0回
- **証跡**: 失敗時にスクリーンショット、ビデオ、トレース保存

### Test Coverage Areas
- ✅ 基本機能: ページ表示、ナビゲーション
- ✅ データ表示: カード表示、コンテンツ確認
- ✅ レスポンシブ: モバイル、タブレット対応
- 🚧 パフォーマンス: ロード時間、レスポンス時間
- 🚧 アクセシビリティ: WCAG 2.1 AA 準拠

## Coding Conventions

### TypeScript Standards
- **Strict Mode**: 厳格な型チェック
- **Explicit Types**: 型推論に頼りすぎない明示的な型定義
- **Interface First**: 型定義には interface を優先

### React Patterns
- **Function Components**: クラスコンポーネント不使用
- **Hooks**: 状態管理とライフサイクル処理
- **Props Typing**: React.FC または明示的な Props インターフェース

### File Naming
- **Components**: PascalCase (例: `DataCard.tsx`)
- **Hooks**: camelCase with `use` prefix (例: `useJpycOnChainData.ts`)
- **Utilities**: camelCase (例: `onchain.ts`)
- **Constants**: camelCase (例: `constants.ts`)

### Import Organization
- **Absolute Imports**: `@/` エイリアス使用
- **Grouped Imports**: 外部ライブラリ → 内部モジュール → スタイル
- **Named Exports**: デフォルトエクスポート避ける（一部例外あり）

## Security Considerations

### API Key Management
- ✅ 環境変数による管理
- ✅ `.env.local` を `.gitignore` に追加
- ⚠️ クライアントサイドでの API キー露出
  - 注意: `VITE_` プレフィックスの変数はクライアントに露出
  - 対策: レート制限のある無料 API キーのみ使用

### Data Validation
- ✅ RPC レスポンスのエラーハンドリング
- ✅ フォールバック値の設定
- 🚧 入力検証（ユーザー入力がある場合）

### Dependencies
- ✅ 信頼できるパッケージのみ使用
- ✅ 定期的な脆弱性スキャン（npm audit）
- 🚧 Dependabot による自動アップデート（将来設定予定）

## Browser Support

### Target Browsers
- **Chrome**: 最新版 + 1つ前のバージョン
- **Firefox**: 最新版 + 1つ前のバージョン
- **Safari**: 最新版 + 1つ前のバージョン
- **Edge**: 最新版

### Mobile Support
- **iOS Safari**: iOS 14+
- **Chrome Mobile**: Android 10+

### Polyfills
- **ES2022 Features**: Vite による自動 polyfill
- **Fetch API**: モダンブラウザにネイティブサポート

## Deployment

### Static Hosting Options
- **Vercel**: 推奨（Vite との統合が容易）
- **Netlify**: 代替オプション
- **GitHub Pages**: 静的ホスティング
- **IPFS**: 分散型ホスティング（将来検討）

### Build Output
- **Directory**: `dist/`
- **Assets**: `/assets/` に静的ファイル
- **Index**: `index.html` がエントリーポイント

### Environment-Specific Builds
- **Development**: `npm run dev` - ソースマップ、HMR 有効
- **Production**: `npm run build` - 最適化、圧縮、Tree Shaking

## Future Technology Considerations

### Potential Additions
- 📋 **React Query / SWR**: データフェッチングとキャッシュ管理
- 📋 **Zustand / Jotai**: グローバル状態管理（必要に応じて）
- 📋 **ethers.js / viem**: より高度な Web3 機能
- 📋 **Vitest**: 単体テストフレームワーク
- 📋 **ESLint + Prettier**: コード品質とフォーマット

### Performance Monitoring
- 📋 **Web Vitals**: Core Web Vitals の測定
- 📋 **Lighthouse CI**: 継続的なパフォーマンス監視
- 📋 **Sentry**: エラートラッキング
