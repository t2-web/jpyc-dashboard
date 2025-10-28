/**
 * Google Analytics初期化
 */
export function initGA() {
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (!gaId) {
    console.warn('⚠️ [GA] VITE_GA_MEASUREMENT_ID is not set. Google Analytics will not be initialized.');
    return;
  }

  // 既存のスクリプトを置き換え
  const existingScript = document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
  if (existingScript) {
    existingScript.setAttribute('src', `https://www.googletagmanager.com/gtag/js?id=${gaId}`);
  }

  // gtag設定を更新
  const existingConfig = document.querySelector('script:not([src])');
  if (existingConfig && existingConfig.textContent?.includes('GA_MEASUREMENT_ID')) {
    existingConfig.textContent = existingConfig.textContent.replace(/GA_MEASUREMENT_ID/g, gaId);
  }

  console.log('✅ [GA] Google Analytics initialized with ID:', gaId);
}

/**
 * ページビューイベントを送信
 */
export function trackPageView(path: string) {
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!gaId || typeof window === 'undefined' || !(window as any).gtag) {
    return;
  }

  (window as any).gtag('config', gaId, {
    page_path: path,
  });

  console.log('📊 [GA] Page view tracked:', path);
}

/**
 * カスタムイベントを送信
 */
export function trackEvent(eventName: string, eventParams?: Record<string, any>) {
  if (typeof window === 'undefined' || !(window as any).gtag) {
    return;
  }

  (window as any).gtag('event', eventName, eventParams);

  console.log('📊 [GA] Event tracked:', eventName, eventParams);
}
