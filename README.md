# JPYC Dashboard

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

### オンチェーンデータの取得について

JPYC の総供給量や保有者リストはフロントエンドから直接 Public RPC を呼び出して取得します。ブラウザ環境からのアクセスには CORS（Cross-Origin Resource Sharing）対応の RPC URL が必要です。

#### 環境変数の設定

`.env` ファイル（`.env.local` でも可）に以下の環境変数を設定してください：

```bash
# RPC エンドポイント（CORS 対応必須）
VITE_ETHEREUM_RPC_URL=https://eth.llamarpc.com
VITE_POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY
VITE_AVALANCHE_RPC_URL=https://avalanche-mainnet.core.chainstack.com/YOUR_API_KEY

# ブラックリストアドレス（カンマ区切り）
VITE_BLACKLIST_ADDRESSES=0x8549E82239a88f463ab6E55Ad1895b629a00Def3

# Google Analytics測定ID
VITE_GA_MEASUREMENT_ID=
```

#### 推奨 RPC プロバイダー

**⚠️ 重要**: 多くのPublic RPCはブラウザからのCORSリクエストを許可していません。以下のプロバイダーからAPIキーを取得することを推奨します：

1. **Alchemy** (推奨)
   - URL: https://www.alchemy.com/
   - 無料プランあり
   - Polygon対応: `https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY`

2. **Infura**
   - URL: https://infura.io/
   - 無料プランあり
   - Avalanche対応: `https://avalanche-mainnet.infura.io/v3/YOUR_API_KEY`

3. **Chainstack**
   - URL: https://chainstack.com/
   - 無料プランあり
   - 全チェーン対応

4. **QuickNode**
   - URL: https://www.quicknode.com/
   - 無料トライアルあり
   - 全チェーン対応

#### 動作状況

- ✅ **Ethereum**: デフォルトRPC (`eth.llamarpc.com`) で動作
- ⚠️ **Polygon**: APIキー付きRPC URLの設定が必要
- ⚠️ **Avalanche**: APIキー付きRPC URLの設定が必要

APIキーなしの場合、PolygonとAvalancheのTotal Supplyは0と表示されます。

## 主要機能

### ダッシュボード表示

**メトリクスカード（3つ）**:
- 現在価格: JPY換算価格とUSD価格、24h変化率、時価総額
- 24h取引高: 過去24時間の取引量
- 総供給量: 全チェーン合計の総供給量（ブラックリストアドレスを除く）

**チェーン別総供給量グラフ**:
- 横棒グラフ形式で各チェーンの供給量を表示
- **表示形式**: 最も供給量が多いチェーンを100%として、他のチェーンを相対的な割合で表示
- **例**: Ethereum 400M (100%)、Polygon 200M (50%)、Avalanche 100M (25%)
- 各バーには絶対値（JPYC数量）と相対パーセンテージを併記

### データ取得仕様

**2025年10月更新**: Moralis API と Scan API への依存を削除し、すべてのオンチェーンデータを RPC 経由で取得するように変更しました。

**取得データ**:
- ✅ 総供給量: RPC `totalSupply()` 呼び出し
- ✅ ブラックリスト残高: RPC `balanceOf()` 呼び出し
- ✅ チェーン別分布: 各チェーンの総供給量から算出
- ❌ ホルダー数: 削除（RPC経由では取得不可能）

**ブラックリスト処理**:
- 環境変数 `VITE_BLACKLIST_ADDRESSES` で指定されたアドレスの保有量を各チェーンで取得
- 総供給量から差し引いて実質的な流通量を算出
