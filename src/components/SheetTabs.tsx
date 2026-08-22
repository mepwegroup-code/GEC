import React from 'react';
import { Cpu, Lightbulb, Calculator, Network, Zap, Sparkles } from 'lucide-react';

interface SheetTabsProps {
  activeTab: number;
  setActiveTab: (tab: number) => void;
  designLinesCount: number;
}

export const SheetTabs: React.FC<SheetTabsProps> = ({
  activeTab,
  setActiveTab,
  designLinesCount
}) => {
  const tabs = [
    {
      id: 1,
      sheetNum: 'Sheet 01',
      name: 'Controllers & Gateways',
      shortName: 'Controllers',
      icon: Cpu,
      color: 'text-[#00A3FF]',
      badge: 'DALI / DMX / BMS'
    },
    {
      id: 2,
      sheetNum: 'Sheet 02',
      name: 'Luminaires Catalog',
      shortName: 'Luminaires',
      icon: Lightbulb,
      color: 'text-amber-400',
      badge: 'Signify / ERCO / iGuzzini'
    },
    {
      id: 3,
      sheetNum: 'Sheet 03',
      name: 'System Configurator',
      shortName: 'Configurator',
      icon: Calculator,
      color: 'text-[#00A3FF]',
      badge: `${designLinesCount} Lines Active`
    },
    {
      id: 4,
      sheetNum: 'Sheet 04',
      name: 'Topology & BOQ Summary',
      shortName: 'BOQ & Topology',
      icon: Network,
      color: 'text-purple-400',
      badge: 'BOM & Schematic'
    },
    {
      id: 5,
      sheetNum: 'Sheet 05',
      name: 'Tính Sụt Áp & Cáp TCVN',
      shortName: 'Sụt Áp TCVN',
      icon: Zap,
      color: 'text-amber-400',
      badge: 'TCVN 7114 / IEC 61439'
    },
    {
      id: 6,
      sheetNum: 'Sheet 06',
      name: 'Kiểm Tra Chéo & AI Agent',
      shortName: 'AI Cross-Check',
      icon: Sparkles,
      color: 'text-emerald-400',
      badge: 'AI QA/QC & Audit'
    }
  ];

  return (
    <nav className="bg-[var(--bg-card)] border-b border-[var(--border-color)] px-4 pt-3">
      <div className="max-w-7xl mx-auto flex overflow-x-auto space-x-2 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-start px-4 py-2.5 transition-all whitespace-nowrap border-b-2 text-left group ${
                isActive
                  ? 'bg-[var(--bg-card-hover)] border-[var(--primary)] text-[var(--text-main)]'
                  : 'bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`text-[9px] uppercase font-mono font-bold tracking-widest ${
                    isActive
                      ? (tab.id === 6 ? 'text-emerald-400' : (tab.id === 5 ? 'text-amber-400' : 'text-[#00A3FF]'))
                      : 'text-[#666666] group-hover:text-[#999999]'
                  }`}
                >
                  {tab.sheetNum}
                </span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                    isActive
                      ? (tab.id === 6 ? 'bg-emerald-500/20 text-emerald-300' : (tab.id === 5 ? 'bg-amber-500/20 text-amber-300' : 'bg-[#00A3FF]/20 text-[#00A3FF]'))
                      : 'bg-[#181818] text-[#666666]'
                  }`}
                >
                  {tab.badge}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? tab.color : 'text-[#666666] group-hover:text-[#999999]'
                  }`}
                />
                <span className="hidden md:inline text-xs sm:text-sm font-semibold tracking-tight font-sans">
                  {tab.name}
                </span>
                <span className="inline md:hidden text-xs font-semibold font-sans">
                  {tab.shortName}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
