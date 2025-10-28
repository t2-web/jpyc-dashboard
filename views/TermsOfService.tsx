import React from 'react';
import Card from '../components/Card';

const TermsOfService: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">利用規約</h1>

      <Card className="prose prose-slate max-w-none">
        <div className="space-y-6 p-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">第1条（適用）</h2>
            <p className="text-on-surface-secondary leading-relaxed">
              本利用規約（以下「本規約」）は、JPYC Portal（以下「当サイト」）が提供するサービス（以下「本サービス」）の利用条件を定めるものです。ユーザーの皆様（以下「ユーザー」）には、本規約に従って、本サービスをご利用いただきます。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">第2条（定義）</h2>
            <p className="text-on-surface-secondary leading-relaxed mb-3">
              本規約において使用する用語の定義は、以下のとおりとします。
            </p>
            <ul className="list-decimal list-inside space-y-2 text-on-surface-secondary ml-4">
              <li>「本サービス」とは、当サイトが提供するJPYC（日本円ステーブルコイン）に関する情報提供サービスを意味します。</li>
              <li>「ユーザー」とは、本サービスを利用する全ての方を意味します。</li>
              <li>「知的財産権」とは、著作権、特許権、実用新案権、意匠権、商標権その他の知的財産権（それらの権利を取得し、またはそれらの権利につき登録等を出願する権利を含みます。）を意味します。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">第3条（本サービスの内容）</h2>
            <p className="text-on-surface-secondary leading-relaxed mb-3">
              本サービスは、以下の情報を提供します：
            </p>
            <ul className="list-disc list-inside space-y-2 text-on-surface-secondary ml-4">
              <li>JPYCの価格情報及び市場データ</li>
              <li>JPYCの総供給量及び保有者数等のオンチェーンデータ</li>
              <li>JPYCのエコシステム情報</li>
              <li>JPYCに関する最新情報及びアナウンス</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">第4条（免責事項）</h2>
            <div className="space-y-4 text-on-surface-secondary leading-relaxed">
              <p>
                1. 当サイトは、本サービスを通じて提供される情報の正確性、完全性、有用性、最新性等について、いかなる保証も行いません。
              </p>
              <p>
                2. 本サービスで提供される情報は、投資助言や金融商品の勧誘を目的としたものではありません。投資判断はユーザー自身の責任で行ってください。
              </p>
              <p>
                3. 当サイトは、本サービスの利用により生じたユーザーの損害について、当サイトに故意または重過失がある場合を除き、一切の責任を負いません。
              </p>
              <p>
                4. 当サイトは、外部サイトへのリンクを含む場合がありますが、リンク先のサイトの内容について一切の責任を負いません。
              </p>
              <p>
                5. 本サービスで表示される価格情報やデータは、第三者のAPIから取得したものであり、遅延や誤差が生じる可能性があります。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">第5条（知的財産権）</h2>
            <p className="text-on-surface-secondary leading-relaxed">
              本サービスに関する知的財産権は全て当サイト又は当サイトにライセンスを許諾している者に帰属しており、本規約に基づく本サービスの利用許諾は、本サービスに関する当サイト又は当サイトにライセンスを許諾している者の知的財産権の使用許諾を意味するものではありません。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">第6条（禁止事項）</h2>
            <p className="text-on-surface-secondary leading-relaxed mb-3">
              ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
            </p>
            <ul className="list-disc list-inside space-y-2 text-on-surface-secondary ml-4">
              <li>法令または公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>当サイト、本サービスの他のユーザー、または第三者の知的財産権、肖像権、プライバシー、名誉その他の権利または利益を侵害する行為</li>
              <li>本サービスのネットワークまたはシステム等に過度な負荷をかける行為</li>
              <li>本サービスの運営を妨害するおそれのある行為</li>
              <li>不正アクセスをし、またはこれを試みる行為</li>
              <li>本サービスを通じて提供される情報を改ざんまたは消去する行為</li>
              <li>その他、当サイトが不適切と判断する行為</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">第7条（本サービスの提供の停止等）</h2>
            <p className="text-on-surface-secondary leading-relaxed mb-3">
              当サイトは、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
            </p>
            <ul className="list-disc list-inside space-y-2 text-on-surface-secondary ml-4">
              <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
              <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
              <li>コンピュータまたは通信回線等が事故により停止した場合</li>
              <li>その他、当サイトが本サービスの提供が困難と判断した場合</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">第8条（利用規約の変更）</h2>
            <p className="text-on-surface-secondary leading-relaxed">
              当サイトは、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。変更後の本規約は、当サイトに掲載した時点で効力を生じるものとします。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">第9条（個人情報の取扱い）</h2>
            <p className="text-on-surface-secondary leading-relaxed">
              当サイトは、本サービスの利用によって取得する個人情報については、当サイトの「プライバシーポリシー」に従い適切に取り扱うものとします。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">第10条（準拠法・裁判管轄）</h2>
            <p className="text-on-surface-secondary leading-relaxed mb-3">
              本規約の解釈にあたっては、日本法を準拠法とします。
            </p>
            <p className="text-on-surface-secondary leading-relaxed">
              本サービスに関して紛争が生じた場合には、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">第11条（お問い合わせ）</h2>
            <p className="text-on-surface-secondary leading-relaxed">
              本規約に関するお問い合わせは、<a href="https://jpyc.co.jp/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">JPYC公式サイト</a>のお問い合わせフォームよりご連絡ください。
            </p>
          </section>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-on-surface-secondary">
              制定日: {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TermsOfService;
