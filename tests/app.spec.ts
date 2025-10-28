import { test, expect } from '@playwright/test';

const selectors = {
  heroHeading: 'h1 >> text=JPYC',
  priceCard: 'section >> text=現在価格',
  supplyCard: 'section >> text=総供給量',
  holdersCard: 'section >> text=保有者数',
};

test.describe('JPYC Portal basics', () => {
  test('トップページで主要要素が表示される', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator(selectors.heroHeading)).toBeVisible();
    await expect(page.getByRole('heading', { name: '日本円ステーブルコイン' })).toBeVisible();

    await expect(page.getByRole('heading', { name: '現在価格' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '総供給量' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '保有者数' })).toBeVisible();
    // Comming Soon が複数存在するため、最初の1つが表示されていることを確認
    await expect(page.getByText('Comming Soon').first()).toBeVisible();
  });

  test('ナビゲーションからエコシステムとセキュリティに遷移できる', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'エコシステム' }).click();
    await expect(page.getByRole('heading', { name: 'エコシステム' })).toBeVisible();

    await page.getByRole('button', { name: 'セキュリティ' }).click();
    await expect(page.getByRole('heading', { name: 'セキュリティセンター' })).toBeVisible();
  });

  test('保有者情報セクションに公式アドレス一覧が表示される', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'コミュニティ' }).click();

    await expect(page.getByRole('heading', { name: 'セキュリティと透明性' })).toBeVisible();
    // JPYC Official が複数存在するため、少なくとも1つが表示されていることを確認
    await expect(page.getByText('JPYC Official').first()).toBeVisible();
  });
});

test.describe('JPYC Portal - データ表示機能', () => {
  test('価格情報カードが正しく表示される', async ({ page }) => {
    await page.goto('/');

    // 現在価格カードの存在確認
    await expect(page.getByRole('heading', { name: '現在価格' })).toBeVisible();

    // 価格データが表示されているか、Comming Soonメッセージが表示されているか確認
    const priceSection = page.locator('section').filter({ hasText: '現在価格' });
    const hasContent = await priceSection.locator('p').first().isVisible();
    expect(hasContent).toBeTruthy();
  });

  test('総供給量カードが正しく表示される', async ({ page }) => {
    await page.goto('/');

    // 総供給量カードの存在確認
    const supplyCard = page.locator('section').filter({ hasText: '総供給量' });
    await expect(supplyCard).toBeVisible();
  });

  test('保有者数カードが正しく表示される', async ({ page }) => {
    await page.goto('/');

    // 保有者数カードの存在確認
    const holdersCard = page.locator('section').filter({ hasText: '保有者数' });
    await expect(holdersCard).toBeVisible();
  });
});

test.describe('JPYC Portal - ナビゲーション機能', () => {
  test('全てのナビゲーションボタンが機能する', async ({ page }) => {
    await page.goto('/');

    // ホームに戻る
    await page.getByRole('button', { name: 'ホーム' }).click();
    await expect(page.locator('h1 >> text=JPYC')).toBeVisible();

    // エコシステム
    await page.getByRole('button', { name: 'エコシステム' }).click();
    await expect(page.getByRole('heading', { name: 'エコシステム' })).toBeVisible();

    // セキュリティ
    await page.getByRole('button', { name: 'セキュリティ' }).click();
    await expect(page.getByRole('heading', { name: 'セキュリティセンター' })).toBeVisible();

    // コミュニティ
    await page.getByRole('button', { name: 'コミュニティ' }).click();
    await expect(page.getByRole('heading', { name: 'セキュリティと透明性' })).toBeVisible();
  });
});

test.describe('JPYC Portal - レスポンシブデザイン', () => {
  test('モバイル表示でも主要要素が表示される', async ({ page }) => {
    // モバイルサイズに設定
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await expect(page.locator('h1 >> text=JPYC')).toBeVisible();
    await expect(page.getByRole('heading', { name: '現在価格' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '総供給量' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '保有者数' })).toBeVisible();
  });

  test('タブレット表示でも主要要素が表示される', async ({ page }) => {
    // タブレットサイズに設定
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await expect(page.locator('h1 >> text=JPYC')).toBeVisible();
    await expect(page.getByRole('heading', { name: '現在価格' })).toBeVisible();
  });
});
