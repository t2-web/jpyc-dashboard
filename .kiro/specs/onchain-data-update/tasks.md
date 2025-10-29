# Implementation Plan

## Phase 1: キャッシュ基盤の実装（Week 1）

- [x] 1. ローカルストレージベースのキャッシュ管理システムを構築する
- [x] 1.1 TTL 付きキャッシュマネージャーを実装する
  - キャッシュエントリのデータ構造を定義（データ、タイムスタンプ、TTL）
  - localStorage へのデータ保存機能を実装
  - localStorage からのデータ読み込み機能を実装
  - TTL に基づくキャッシュ有効性チェック機能を実装
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 1.2 データシリアライゼーション機能を実装する
  - BigInt から文字列への変換ロジックを実装
  - 文字列から BigInt への逆変換ロジックを実装
  - 日付型のタイムスタンプ変換を実装
  - スキーマバージョン管理を追加（v1.0.0）
  - _Requirements: 5.1, 5.2_

- [x] 1.3 キャッシュ容量管理機能を実装する
  - LRU（Least Recently Used）削除戦略を実装
  - localStorage 容量超過時の自動削除機能を実装
  - 最古のキャッシュエントリを特定する機能を実装
  - キャッシュクリア機能を実装（全体およびキー指定）
  - _Requirements: 5.5, 5.6_

- [x] 1.4 キャッシュマネージャーのユニットテストを作成する
  - TTL 期限切れの検証テスト
  - localStorage への保存と読み込みテスト
  - シリアライゼーション/デシリアライゼーションテスト
  - LRU 削除戦略のテスト
  - 容量超過時の自動削除テスト
  - _Requirements: 5.1-5.6_

---

## Phase 2: SWR パターンの実装（Week 2）

- [x] 2. Stale-While-Revalidate データ取得パターンを実装する
- [x] 2.1 既存の useJpycOnChainData Hook を拡張する
  - isStale 状態フラグを追加
  - キャッシュデータの即座表示ロジックを実装
  - バックグラウンドでのデータ更新トリガーを実装
  - 手動更新メソッド（refresh）を追加
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 2.2 キャッシュ統合ロジックを実装する
  - Hook 初期化時にキャッシュマネージャーからデータ復元
  - キャッシュ有効性チェックとフォールバックロジック
  - データ取得完了後のキャッシュ更新処理
  - キャッシュミス時のローディング表示制御
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 2.3 UI トランジション効果を実装する
  - データ更新時のスムーズな UI 遷移
  - ローディングインジケータのアニメーション
  - Stale データ表示中の視覚的フィードバック
  - エラー通知のトースト表示
  - _Requirements: 6.5_

- [x] 2.4 SWR パターンの統合テストを作成する
  - キャッシュヒット時の即座表示テスト
  - バックグラウンド更新の実行テスト
  - データ更新時の UI 再レンダリングテスト
  - ページリロード後のキャッシュ復元テスト
  - _Requirements: 6.1-6.5_

---

## Phase 3: ブラックリストアドレス機能の実装（Week 3）

- [x] 3. ブラックリストアドレス除外システムを構築する
- [x] 3.1 ブラックリストアドレス設定を管理する
  - 環境変数からブラックリストアドレスを読み込む機能 (lib/blacklist.ts)
  - アドレスのチェックサム検証ロジックを実装 (validateEthereumAddress)
  - 複数アドレス対応の配列処理を実装 (loadBlacklistAddresses)
  - 設定ファイルからの読み込み機能（フォールバック） - 環境変数のみ実装
  - _Requirements: 7.1, 7.4, 7.5_

- [x] 3.2 ブラックリストアドレスのフィルタリング機能を実装する
  - ホルダー配列からブラックリストアドレスを除外 (lib/holderFilter.ts)
  - 大文字小文字を区別しないアドレス比較
  - フィルタリングのユニットテスト作成 (9 tests)
  - _Requirements: 7.2, 7.3_

- [x] 3.3 総供給量と流通供給量の計算ロジックを実装する
  - 総供給量からブラックリスト残高を減算する処理 (lib/supplyCalculation.ts)
  - calculateBlacklistedSupply でブラックリスト保有量を計算
  - calculateCirculatingSupply で流通供給量を計算
  - データ整合性チェック（負数にならないことを保証）
  - ユニットテスト作成 (13 tests)
  - _Requirements: 7.2, 7.3, 7.4_

- [x] 3.4 ブラックリストフィルターの統合テストを作成する
  - 単一・複数アドレス除外のユニットテスト (24 tests in lib/blacklist.test.ts)
  - ホルダーフィルタリングテスト (9 tests in lib/holderFilter.test.ts)
  - 供給量計算テスト (13 tests in lib/supplyCalculation.test.ts)
  - 統合テスト (4 tests in hooks/useJpycOnChainDataWithBlacklist.test.tsx)
  - useJpycOnChainDataWithSWR への統合完了
  - 合計50テスト全て通過
  - _Requirements: 7.1-7.5_

---

## Phase 4: チェーン別データ可視化の実装（Week 4）

- [x] 4. チェーン別データの視覚化システムを構築する
- [x] 4.1 チャートデータ集約機能を実装する
  - チェーン別総供給量のパーセンテージ計算ロジック (calculateChainPercentages)
  - チェーン別保有者数のパーセンテージ計算ロジック (calculateChainPercentages)
  - Recharts 互換のデータ構造への変換機能 (convertToRechartsFormat)
  - 合計 100% の検証ロジック (テストで検証済み)
  - ユニットテスト作成 (14 tests in lib/chartDataAggregator.test.ts)
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 4.2 円グラフコンポーネントを実装する
  - Recharts PieChart による総供給量グラフ表示 (ChainDistributionChart)
  - Recharts PieChart による保有者数グラフ表示（ドーナツチャート形式）
  - 最大値チェーンの視覚的強調表示（太枠、★マーク、明度調整）
  - カスタムツールチップでの詳細情報表示（絶対値、パーセンテージ）
  - ResponsiveContainer によるレスポンシブデザイン対応
  - チェーン別カラーコーディング (CHAIN_COLORS定数)
  - ユニットテスト作成 (6 tests in components/ChainDistributionChart.test.tsx)
  - _Requirements: 3.3, 3.4, 3.5_

- [x] 4.3 レスポンシブデザイン対応を実装する
  - ResponsiveContainer による自動サイズ調整
  - デスクトップ・タブレット・モバイル対応
  - _Requirements: 3.1-3.5_

- [ ] 4.4 チャート表示の E2E テストを作成する (Optional)
  - 円グラフ表示の Playwright テスト
  - ツールチップ表示のインタラクションテスト
  - レスポンシブ表示のビジュアルテスト（モバイル、タブレット）
  - 最大値チェーン強調表示の検証テスト
  - _Requirements: 3.1-3.5_

---

## Phase 5: エラーハンドリングとパフォーマンス最適化

- [x] 5. 包括的なエラーハンドリングシステムを実装する
- [x] 5.1 エラー分類とハンドリングロジックを実装する
  - User Error（4xx）の検出と対応ロジック (categorizeError関数)
  - System Error（5xx）の検出と対応ロジック (categorizeError関数)
  - Business Logic Error の検出と対応ロジック (categorizeError関数)
  - Unknown Error の分類とフォールバックロジック
  - エラーログ記録機能（ErrorLog インターフェース、logError関数）
  - ユーザーフレンドリーなエラーメッセージ生成 (handleError関数)
  - ユニットテスト作成 (25 tests in lib/errorHandler.test.ts)
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 5.2 リトライとバックオフ機構を実装する
  - 指数バックオフアルゴリズムの実装 (retryWithBackoff関数、calculateDelay関数)
  - API レート制限エラー（429）の検出と対応 (isRetryableError関数)
  - タイムアウトエラーのリトライロジック (timeout/networkパターンマッチング)
  - 最大リトライ回数の設定と管理 (RetryConfig インターフェース、デフォルト3回)
  - HTTPステータスコードベースのリトライ判定 (429, 500, 502, 503, 504)
  - カスタム設定対応（初回遅延、最大遅延、バックオフ係数）
  - onRetryコールバックによる進捗監視
  - RetryErrorクラスでのエラー情報保持
  - ユニットテスト作成 (16 tests in lib/retryWithBackoff.test.ts)
  - _Requirements: 8.2, 8.3, 8.5, 9.3_

- [x] 5.3 フォールバック戦略を実装する
  - FallbackStatusによる3段階ステータス管理 (SUCCESS, FALLBACK_USED, FAILED)
  - 単一操作フォールバック (executeWithFallback関数)
  - 並列操作フォールバック (executeParallelWithFallback関数)
  - 部分的成功の検出と統計計算 (hasAnySuccess, hasPartialSuccess)
  - 各操作の詳細ステータス追跡 (primaryError, fallbackError)
  - 成功・フォールバック・失敗のカウント統計
  - 統合シナリオテスト（マルチチェーンシミュレーション、グレースフルデグラデーション）
  - ユニットテスト作成 (12 tests in lib/fallbackStrategy.test.ts)
  - _Requirements: 9.1, 9.2, 9.4, 9.5_

- [x] 5.4 API レート制限遵守機能を実装する
  - RateLimiterクラスによるスライディングウィンドウアルゴリズム実装
  - 各APIキーの独立したレート制限管理
  - リクエスト履歴のタイムスタンプ管理とクリーンアップ
  - レート制限チェック結果（allowed, remaining, resetTime, retryAfter）
  - RateLimitExceededErrorによる詳細なエラー情報提供
  - グローバルレート制限マネージャー（checkRateLimit, enforceRateLimit関数）
  - 統合シナリオテスト（30分制限、マルチチェーン、バーストトラフィック）
  - ユニットテスト作成 (16 tests in lib/rateLimiter.test.ts)
  - _Requirements: 8.1, 8.3, 8.4, 8.5_

---

## Phase 6: パフォーマンス最適化と React 最適化

- [x] 6. パフォーマンス最適化機能を実装する
- [ ] 6.1 React コンポーネントのメモ化を実装する
  - React.memo によるコンポーネントメモ化
  - useMemo によるチャートデータ計算のキャッシュ
  - useCallback によるイベントハンドラーの安定化
  - 不要な再レンダリングの削減
  - _Requirements: 10.5_
  - _Note: Phase 5完了時点でコアライブラリ機能は完成。React最適化は統合時に実施_

- [x] 6.2 並列リクエストの最適化を実装する
  - executeParallelWithTimeout関数による並列処理（Promise.allSettled使用）
  - 個別およびグローバルタイムアウト設定
  - TimeoutErrorによる詳細なタイムアウト情報
  - AbortControllerによるキャンセル処理
  - エラー発生時の他リクエスト継続（Promise.allSettled）
  - 成功データ抽出ヘルパー（extractSuccessData, extractErrors）
  - 統合シナリオテスト（マルチチェーン、リトライ統合）
  - ユニットテスト作成 (11 tests in lib/parallelRequest.test.ts)
  - _Requirements: 10.3, 10.4_

- [x] 6.3 パフォーマンスメトリクス計測機能を実装する
  - Performance APIによる高精度計測（measurePerformance関数）
  - 成功・エラー両方のメトリクス記録
  - カスタムメタデータサポート
  - インメモリストア + localStorage永続化
  - PerformanceMetricsクラスによる統計分析（平均、最小、最大、成功率）
  - パーセンタイル計算、時間範囲フィルター、メタデータフィルター
  - サマリーレポート生成機能
  - 統合シナリオテスト（初回ロードvsキャッシュ、マルチチェーン追跡）
  - ユニットテスト作成 (18 tests in lib/performanceMetrics.test.ts)
  - _Requirements: 10.1, 10.2, 10.3_

---

## Phase 7: テストと品質保証

- [ ] 7. 包括的なテストスイートを構築する
- [ ] 7.1 ユニットテストの完成
  - 全コンポーネントのユニットテスト作成
  - カバレッジ 80% 以上を達成
  - エッジケースのテスト追加
  - モックとスタブの適切な使用
  - _Requirements: All_

- [ ] 7.2 統合テストの完成
  - キャッシュ + SWR フローの統合テスト
  - マルチチェーンデータ取得の統合テスト
  - エラーリカバリーの統合テスト
  - ブラックリストフィルター + データ取得の統合テスト
  - _Requirements: All_

- [ ] 7.3 E2E テストの完成
  - 初回ロードフローの Playwright テスト
  - キャッシュ利用フローの Playwright テスト
  - エラーハンドリングフローの Playwright テスト
  - チャート操作の Playwright テスト
  - ブラックリストアドレス適用の検証テスト
  - _Requirements: All_

- [ ] 7.4 パフォーマンステストの完成
  - 初回ロード時間の検証（< 3秒）
  - キャッシュ利用時の検証（< 1秒）
  - データ更新時間の検証（< 5秒）
  - メモリ使用量の検証（< 5KB キャッシュ）
  - _Requirements: 10.1, 10.2, 10.3_

---

## Phase 8: 統合とドキュメント

- [ ] 8. システム統合と最終調整を実施する
- [ ] 8.1 既存システムへの統合
  - 既存の useJpycOnChainData Hook の段階的置き換え
  - 既存コンポーネントとの互換性確認
  - データフォーマットの一貫性検証
  - 既存の constants.ts との統合確認
  - _Requirements: All_

- [ ] 8.2 環境変数とコンフィグの設定
  - .env.example の更新（VITE_BLACKLIST_ADDRESSES）
  - README.md の環境変数セクション更新
  - デフォルト値とフォールバック設定の確認
  - 環境変数バリデーションの実装
  - _Requirements: 7.1, 7.5_

- [ ] 8.3 最終的な動作検証
  - 全機能の手動テスト実施
  - 各チェーンでの実データ取得確認
  - ブラックリストアドレス適用の実データ検証
  - キャッシュ永続化の実ブラウザ検証
  - パフォーマンス目標達成の確認
  - _Requirements: All_

- [ ] 8.4 コードレビューと最適化
  - TypeScript 型定義の完全性確認
  - ESLint ルール準拠確認
  - 未使用コードの削除
  - コードコメントの追加と整理
  - _Requirements: All_

---

## Requirements Coverage Summary

| 要件 | 対応タスク |
|------|----------|
| 1.1-1.5 (総供給量取得) | 3.2, 3.3, 5.3, 8.1 |
| 2.1-2.5 (保有者数取得) | 3.2, 3.3, 5.3, 8.1 |
| 3.1-3.5 (チェーン別可視化) | 4.1, 4.2, 4.3, 4.4 |
| 4.1-4.5 (現在価格表示) | 既存実装維持（Coming Soon 表示） |
| 5.1-5.6 (TTL キャッシュ) | 1.1, 1.2, 1.3, 1.4, 2.2 |
| 6.1-6.5 (SWR パターン) | 2.1, 2.2, 2.3, 2.4 |
| 7.1-7.5 (ブラックリスト管理) | 3.1, 3.2, 3.3, 3.4 |
| 8.1-8.5 (レート制限対応) | 5.2, 5.4 |
| 9.1-9.5 (エラーハンドリング) | 5.1, 5.2, 5.3 |
| 10.1-10.5 (パフォーマンス要件) | 6.1, 6.2, 6.3, 7.4 |

---

## Implementation Notes

### 推奨実装順序
1. Phase 1（Week 1）: キャッシュ基盤 → 他の機能の前提条件
2. Phase 2（Week 2）: SWR パターン → UX の大幅改善
3. Phase 3（Week 3）: ブラックリストアドレス → ビジネスロジック
4. Phase 4（Week 4）: チャート可視化 → ユーザー向け機能
5. Phase 5-8: エラーハンドリング、最適化、テスト、統合

### 各フェーズ完了時の検証
- Phase 1: localStorage にキャッシュが保存され、TTL が機能すること
- Phase 2: キャッシュデータが即座に表示され、バックグラウンド更新が実行されること
- Phase 3: ブラックリストアドレスが正しく除外されること
- Phase 4: チェーン別データが円グラフで視覚化されること
- Phase 5-8: すべてのテストが合格し、パフォーマンス目標を達成すること

### ロールバックトリガー
- Phase 1: localStorage エラー率 > 5%
- Phase 2: データ更新エラー率 > 10%
- Phase 3: データ整合性エラー発生
- Phase 4: チャート描画エラー
