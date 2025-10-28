import React from 'react';
import Card from '../components/Card';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">プライバシーポリシー</h1>

      <Card className="prose prose-slate max-w-none">
        <div className="space-y-6 p-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. はじめに</h2>
            <p className="text-on-surface-secondary leading-relaxed">
              JPYC Portal（以下「当サイト」）は、ユーザーの個人情報の重要性を認識し、個人情報の保護に関する法律（個人情報保護法）を遵守するとともに、以下のプライバシーポリシー（以下「本ポリシー」）に従って、適切な取扱い及び保護に努めます。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. 収集する情報</h2>
            <p className="text-on-surface-secondary leading-relaxed mb-3">
              当サイトでは、以下の情報を収集する場合があります：
            </p>
            <ul className="list-disc list-inside space-y-2 text-on-surface-secondary ml-4">
              <li>アクセスログ情報（IPアドレス、ブラウザの種類、アクセス日時等）</li>
              <li>Cookie及び類似技術により取得される情報</li>
              <li>Google Analyticsによる匿名化された利用統計情報</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. 情報の利用目的</h2>
            <p className="text-on-surface-secondary leading-relaxed mb-3">
              収集した情報は、以下の目的で利用されます：
            </p>
            <ul className="list-disc list-inside space-y-2 text-on-surface-secondary ml-4">
              <li>当サイトのサービス提供及び運営管理</li>
              <li>当サイトの利用状況の分析及びサービス改善</li>
              <li>不正アクセスやスパム行為等の防止</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Cookie（クッキー）について</h2>
            <p className="text-on-surface-secondary leading-relaxed mb-3">
              当サイトでは、ユーザーの利便性向上及びサービス改善のため、Cookieを使用しています。Cookieとは、ウェブサイトがユーザーのコンピュータに一時的にデータを保存する仕組みです。
            </p>
            <p className="text-on-surface-secondary leading-relaxed mb-3">
              ユーザーはブラウザの設定によりCookieの受け取りを拒否することができますが、その場合、当サイトの一部機能が正常に動作しない可能性があります。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Google Analyticsの利用について</h2>
            <p className="text-on-surface-secondary leading-relaxed mb-3">
              当サイトでは、サイトの利用状況を把握するため、Google Analyticsを利用しています。Google Analyticsは、Cookieを使用してユーザーの情報を収集します。この情報は匿名で収集されており、個人を特定するものではありません。
            </p>
            <p className="text-on-surface-secondary leading-relaxed">
              Google Analyticsの利用規約及びプライバシーポリシーについては、<a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Googleのサイト</a>をご確認ください。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. 外部サービスの利用</h2>
            <p className="text-on-surface-secondary leading-relaxed mb-3">
              当サイトでは、以下の外部サービスを利用しています：
            </p>
            <ul className="list-disc list-inside space-y-2 text-on-surface-secondary ml-4">
              <li><strong>CoinGecko API</strong>: 暗号資産価格情報の取得</li>
              <li><strong>Moralis API</strong>: ブロックチェーンデータの取得</li>
              <li><strong>Etherscan/PolygonScan/Snowtrace API</strong>: オンチェーンデータの取得</li>
              <li><strong>X (Twitter)</strong>: タイムライン埋め込み表示</li>
            </ul>
            <p className="text-on-surface-secondary leading-relaxed mt-3">
              これらのサービスの利用に際しては、各サービスのプライバシーポリシーが適用されます。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. 個人情報の第三者提供</h2>
            <p className="text-on-surface-secondary leading-relaxed">
              当サイトは、法令に基づく場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. 個人情報の管理</h2>
            <p className="text-on-surface-secondary leading-relaxed">
              当サイトは、個人情報への不正アクセス、紛失、破壊、改ざん及び漏洩等を防止するため、適切な安全管理措置を講じます。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. プライバシーポリシーの変更</h2>
            <p className="text-on-surface-secondary leading-relaxed">
              当サイトは、必要に応じて本ポリシーを変更することがあります。変更後のプライバシーポリシーは、当サイトに掲載した時点で効力を生じるものとします。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. お問い合わせ</h2>
            <p className="text-on-surface-secondary leading-relaxed">
              本ポリシーに関するお問い合わせは、<a href="https://jpyc.co.jp/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">JPYC公式サイト</a>のお問い合わせフォームよりご連絡ください。
            </p>
          </section>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-on-surface-secondary">
              最終更新日: {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PrivacyPolicy;
