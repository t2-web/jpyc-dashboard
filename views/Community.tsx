import React from 'react';
import Card from '../components/Card';
import { HOLDER_ACCOUNTS, chainDistributionData, CONTRACT_ADDRESSES } from '../constants';
import { CopyIcon, ExternalLinkIcon, TwitterIcon, getChainLogo } from '../components/icons';
import CustomPieChart from '../components/PieChart';
import { useJpycOnChainData } from '../hooks/useJpycOnChainData';

const Community: React.FC = () => {
  const { holders, isLoading, error } = useJpycOnChainData();
  const fallback = HOLDER_ACCOUNTS.map((holder) => ({
    ...holder,
    quantity: '—',
    percentage: '—',
  }));
  const dataSource = holders.length > 0 ? holders : fallback;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-on-surface mb-2">コミュニティと透明性</h1>
        <p className="text-on-surface-secondary">オープンなデータ共有とコミュニティ連携で信頼を築いています。</p>
      </section>
      
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
              <h2 className="text-xl font-semibold mb-4 text-on-surface">チェーン別保有分布</h2>
              <CustomPieChart data={chainDistributionData} dataKey="value" nameKey="name" title="" />
          </Card>
          <Card>
              <h2 className="text-xl font-semibold mb-4 text-on-surface">JPYC公式アカウント</h2>
               <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                      <div key={i} className="flex items-start space-x-4 p-3 bg-background rounded-lg">
                          <TwitterIcon />
                          <div>
                              <p className="font-bold text-on-surface">JPYC Official <span className="font-normal text-on-surface-secondary">@jpyc_official · {i*2}時間前</span></p>
                              <p className="text-on-surface mt-1">
                                  最新ニュースやエコシステム情報を発信中。フォローしてコミュニティに参加しましょう！ #JPYC
                              </p>
                          </div>
                      </div>
                  ))}
              </div>
          </Card>
      </section>

      <section>
        <Card>
          <h2 className="text-xl font-semibold mb-4 text-on-surface">上位100保有者</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-3">順位</th>
                  <th className="p-3">アドレス</th>
                  <th className="p-3">チェーン</th>
                  <th className="p-3">保有量</th>
                  <th className="p-3">総供給比率</th>
                </tr>
              </thead>
              <tbody>
                {dataSource.map(holder => {
                  const percentageLabel = holder.percentage === '—' ? '—' : `${holder.percentage}%`;
                  return (
                  <tr key={`${holder.chain}-${holder.address}`} className="border-b border-border last:border-b-0 hover:bg-background">
                    <td className="p-3 font-medium">{holder.rank}</td>
                    <td className="p-3 font-mono text-sm">
                        <span>{holder.address}</span>
                        {holder.label && <span className="block text-xs text-on-surface-secondary">{holder.label}</span>}
                    </td>
                    <td className="p-3">
                        <div className="flex items-center gap-2">
                            {getChainLogo(holder.chain)}
                            {holder.chain}
                        </div>
                    </td>
                    <td className="p-3">{holder.quantity}</td>
                    <td className="p-3 text-primary">{percentageLabel}</td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {isLoading && <p className="text-sm text-on-surface-secondary mt-4">オンチェーンデータを読み込み中です…</p>}
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </Card>
      </section>

      <section>
          <Card>
              <h2 className="text-xl font-semibold mb-4 text-on-surface">セキュリティと透明性</h2>
              <p className="text-on-surface-secondary mb-4">
                  トークンとやり取りする前に、コントラクトアドレスを必ず確認してください。JPYC を装った偽トークンが存在する場合があります。必ず以下の公式アドレスを利用しましょう。
              </p>
              <div className="space-y-3">
                  {CONTRACT_ADDRESSES.map(ca => (
                      <div key={ca.chain} className="bg-background p-3 rounded-lg flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                              {getChainLogo(ca.chain)}
                              <span className="font-bold mr-2">{ca.name} ({ca.chain})</span>
                              <span className="font-mono text-sm text-on-surface-secondary break-all">{ca.address}</span>
                          </div>
                          <div className="flex items-center">
                              <CopyIcon onClick={() => navigator.clipboard.writeText(ca.address)} />
                              <a href={ca.explorerUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLinkIcon />
                              </a>
                          </div>
                      </div>
                  ))}
              </div>
          </Card>
      </section>
    </div>
  );
};

export default Community;
