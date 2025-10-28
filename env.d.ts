/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ETHEREUM_RPC_URL?: string;
  readonly VITE_POLYGON_RPC_URL?: string;
  readonly VITE_AVALANCHE_RPC_URL?: string;
  readonly VITE_MORALIS_API_KEY?: string;
  readonly VITE_ETHERSCAN_API_KEY?: string;
  readonly VITE_POLYGONSCAN_API_KEY?: string;
  readonly VITE_SNOWTRACE_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
