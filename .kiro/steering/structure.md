# Project Structure - JPYC Analytics Dashboard

## Root Directory Organization

```
36_jpyc-analytics-dashboard/
├── .claude/              # Claude Code 設定とコマンド
├── .git/                 # Git バージョン管理
├── .kiro/                # Kiro Spec-Driven Development
│   └── steering/         # ステアリングドキュメント
├── .serena/              # Serena MCP 設定
├── components/           # 再利用可能な UI コンポーネント
├── dist/                 # ビルド出力（Git 無視）
├── hooks/                # カスタム React Hooks
├── image/                # 静的画像アセット
├── lib/                  # ユーティリティとヘルパー関数
├── node_modules/         # npm 依存関係（Git 無視）
├── playwright-report/    # Playwright テストレポート（Git 無視）
├── test-results/         # Playwright テスト結果（Git 無視）
├── tests/                # E2E テストファイル
├── views/                # ページレベルコンポーネント
├── .env                  # 環境変数（Git 無視）
├── .env.local            # ローカル環境変数（Git 無視）
├── .envexample           # 環境変数サンプル
├── .gitignore            # Git 無視ファイル設定
├── .mcp.json             # MCP 設定
├── AGENTS.md             # リポジトリガイドライン
├── CLAUDE.md             # Claude Code プロジェクト設定
├── README.md             # プロジェクト README
├── App.tsx               # ルートアプリケーションコンポーネント
├── constants.ts          # グローバル定数定義
├── env.d.ts              # 環境変数の型定義
├── index.html            # HTML エントリーポイント
├── index.tsx             # React エントリーポイント
├── package.json          # npm パッケージ設定
├── package-lock.json     # npm 依存関係ロック
├── playwright.config.ts  # Playwright 設定
├── tsconfig.json         # TypeScript 設定
├── types.ts              # TypeScript 型定義
└── vite.config.ts        # Vite ビルド設定
```

## Subdirectory Structures

### `/components` - UI コンポーネント
共有される再利用可能なコンポーネントを格納

```
components/
├── Card.tsx              # 汎用カードコンポーネント
├── DataCard.tsx          # データ表示用カード
├── Header.tsx            # ページヘッダーとナビゲーション
├── HeroBackground.tsx    # ヒーローセクション背景
├── LineChart.tsx         # 折れ線グラフコンポーネント
├── PieChart.tsx          # 円グラフコンポーネント
├── SwapWidget.tsx        # スワップウィジェット（準備中）
└── icons.tsx             # アイコンコンポーネント集
```

**設計原則**:
- 単一責任: 各コンポーネントは1つの機能に集中
- Props による制御: 外部から動作をカスタマイズ可能
- TypeScript 型定義: すべての Props に型を定義
- 再利用性: 複数の View で使用可能

### `/views` - ページコンポーネント
ルートレベルのページコンポーネントを格納

```
views/
├── Analytics.tsx         # 分析ページ（開発中）
├── Community.tsx         # コミュニティページ
├── Ecosystem.tsx         # エコシステムページ
├── Home.tsx              # ホームページ（メインダッシュボード）
├── Security.tsx          # セキュリティセンターページ
└── Tutorials.tsx         # チュートリアルページ（準備中）
```

**設計原則**:
- ページ単位の責任: 各ファイルが1つのページを表現
- Component 組み合わせ: `/components` の部品を組み合わせて構築
- Data Fetching: カスタム Hooks でデータ取得
- Layout 管理: ページ全体のレイアウトを制御

### `/hooks` - カスタム React Hooks
ビジネスロジックと状態管理を抽出

```
hooks/
└── useJpycOnChainData.ts # JPYC オンチェーンデータ取得 Hook
```

**設計原則**:
- `use` プレフィックス: React Hooks の命名規則に従う
- ロジック分離: UI とビジネスロジックを分離
- 再利用性: 複数コンポーネントで共有可能
- 型安全性: 戻り値の型を明示的に定義

**useJpycOnChainData の責務**:
- マルチチェーンデータの並列取得
- エラーハンドリングとリトライ
- ローディング状態の管理
- データの集計と整形

### `/lib` - ユーティリティライブラリ
汎用的なヘルパー関数とユーティリティ

```
lib/
└── onchain.ts            # ブロックチェーン関連ユーティリティ
```

**設計原則**:
- Pure Functions: 副作用のない純粋関数
- 汎用性: 特定のコンポーネントに依存しない
- ドメイン分離: onchain, api, utils など機能別に分割

**onchain.ts の機能**:
- RPC エンドポイント設定
- コントラクト ABI エンコーディング
- トランザクション送信（将来）

### `/tests` - E2E テスト
Playwright による End-to-End テスト

```
tests/
└── app.spec.ts           # アプリケーション全体のテスト
```

**テストカバレッジ**:
- 基本機能: ページ表示、ナビゲーション
- データ表示: カード、チャート、メトリクス
- レスポンシブ: モバイル、タブレット対応
- インタラクション: ボタンクリック、遷移

### `/image` - 静的アセット
SVG 画像とアイコン

```
image/
├── favicon.svg           # ファビコン
└── logo.svg              # JPYC ロゴ
```

**アセット管理**:
- SVG 優先: スケーラブルで軽量
- Vite による最適化: ビルド時に自動最適化

### `/.claude` - Claude Code 設定
カスタムコマンドと設定

```
.claude/
└── commands/             # スラッシュコマンド定義
```

### `/.kiro` - Spec-Driven Development
仕様駆動開発のドキュメント

```
.kiro/
├── specs/                # 機能仕様書（将来）
└── steering/             # ステアリングドキュメント
    ├── product.md        # プロダクト概要
    ├── tech.md           # 技術スタック
    └── structure.md      # プロジェクト構造（本ドキュメント）
```

## Code Organization Patterns

### Component Structure Pattern
```typescript
// 1. Imports
import React from 'react';
import { OtherComponent } from '@/components/OtherComponent';

// 2. Types/Interfaces
interface MyComponentProps {
  title: string;
  data: DataType;
}

// 3. Component Definition
export function MyComponent({ title, data }: MyComponentProps) {
  // 4. Hooks
  const [state, setState] = React.useState<StateType>(initialState);

  // 5. Event Handlers
  const handleClick = () => {
    // ...
  };

  // 6. Render
  return (
    <div>
      {/* ... */}
    </div>
  );
}
```

### Custom Hook Pattern
```typescript
// 1. Imports
import { useState, useEffect } from 'react';

// 2. Types
interface UseDataResult {
  data: DataType | null;
  loading: boolean;
  error: Error | null;
}

// 3. Hook Definition
export function useData(): UseDataResult {
  // 4. State
  const [data, setData] = useState<DataType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 5. Effects
  useEffect(() => {
    // Fetch data logic
  }, []);

  // 6. Return
  return { data, loading, error };
}
```

### View Component Pattern
```typescript
// 1. Imports
import { Header } from '@/components/Header';
import { DataCard } from '@/components/DataCard';
import { useJpycOnChainData } from '@/hooks/useJpycOnChainData';

// 2. View Component
export function HomePage() {
  // 3. Data Fetching
  const { data, loading } = useJpycOnChainData();

  // 4. Layout Rendering
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <DataCard data={data} loading={loading} />
      </main>
    </div>
  );
}
```

## File Naming Conventions

### Components
- **Format**: PascalCase
- **Examples**: `Header.tsx`, `DataCard.tsx`, `LineChart.tsx`
- **Rule**: コンポーネント名とファイル名を一致させる

### Hooks
- **Format**: camelCase with `use` prefix
- **Examples**: `useJpycOnChainData.ts`, `useWallet.ts`
- **Rule**: React Hooks の命名規則に従う

### Utilities
- **Format**: camelCase
- **Examples**: `onchain.ts`, `api.ts`, `utils.ts`
- **Rule**: 機能を表す名前を使用

### Constants
- **Format**: camelCase (ファイル), SCREAMING_SNAKE_CASE (変数)
- **Examples**: `constants.ts` → `JPYC_ADDRESSES`
- **Rule**: グローバル定数は大文字スネークケース

### Types
- **Format**: PascalCase (型名), camelCase (ファイル名)
- **Examples**: `types.ts` → `type ChainData = ...`
- **Rule**: 型定義は interface または type を使用

### Tests
- **Format**: `*.spec.ts` または `*.test.ts`
- **Examples**: `app.spec.ts`, `DataCard.test.tsx`
- **Rule**: テスト対象と同じベース名を使用

## Import Organization

### Import Order
```typescript
// 1. External libraries (React, third-party)
import React from 'react';
import { LineChart, Line } from 'recharts';

// 2. Internal modules (components, hooks, utils)
import { Header } from '@/components/Header';
import { useJpycOnChainData } from '@/hooks/useJpycOnChainData';
import { JPYC_ADDRESSES } from '@/constants';

// 3. Types
import type { ChainData, MetricsData } from '@/types';

// 4. Styles (if applicable)
import './styles.css';
```

### Path Aliases
- **`@/*`**: プロジェクトルートからの絶対パス
- **Examples**:
  - `@/components/Header` → `./components/Header`
  - `@/hooks/useJpycOnChainData` → `./hooks/useJpycOnChainData`

### Import Best Practices
- ✅ Named imports 優先: `import { Component } from 'lib'`
- ✅ 絶対パス使用: 相対パス `../../` を避ける
- ✅ 型インポート明示: `import type { Type } from 'lib'`
- ❌ Default imports 最小化: 混乱を避ける

## Key Architectural Principles

### 1. **Component-Based Architecture**
- **Atomic Design**: 小さなコンポーネントから大きなページを構築
- **Composition Over Inheritance**: コンポーネント組み合わせでページ構築
- **Single Responsibility**: 各コンポーネントは1つの責務に集中

### 2. **Separation of Concerns**
- **Presentation vs Logic**: UI コンポーネントとビジネスロジックを分離
- **Custom Hooks**: ロジックを Hooks に抽出
- **Utility Functions**: 汎用処理を lib/ に配置

### 3. **Type Safety**
- **TypeScript First**: すべてのコードに型定義
- **Explicit Types**: 型推論に頼りすぎない
- **Interface Definitions**: Props や API レスポンスの型を定義

### 4. **Declarative Programming**
- **React Declarative**: 宣言的な UI 記述
- **Side Effects Isolation**: useEffect で副作用を分離
- **Immutability**: 状態の不変性を保つ

### 5. **Performance Optimization**
- **Code Splitting**: 動的インポートでバンドル最適化（将来）
- **Memoization**: 不要な再レンダリングを防ぐ（必要に応じて）
- **Lazy Loading**: 遅延読み込みで初期ロード高速化（将来）

### 6. **Testability**
- **Pure Functions**: 副作用のない関数でテストを容易に
- **Component Isolation**: 各コンポーネントを独立してテスト可能に
- **E2E Coverage**: ユーザーフローを E2E でテスト

### 7. **Maintainability**
- **Consistent Naming**: 命名規則の統一
- **Clear Structure**: 直感的なディレクトリ構成
- **Documentation**: コードコメントと外部ドキュメント

### 8. **Scalability**
- **Modular Design**: 新機能追加が容易
- **Extension Points**: 新しいチェーン対応を簡単に追加
- **Configuration-Driven**: 設定ベースの柔軟な実装

## Configuration Files

### `tsconfig.json`
TypeScript コンパイラ設定
- **Target**: ES2022
- **Module**: ESNext (Vite 対応)
- **JSX**: react-jsx
- **Path Aliases**: `@/*` マッピング
- **NoEmit**: true (Vite がビルド担当)

### `vite.config.ts`
Vite ビルドツール設定
- **Plugins**: @vitejs/plugin-react
- **Build Output**: dist/
- **Dev Server**: ポート 5173

### `playwright.config.ts`
Playwright テスト設定
- **Test Dir**: tests/
- **Base URL**: http://127.0.0.1:5173
- **Browser**: Chromium
- **Web Server**: 自動起動設定

### `package.json`
npm パッケージ設定
- **Scripts**: dev, build, preview
- **Dependencies**: react, react-dom, recharts
- **DevDependencies**: vite, typescript, playwright

## Development Workflow

### 1. Feature Development
```
1. View で新機能の UI を作成
2. 必要なコンポーネントを components/ に追加
3. データ取得ロジックを hooks/ に実装
4. ユーティリティ関数を lib/ に追加
5. 型定義を types.ts に追加
```

### 2. Testing
```
1. E2E テストを tests/ に追加
2. Playwright でユーザーフロー確認
3. レスポンシブデザインのテスト
```

### 3. Deployment
```
1. npm run build で本番ビルド
2. dist/ の内容をホスティングサービスにデプロイ
3. 環境変数を本番環境に設定
```

## Future Structure Evolution

### Potential Additions
- 📋 `/api`: バックエンド API（必要に応じて）
- 📋 `/contexts`: React Context 定義
- 📋 `/store`: 状態管理（Zustand/Jotai）
- 📋 `/styles`: グローバルスタイル
- 📋 `/utils`: 汎用ユーティリティ
- 📋 `/types`: 型定義の分離

### Scaling Considerations
- **Monorepo**: 複数パッケージ管理（将来）
- **Feature Folders**: 機能別ディレクトリ構成
- **Micro Frontends**: モジュール分割（大規模化時）
