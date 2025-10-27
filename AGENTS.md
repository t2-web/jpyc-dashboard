# Repository Guidelines

## Project Structure & Module Organization
The JPYC analytics dashboard is a Vite + React app written in TypeScript. Route-level views live in `views/`, while shared widgets (headers, cards, charts) belong in `components/`. Global types reside in `types.ts`, configuration constants in `constants.ts`, and the root layout is wired through `App.tsx` and `index.tsx`. Static shell assets stay in `index.html` and `metadata.json`, and build settings are managed in `vite.config.ts` and `tsconfig.json`. Prefer co-locating supporting files (e.g., `ChartPanel.tsx` with `ChartPanel.test.tsx`) to keep feature areas easy to scan.

## Build, Test, and Development Commands
Run `npm install` once to hydrate dependencies. Use `npm run dev` for the hot-reloading development server on the default Vite port (5173). Ship-ready bundles come from `npm run build`, and `npm run preview` serves that production build locally for a final smoke-test. Keep the console clean—warnings surface data-contract issues early.

## 環境変数とRPC設定
オンチェーンデータ取得には各チェーンの RPC エンドポイントが必要です。`.env.local` などで以下を上書きできます：
- `VITE_ETHEREUM_RPC_URL`
- `VITE_POLYGON_RPC_URL`
- `VITE_AVALANCHE_RPC_URL`
未設定の場合は llama/MeowRPC のパブリックエンドポイントを使用します。

## Coding Style & Naming Conventions
Follow the prevailing two-space indentation and favor JSX-friendly single quotes. Implement features as typed React function components with explicit `React.FC` or inline generics where it clarifies props. Derive UI state from data whenever possible, keeping calculations in memoized helpers within `components/` or `views/` folders. Tailwind-style utility classes drive styling; extend them via shared helper components instead of ad hoc inline styles. Name files in PascalCase for components, camelCase for helpers, and suffix reusable hooks with `use` (e.g., `useMarketMetrics.ts`).

## Testing Guidelines
Automated tests are not yet wired in, so add `vitest` + `@testing-library/react` when introducing non-trivial logic. Place unit specs beside their sources (`MyCard.test.tsx`) and exercise visible behaviours and JPYC-specific calculations. For integration coverage, add scenario notes or Cypress scripts under `tests/` once the flow stabilises. Before submitting a PR, run the dev server and document any manual verification steps in the description.

## Commit & Pull Request Guidelines
The history is currently sparse; please adopt Conventional Commits going forward (`feat: add inflow chart`). Keep subjects in the imperative mood under 72 characters, and add focused bodies when context is needed. Pull requests should reference the related issue, summarise scope, call out UI changes with screenshots, and list any follow-up tasks. Highlight data-sourcing assumptions and mention impacted JPYC metrics, so reviewers can validate against on-chain dashboards.

## コミュニケーション指針
このリポジトリでは、コメントやエージェントからの返信はすべて日本語で記述してください。レビュー箇所やコマンド例を示す際も日本語の補足を添え、開発者体験を揃えましょう。
