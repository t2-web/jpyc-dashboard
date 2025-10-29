
import React from 'react';
import Card from '../components/Card';
import { DEFI_PROTOCOLS, ECOSYSTEM_RESOURCES } from '../constants';
import { ExternalLinkIcon } from '../components/icons';

const Ecosystem: React.FC = () => {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-on-surface mb-2">エコシステム</h1>
        <p className="text-on-surface-secondary">JPYC を活用できる主要なプラットフォームとプロトコルを紹介します。</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-on-surface mb-4">DeFiプロトコル</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEFI_PROTOCOLS.map((protocol) => (
            <Card key={protocol.name} className="flex flex-col">
              <div className="flex items-center mb-4">
                <img src={protocol.logoUrl} alt={`${protocol.name} logo`} className="w-10 h-10 rounded-full mr-4" />
                <div>
                  <h3 className="text-lg font-bold text-on-surface">{protocol.name}</h3>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/20 text-primary">{protocol.category}</span>
                </div>
              </div>
              <p className="text-on-surface-secondary flex-grow">{protocol.description}</p>
              <div className="mt-4 pt-4 border-t border-border text-sm text-on-surface-secondary space-y-1">
                  <div className="flex justify-between"><span>TVL:</span><span className="font-bold text-on-surface">${protocol.tvl}</span></div>
                  {protocol.apr && <div className="flex justify-between"><span>APR:</span><span className="font-bold text-green-400">{protocol.apr}</span></div>}
              </div>
              <a href={protocol.link} target="_blank" rel="noopener noreferrer" className="w-full text-center bg-primary text-white font-bold py-2 rounded-lg mt-6 hover:bg-primary-hover transition-colors flex items-center justify-center gap-2">
                詳細を見る <ExternalLinkIcon />
              </a>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-on-surface mb-4">公式リソース・導線</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ECOSYSTEM_RESOURCES.map((resource) => (
            <Card key={resource.name} className="flex flex-col p-6">
              <div className="mb-3 text-sm font-semibold text-primary/80">{resource.category}</div>
              <h3 className="text-lg font-bold text-on-surface">{resource.name}</h3>
              <p className="text-on-surface-secondary flex-grow mt-3">{resource.description}</p>
              <a
                href={resource.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
              >
                ページを開く
                <ExternalLinkIcon />
              </a>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Ecosystem;
