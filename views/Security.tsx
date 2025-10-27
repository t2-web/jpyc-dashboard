import React from 'react';
import Card from '../components/Card';
import { CONTRACT_ADDRESSES, SCAM_CONTRACTS, SCAM_REPORT_FORM_URL } from '../constants';
import { CopyIcon, ExternalLinkIcon, getChainLogo } from '../components/icons';

const Security: React.FC = () => {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-on-surface mb-2">セキュリティセンター</h1>
        <p className="text-on-surface-secondary">
          JPYC を安全に利用するための公式コントラクト情報や、過去に報告された詐欺事例をまとめています。疑わしいコントラクトを見つけた場合は、下記フォームからご連絡ください。
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <a
            href={SCAM_REPORT_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
          >
            詐欺コントラクトを報告する
            <ExternalLinkIcon />
          </a>
          <a
            href="mailto:security@jpyc.co.jp"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary px-5 py-3 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
          >
            緊急連絡: security@jpyc.co.jp
          </a>
        </div>
      </section>

      <section>
        <Card>
          <h2 className="text-xl font-semibold mb-4 text-on-surface">公式コントラクトアドレス</h2>
          <p className="text-on-surface-secondary text-sm mb-4">
            下記は各チェーンで運用している JPYC の公式アドレスです。必ずこの一覧と照合してからトランザクションを実行してください。
          </p>
          <div className="space-y-3">
            {CONTRACT_ADDRESSES.map((ca) => (
              <div key={ca.chain} className="bg-background p-3 rounded-lg flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {getChainLogo(ca.chain)}
                  <span className="font-bold mr-2">{ca.name} ({ca.chain})</span>
                  <span className="font-mono text-sm text-on-surface-secondary break-all">{ca.address}</span>
                </div>
                <div className="flex items-center">
                  <CopyIcon onClick={() => navigator.clipboard.writeText(ca.address)} />
                  <a href={ca.explorerUrl} target="_blank" rel="noopener noreferrer" className="ml-2">
                    <ExternalLinkIcon />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section>
        <Card>
          <h2 className="text-xl font-semibold mb-4 text-on-surface">報告済みの詐欺コントラクト</h2>
          <p className="text-on-surface-secondary text-sm mb-4">
            過去に報告された JPYC を装う偽コントラクトの記録です。状況は随時更新しているため、怪しいアドレスを見つけた際は必ず最新情報を確認してください。
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-3">名称</th>
                  <th className="p-3">チェーン</th>
                  <th className="p-3">アドレス</th>
                  <th className="p-3">報告日</th>
                  <th className="p-3">ステータス</th>
                  <th className="p-3">備考</th>
                </tr>
              </thead>
              <tbody>
                {SCAM_CONTRACTS.map((scam) => (
                  <tr key={scam.address} className="border-b border-border last:border-b-0 hover:bg-background">
                    <td className="p-3 font-medium text-on-surface">{scam.name}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getChainLogo(scam.chain)}
                        {scam.chain}
                      </div>
                    </td>
                    <td className="p-3 font-mono text-xs break-all">{scam.address}</td>
                    <td className="p-3">{scam.reportedAt}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {scam.status}
                      </span>
                    </td>
                    <td className="p-3 text-on-surface-secondary">{scam.note ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default Security;
