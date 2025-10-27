import React, { useState } from 'react';
import Card from './Card';
import { ChevronDownIcon, RepeatIcon } from './icons';

const SwapWidget: React.FC = () => {
  const [fromAmount, setFromAmount] = useState('1000');
  const [toAmount, setToAmount] = useState('998.5');
  const [fromToken, setFromToken] = useState('JPYC');
  const [toToken, setToToken] = useState('USDC');

  const handleSwap = () => {
    // Mock swap logic
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    
    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  return (
    <Card className="max-w-md mx-auto relative overflow-hidden">
      <div className="opacity-50 blur-sm pointer-events-none select-none">
      <h3 className="text-lg font-semibold text-on-surface mb-4">トークンをスワップ</h3>
      <div className="space-y-4">
        {/* From Token */}
        <div className="bg-background p-4 rounded-lg">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-on-surface-secondary">送信元</span>
            <span className="text-xs text-on-surface-secondary">残高: 1,234.56</span>
          </div>
          <div className="flex justify-between items-center">
            <input 
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="bg-transparent text-2xl w-full focus:outline-none text-on-surface"
              placeholder="0.0"
            />
            <button className="flex items-center bg-surface p-2 rounded-lg">
              <span className="font-bold mr-2">{fromToken}</span>
              <ChevronDownIcon />
            </button>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
            <button onClick={handleSwap} className="p-2 bg-surface rounded-full border border-border hover:bg-background transition-colors">
                <RepeatIcon />
            </button>
        </div>

        {/* To Token */}
        <div className="bg-background p-4 rounded-lg">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-on-surface-secondary">受取先</span>
            <span className="text-xs text-on-surface-secondary">残高: 789.01</span>
          </div>
          <div className="flex justify-between items-center">
            <input 
              type="number"
              value={toAmount}
              onChange={(e) => setToAmount(e.target.value)}
              className="bg-transparent text-2xl w-full focus:outline-none text-on-surface"
              placeholder="0.0"
            />
            <button className="flex items-center bg-surface p-2 rounded-lg">
              <span className="font-bold mr-2">{toToken}</span>
              <ChevronDownIcon />
            </button>
          </div>
        </div>
      </div>

      <div className="text-xs text-on-surface-secondary mt-4 space-y-1">
        <div className="flex justify-between">
            <span>価格:</span>
            <span>1 JPYC ≈ 0.9985 USDC</span>
        </div>
        <div className="flex justify-between">
            <span>許容スリッページ:</span>
            <span>0.5%</span>
        </div>
      </div>

      <button className="w-full bg-primary text-white font-bold py-3 rounded-lg mt-6 hover:bg-primary-hover transition-colors">
        ウォレットを接続
      </button>
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="rounded-full bg-slate-900/70 px-6 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white">
          Comming Soon
        </div>
      </div>
    </Card>
  );
};

export default SwapWidget;
