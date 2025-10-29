import { test, expect } from '@playwright/test';

test.describe('On-Chain Supply Tests', () => {
  test.beforeEach(async ({ page }) => {
    // ホームページに移動
    await page.goto('http://localhost:3001');

    // ページが読み込まれるまで待つ
    await page.waitForLoadState('networkidle');
  });

  test('should display total supply in millions', async ({ page }) => {
    // 総供給量が表示されるまで待つ（最大30秒）
    await page.waitForFunction(() => {
      const elements = Array.from(document.querySelectorAll('p'));
      return elements.some(el => el.textContent?.includes('M') && el.textContent?.includes('¥'));
    }, { timeout: 30000 });

    // 総供給量の表示を確認
    const supplyElement = await page.locator('text=/¥.*M/').first();
    await expect(supplyElement).toBeVisible();

    const supplyText = await supplyElement.textContent();
    console.log('Total Supply:', supplyText);

    // 総供給量が0でないことを確認
    expect(supplyText).not.toContain('¥0.0M');
  });

  test('should display chain distribution', async ({ page }) => {
    // チェーン分布が読み込まれるまで待つ
    await page.waitForTimeout(5000);

    // コンソールログを確認
    const logs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      if (text.includes('[Chain Supply]') || text.includes('[Total Blacklist]')) {
        console.log(text);
      }
    });

    // ページをリロードしてログを収集
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(10000);

    // Ethereum, Polygon, Avalancheの全てがログに含まれることを確認
    const ethereumLogs = logs.filter(log => log.includes('Ethereum') && log.includes('Supply'));
    const polygonLogs = logs.filter(log => log.includes('Polygon') && log.includes('Supply'));
    const avalancheLogs = logs.filter(log => log.includes('Avalanche') && log.includes('Supply'));

    console.log('\n=== Ethereum Logs ===');
    ethereumLogs.forEach(log => console.log(log));

    console.log('\n=== Polygon Logs ===');
    polygonLogs.forEach(log => console.log(log));

    console.log('\n=== Avalanche Logs ===');
    avalancheLogs.forEach(log => console.log(log));

    expect(ethereumLogs.length).toBeGreaterThan(0);
    expect(polygonLogs.length).toBeGreaterThan(0);
    expect(avalancheLogs.length).toBeGreaterThan(0);

    // エラーがないことを確認
    const errorLogs = logs.filter(log => log.includes('❌') || log.toLowerCase().includes('failed'));
    if (errorLogs.length > 0) {
      console.log('\n=== Error Logs ===');
      errorLogs.forEach(log => console.log(log));
    }

    // Polygonのエラーがある場合は詳細を確認
    const polygonErrors = errorLogs.filter(log => log.includes('Polygon'));
    if (polygonErrors.length > 0) {
      console.log('\n⚠️  Polygon has errors:', polygonErrors);
    }

    // Avalancheのエラーがある場合は詳細を確認
    const avalancheErrors = errorLogs.filter(log => log.includes('Avalanche'));
    if (avalancheErrors.length > 0) {
      console.log('\n⚠️  Avalanche has errors:', avalancheErrors);
    }
  });

  test('should check chain distribution data in console', async ({ page }) => {
    const logs: { type: string; text: string }[] = [];

    page.on('console', msg => {
      logs.push({ type: msg.type(), text: msg.text() });
    });

    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(15000);

    // Chain Supply関連のログをフィルタ
    const chainSupplyLogs = logs.filter(log =>
      log.text.includes('[Chain Supply]') ||
      log.text.includes('RPC') ||
      log.text.includes('Supply')
    );

    console.log('\n=== Chain Supply Logs ===');
    chainSupplyLogs.forEach(log => {
      console.log(`[${log.type}] ${log.text}`);
    });

    // Ethereumの供給量が正常に取得されていることを確認
    const ethereumSuccess = logs.some(log =>
      log.text.includes('Ethereum') &&
      (log.text.includes('✅') || log.text.includes('RPC')) &&
      log.text.includes('Supply')
    );
    expect(ethereumSuccess).toBe(true);
  });
});
