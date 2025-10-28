import React from 'react';
import { type Tab } from '../types';

interface FooterProps {
  setActiveTab: (tab: Tab) => void;
}

const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">JPYC について</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              JPYCは日本円と連動するステーブルコインです。安心して理解し、使えるデジタル円を提供します。
            </p>
          </div>

          {/* Links Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">リンク</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://jpyc.co.jp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-primary transition-colors"
                >
                  JPYC 公式サイト
                </a>
              </li>
            </ul>
          </div>

          {/* Resources Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">リソース</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://docs.jpyc.jp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-primary transition-colors"
                >
                  JPYC ドキュメント
                </a>
              </li>
              <li>
                <a
                  href="https://etherscan.io/token/0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-primary transition-colors"
                >
                  Etherscan
                </a>
              </li>
              <li>
                <a
                  href="https://www.coingecko.com/ja/%E3%82%B3%E3%82%A4%E3%83%B3/jpyc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-primary transition-colors"
                >
                  CoinGecko
                </a>
              </li>
            </ul>
          </div>

          {/* Social Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">ソーシャル</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://x.com/jpyc_official"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-primary transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                  </svg>
                  X (Twitter)
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {currentYear} JPYC Portal. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <button
                onClick={() => setActiveTab('プライバシーポリシー')}
                className="text-gray-400 hover:text-primary transition-colors cursor-pointer"
              >
                プライバシーポリシー
              </button>
              <button
                onClick={() => setActiveTab('利用規約')}
                className="text-gray-400 hover:text-primary transition-colors cursor-pointer"
              >
                利用規約
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
