import React from 'react';
import Card from '../components/Card';
import { TOP_HOLDERS, chainDistributionData, CONTRACT_ADDRESSES } from '../constants';
import { CopyIcon, ExternalLinkIcon, TwitterIcon, getChainLogo } from '../components/icons';
import CustomPieChart from '../components/PieChart';

const Community: React.FC = () => {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-on-surface mb-2">Community & Transparency</h1>
        <p className="text-on-surface-secondary">Building trust through open data and community engagement.</p>
      </section>
      
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
              <h2 className="text-xl font-semibold mb-4 text-on-surface">Holder Distribution by Chain</h2>
              <CustomPieChart data={chainDistributionData} dataKey="value" nameKey="name" title="" />
          </Card>
          <Card>
              <h2 className="text-xl font-semibold mb-4 text-on-surface">JPYC Official on X</h2>
               <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                      <div key={i} className="flex items-start space-x-4 p-3 bg-background rounded-lg">
                          <TwitterIcon />
                          <div>
                              <p className="font-bold text-on-surface">JPYC Official <span className="font-normal text-on-surface-secondary">@jpyc_official · {i*2}h</span></p>
                              <p className="text-on-surface mt-1">
                                  Follow us for the latest news, updates, and ecosystem highlights. Join our growing community! #JPYC
                              </p>
                          </div>
                      </div>
                  ))}
              </div>
          </Card>
      </section>

      <section>
        <Card>
          <h2 className="text-xl font-semibold mb-4 text-on-surface">Top 100 Holders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-3">Rank</th>
                  <th className="p-3">Address</th>
                  <th className="p-3">Chain</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {TOP_HOLDERS.map(holder => (
                  <tr key={holder.rank} className="border-b border-border last:border-b-0 hover:bg-background">
                    <td className="p-3 font-medium">{holder.rank}</td>
                    <td className="p-3 font-mono text-sm">{holder.address}</td>
                    <td className="p-3">
                        <div className="flex items-center gap-2">
                            {getChainLogo(holder.chain)}
                            {holder.chain}
                        </div>
                    </td>
                    <td className="p-3">{holder.quantity}</td>
                    <td className="p-3 text-primary">{holder.percentage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <section>
          <Card>
              <h2 className="text-xl font-semibold mb-4 text-on-surface">Security & Transparency</h2>
              <p className="text-on-surface-secondary mb-4">
                  Always verify contract addresses before interacting with any token. Scammers may create fake JPYC tokens. Use the official addresses below.
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