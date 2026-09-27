import React from 'react';

export type PortfolioTab = 'properties' | 'bonds';

interface PortfolioTabHeaderProps {
  readonly activeTab: PortfolioTab;
  readonly onTabChange: (tab: PortfolioTab) => void;
  readonly hasBond?: boolean;
}

export function PortfolioTabHeader({ activeTab, onTabChange, hasBond }: PortfolioTabHeaderProps): React.ReactElement {
  return (
    <div className="flex gap-2 p-1 bg-amber-900/10 rounded-xl mb-3">
      <button
        type="button"
        onClick={() => onTabChange('properties')}
        className={`flex-1 min-h-[44px] px-3 py-2 rounded-lg text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer ${
          activeTab === 'properties' ? 'bg-amber-500 text-amber-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        🏢 Bất Động Sản
      </button>
      <button
        type="button"
        onClick={() => onTabChange('bonds')}
        className={`flex-1 min-h-[44px] px-3 py-2 rounded-lg text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer ${
          activeTab === 'bonds' ? 'bg-amber-500 text-amber-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        📜 Trái Phiếu {hasBond ? '⚡' : ''}
      </button>
    </div>
  );
}
