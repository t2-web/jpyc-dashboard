# JPYC Dashboard

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

### オンチェーンデータの取得について

JPYC の総供給量や保有者リストはフロントエンドから直接 RPC を叩いて取得します。必要に応じて `.env.local` に以下の環境変数を設定してください。

```
VITE_ETHEREUM_RPC_URL=
VITE_POLYGON_RPC_URL=
VITE_AVALANCHE_RPC_URL=
```

未設定の場合はパブリック RPC (llama/MeowRPC) が利用されます。
