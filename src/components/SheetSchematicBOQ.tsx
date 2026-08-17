import React, { useState } from 'react';
import { 
  Network, 
  FileSpreadsheet, 
  Download, 
  Zap, 
  DollarSign, 
  Layers, 
  ShieldCheck, 
  ArrowRight, 
  Printer, 
  Building2, 
  Cpu, 
  Cable, 
  Server,
  Info,
  AlertTriangle,
  GitBranch,
  Activity,
  CornerDownRight
} from 'lucide-react';
import { CalculatedLineResult, BOQItem, ControllerDevice } from '../types';
import { INITIAL_CONTROLLERS as controllers } from '../data/controllersData';
import { INITIAL_SUB_CONTROLLERS as subControllers } from '../data/subControllersData';
import { formatVND } from '../utils/calculator';
import { BMSConnectionModal } from './BMSConnectionModal';

interface SheetSchematicBOQProps {
  lineResults: CalculatedLineResult[];
  boqItems: BOQItem[];
  totalCostVND: number;
  totalPowerKW: number;
  onExportExcel: () => void;
}

export const SheetSchematicBOQ: React.FC<SheetSchematicBOQProps> = ({
  lineResults,
  boqItems,
  totalCostVND,
  totalPowerKW,
  onExportExcel
}) => {
  const [activeBMSModalController, setActiveBMSModalController] = useState<{ controller: ControllerDevice; areaName: string } | null>(null);

  const totalFixturesCount = lineResults.reduce((sum, res) => sum + res.item.fixtureQuantity, 0);

  // Grouping helper: Extract main area name from zoneName
  const getAreaGroup = (zoneName: string) => {
    if (zoneName.includes(' - ')) return zoneName.split(' - ')[0].trim();
    if (zoneName.includes(': ')) return zoneName.split(': ')[0].trim();
    return zoneName.trim();
  };

  // Group line results by Area
  const areaGroupsMap = new Map<string, CalculatedLineResult[]>();
  lineResults.forEach(res => {
    const areaName = getAreaGroup(res.item.zoneName);
    if (!areaGroupsMap.has(areaName)) {
      areaGroupsMap.set(areaName, []);
    }
    areaGroupsMap.get(areaName)!.push(res);
  });

  const uniqueAreaNames = Array.from(areaGroupsMap.keys());

  return (
    <div className="space-y-6 print:p-0">
      {/* Top Header & Actions */}
      <div className="bg-[#0A0A0A] p-4 border border-[#333333] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div>
          <div className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#00A3FF] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00A3FF]"></span>
            Sheet 04 • System Schematic & Bill of Quantities
          </div>
          <h2 className="text-xl font-light italic font-serif text-[#F2F2F2] mt-0.5">
            Sơ Đồ Nguyên Lý Topo Khu Vực & Bảng Tổng Hợp Khối Lượng BOQ
          </h2>
          <p className="text-xs text-[#888888] font-sans mt-0.5">
            Mô phỏng chuỗi kết nối phần cứng từ <strong>BMS Tòa Nhà ➔ Master Controller (Phòng ĐK Server) ➔ Sub-Controllers / Tủ Tầng ➔ Đèn Facade</strong> và bảng thống kê tổng khối lượng.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-[#181818] hover:bg-[#252525] text-[#CCCCCC] hover:text-[#00A3FF] text-xs font-mono uppercase tracking-wider px-3.5 py-2 border border-[#333333] transition-colors"
          >
            <Printer className="w-4 h-4 text-[#888888]" />
            <span>In / Export PDF</span>
          </button>

          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 bg-[#00A3FF] hover:bg-[#33B5FF] text-black text-xs font-bold font-sans uppercase tracking-wider px-4 py-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Tải Bảng Excel Full (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0A0A0A] p-4 border border-[#333333] shadow-md flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono text-[#888888] font-bold tracking-wider">Tổng Công Suất Đèn</div>
            <div className="text-lg font-bold text-amber-400 font-mono mt-0.5">{totalPowerKW.toFixed(2)} kW</div>
          </div>
        </div>

        <div className="bg-[#0A0A0A] p-4 border border-[#333333] shadow-md flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono text-[#888888] font-bold tracking-wider">Dự Toán Ngân Sách BOQ</div>
            <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">{formatVND(totalCostVND)}</div>
          </div>
        </div>

        <div className="bg-[#0A0A0A] p-4 border border-[#333333] shadow-md flex items-center gap-3">
          <div className="w-10 h-10 bg-[#00A3FF]/10 border border-[#00A3FF]/30 flex items-center justify-center text-[#00A3FF] shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono text-[#888888] font-bold tracking-wider">Tổng Khu Vực & Master</div>
            <div className="text-lg font-bold text-[#00A3FF] font-mono mt-0.5">{uniqueAreaNames.length} Khu Vực ({lineResults.length} Tuyến)</div>
          </div>
        </div>

        <div className="bg-[#0A0A0A] p-4 border border-[#333333] shadow-md flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono text-[#888888] font-bold tracking-wider">Tổng Đèn Đã Cấu Hình</div>
            <div className="text-lg font-bold text-purple-400 font-mono mt-0.5">{totalFixturesCount} Đèn</div>
          </div>
        </div>
      </div>

      {/* SECTION 1: AREA-GROUPED TOPOLOGY SCHEMATIC DIAGRAMS */}
      <div className="bg-[#0A0A0A] border border-[#333333] p-5 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#333333] pb-3">
          <div>
            <h3 className="text-base font-light italic font-serif text-[#F2F2F2] flex items-center gap-2">
              <Network className="w-4 h-4 text-[#00A3FF]" />
              1. Sơ Đồ Nguyên Lý Topo Kết Nối Theo Từng Khu Vực (Area-Grouped Topology Architecture)
            </h3>
            <p className="text-xs text-[#888888] font-sans mt-0.5">
              Mỗi Khu Vực được chỉ huy bởi <strong>1 Bộ Điều Khiển Trung Tâm (Master Controller Server Room PC)</strong>, liên kết với hệ thống BMS tòa nhà qua cáp Ethernet Cat6 SFTP và phân phối tín hiệu tới các tủ tầng Sub-controllers.
            </p>
          </div>
          <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-950/40 px-2 py-1 border border-emerald-800/40">
            Native BMS Ready
          </span>
        </div>

        {uniqueAreaNames.length === 0 ? (
          <div className="text-center py-8 text-[#888888] text-xs font-sans">Chưa có dữ liệu khu vực nào để dựng sơ đồ.</div>
        ) : (
          uniqueAreaNames.map((areaName, aIdx) => {
            const areaLines = areaGroupsMap.get(areaName) || [];
            const totalAreaWatt = areaLines.reduce((sum, r) => sum + r.totalWattage, 0);
            const totalAreaFixtures = areaLines.reduce((sum, r) => sum + r.item.fixtureQuantity, 0);

            const firstLine = areaLines[0];
            const activeMasterCtrl = controllers.find(c => c.id === firstLine?.item?.controllerId) || controllers[0];
            const masterBrand = activeMasterCtrl?.brand || 'Pharos Controls';
            const subCtrlsByBrand = subControllers.filter(s =>
              s.brand.toLowerCase().includes(masterBrand.toLowerCase()) ||
              masterBrand.toLowerCase().includes(s.brand.toLowerCase())
            );

            const rawSubId = firstLine?.item?.subControllerId;
            const activeSubId = rawSubId && rawSubId !== 'none'
              ? rawSubId
              : (rawSubId === 'none' ? 'none' : (subCtrlsByBrand[0]?.id || ''));
            const isSub1Active = Boolean(activeSubId && activeSubId !== 'none');
            const currentSub = isSub1Active ? (subCtrlsByBrand.find(s => s.id === activeSubId) || null) : null;

            const activeSub2Id = firstLine?.item?.subController2Id;
            const currentSub2 = (activeSub2Id && subCtrlsByBrand.some(s => s.id === activeSub2Id))
              ? subCtrlsByBrand.find(s => s.id === activeSub2Id)
              : null;
            const isSub2Active = Boolean(activeSub2Id && currentSub2);

            const getLineParent = (item: any) => {
              return item.parentConnection || (
                item.subControllerId && item.subControllerId !== 'none' ? 'sub1' : 
                (item.subController2Id && item.subController2Id !== 'none' ? 'sub2' : 'master')
              );
            };

            const grouped = {
              master: areaLines.filter(res => getLineParent(res.item) === 'master'),
              sub1: areaLines.filter(res => getLineParent(res.item) === 'sub1'),
              sub2: areaLines.filter(res => getLineParent(res.item) === 'sub2')
            };

            const linkMode = firstLine?.item?.subControllerLinkMode || 'star';

            const masterPortsCount = activeMasterCtrl?.portsCount || 1;
            const sub1PortsCount = currentSub?.portsCount || 10;
            const sub2PortsCount = currentSub2?.portsCount || 8;
            const totalReqUniverses = areaLines.reduce((sum, r) => sum + r.universesOrLinesNeeded, 0);

            const renderBranchRow = (res: CalculatedLineResult, lIdx: number, parentType: string, parentDevice: any, localIdx: number) => {
              const item = res.item;
              let parentLabel = 'MASTER';
              let parentColorClass = 'border-[#1E293B] text-[#00A3FF] bg-[#111317]';
              if (parentType === 'sub1') {
                parentLabel = `Sub 1 • Port ${localIdx}`;
                parentColorClass = 'border-purple-500 text-purple-300 bg-purple-950/20';
              } else if (parentType === 'sub2') {
                parentLabel = `Sub 2 • Port ${localIdx}`;
                parentColorClass = 'border-indigo-500 text-indigo-300 bg-indigo-950/20';
              } else {
                parentLabel = `Master • Port ${localIdx}`;
              }

              return (
                <div
                  key={item.id}
                  className="bg-[#141414] border border-[#252525] p-3 space-y-2 hover:border-[#383838] transition-colors relative"
                >
                  {/* Top line with title & metrics summary */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#222222] pb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-[#888888] text-[9px] font-mono mr-1">
                        <CornerDownRight className="w-3.5 h-3.5 mr-0.5" />
                        <span className="bg-[#222] text-amber-400 px-1 font-bold">Port {localIdx}</span>
                      </div>
                      <span className="font-bold text-xs text-[#F2F2F2] font-sans flex items-center gap-1.5">
                        {item.zoneName}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-[#888888] font-mono font-bold">
                      <span>Cáp: <strong className="text-amber-400">{item.totalCableLengthMeters.toFixed(1)}m</strong></span>
                      <span>•</span>
                      <span>Tải: <strong className="text-purple-400">{res.totalWattage}W</strong></span>
                      <span>•</span>
                      <span>Địa chỉ: <strong className="text-[#00A3FF]">{res.totalAddresses} addrs</strong></span>
                    </div>
                  </div>

                  {/* Visual nodes cascade */}
                  <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs font-mono">
                    {/* Node 1: Origin Source (The port on the controller) */}
                    <div className={`border p-1.5 px-2 text-[9px] min-w-[120px] flex flex-col items-center ${parentColorClass}`}>
                      <span className="text-[7px] text-gray-400 font-bold uppercase tracking-wider">Cổng Truyền Tín Hiệu</span>
                      <span className="font-bold mt-0.5">{parentLabel}</span>
                      <span className="text-[7px] opacity-75">{parentDevice?.model || 'Device'}</span>
                    </div>

                    <ArrowRight className="w-3.5 h-3.5 text-[#555] shrink-0" />
                    
                    {/* Node 3: Power/Data Injector (if applicable) */}
                    {res.specialInjectorsNeededCount > 0 && (
                      <>
                        <div className="bg-amber-500/10 border-2 border-amber-500/80 p-1.5 flex flex-col items-center min-w-[120px]">
                          <span className="text-[8px] text-amber-400 font-bold uppercase">Trộn Nguồn/Signal</span>
                          <span className="font-bold text-amber-200 text-[10px] mt-0.5">{res.specialInjectorsNeededCount}x Data Enabler</span>
                          <span className="text-[7px] text-amber-400/80 truncate max-w-[110px]">{res.injectorModelName}</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      </>
                    )}

                    {/* Node 4: Signal Repeater / DMX Amplifier (if applicable) */}
                    {res.repeatersNeededCount > 0 && (
                      <>
                        <div className="bg-purple-500/10 border-2 border-purple-500/80 p-1.5 flex flex-col items-center min-w-[115px]">
                          <span className="text-[8px] text-purple-400 font-bold uppercase">
                            {res.fixture?.protocol === 'DMX512/RDM'
                              ? (res.controller?.brand?.includes('Pharos') ? 'Pharos DMX Repeater' : 'DMX Repeater')
                              : 'DALI Repeater'}
                          </span>
                          <span className="font-bold text-purple-200 text-[10px] mt-0.5">
                            {res.repeatersNeededCount}x Repeater
                          </span>
                          <span className="text-[7px] text-purple-400/80">Khuếch đại & Cách ly</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      </>
                    )}

                    {/* Node 5: Luminaire Fixture String */}
                    <div className="bg-[#181818] border-2 border-emerald-500 p-1.5 flex flex-col items-center min-w-[150px] flex-1">
                      <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-wider">Chuỗi Đèn Tải Tuyến</span>
                      <span className="font-bold text-white text-[10px] mt-0.5">
                        {item.fixtureQuantity}x {res.fixture?.model}
                      </span>
                      <span className="text-[8px] text-[#888888] truncate max-w-[180px]" title={res.exactModelCode}>
                        {res.exactModelCode || res.fixture?.name}
                      </span>
                    </div>

                    <ArrowRight className="w-3.5 h-3.5 text-[#555555] shrink-0" />

                    {/* Node 6: Line Terminator */}
                    <div className="bg-[#181818] border border-[#333333] p-1 flex flex-col items-center text-[8px] text-[#888888] font-mono">
                      <span>120Ω resistor</span>
                      <span>Cuối Tuyến</span>
                    </div>
                  </div>
                </div>
              );
            };

            return (
              <div
                key={areaName}
                className="bg-[#101010] border-2 border-[#2A2A2A] p-4 space-y-4 shadow-lg"
              >
                {/* Area Master Hub Header */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-[#161616] p-3 border border-[#2E2E2E]">
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 bg-[#00A3FF]/10 border border-[#00A3FF]/30 text-[#00A3FF]">
                      <Building2 className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="text-[10px] font-mono text-[#00A3FF] uppercase font-bold">Khu Vực 0{aIdx + 1}</div>
                      <h4 className="text-sm font-bold text-white font-sans">{areaName}</h4>
                    </div>
                  </div>

                  {/* Master Controller in Server Room info */}
                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                    <div className="bg-[#1D1D1D] px-2.5 py-1 border border-[#333333] flex items-center gap-1.5 text-[#F2F2F2]">
                      <Cpu className="w-3.5 h-3.5 text-amber-400" />
                      <span>Master: <strong className="text-amber-400">{activeMasterCtrl?.model}</strong> ({activeMasterCtrl?.brand})</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => activeMasterCtrl && setActiveBMSModalController({ controller: activeMasterCtrl, areaName })}
                      className="bg-[#00A3FF]/15 hover:bg-[#00A3FF]/30 text-[#00A3FF] border border-[#00A3FF]/40 px-2.5 py-1 text-[11px] flex items-center gap-1 transition-colors"
                      title="Xem chi tiết giao thức và loại cáp kết nối BMS tòa nhà"
                    >
                      <Cable className="w-3.5 h-3.5" />
                      <span>BMS Specs: {activeMasterCtrl?.bmsSupport?.join(', ') || 'BACnet IP'}</span>
                    </button>

                    <div className="text-[#888888] text-[11px]">
                      <span>{areaLines.length} Tuyến</span> • <span>{totalAreaFixtures} Đèn</span> • <span className="text-amber-400">{(totalAreaWatt / 1000).toFixed(2)} kW</span>
                    </div>
                  </div>
                </div>

                {/* Control Level & Transmission Architecture Flow */}
                <div className="bg-[#0A0A0A] p-3 border border-[#222222] rounded-none space-y-3">
                  <div className="text-[9px] uppercase font-mono font-bold tracking-wider text-amber-500 border-b border-[#1A1A1A] pb-1 flex items-center justify-between">
                    <span>Sơ đồ Truyền Dẫn Tín Hiệu Toàn Hệ Thống (BMS ➔ Controller Topology)</span>
                    <span className="bg-amber-950/40 text-amber-400 px-1.5 py-0.2 border border-amber-800/40 font-bold uppercase text-[8px]">
                      Kiểu kết nối: {linkMode === 'daisy-chain' ? 'Daisy-Chain (Nối Tiếp AWG)' : 'Star (Cấu Trúc Sao)'}
                    </span>
                  </div>

                  <div className="flex flex-col md:flex-row items-stretch justify-between gap-3 overflow-x-auto text-[10px] font-mono py-1">
                    {/* Node 1: Building BMS Server */}
                    <div className="bg-[#101010] border border-[#333333] p-2 flex flex-col items-center justify-center min-w-[130px] text-center shrink-0">
                      <span className="text-[#888888] text-[7px] uppercase tracking-wider font-bold">Hệ Thống Tòa Nhà</span>
                      <span className="font-bold text-emerald-400 mt-1 flex items-center gap-1 text-[11px]">
                        <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
                        BMS / SCADA Server
                      </span>
                      <span className="text-[7px] text-gray-500">BACnet IP / Modbus TCP</span>
                    </div>

                    {activeMasterCtrl?.brand?.includes('Pharos') ? (
                      <>
                        {/* BMS -> RIO 84 Link */}
                        <div className="flex flex-row md:flex-col items-center justify-center gap-1 shrink-0 px-2">
                          <ArrowRight className="w-3.5 h-3.5 text-purple-400 rotate-90 md:rotate-0" />
                          <span className="text-[7px] text-purple-400 font-bold bg-purple-950/40 px-1 border border-purple-900/30">
                            Tiếp Điểm / RS232
                          </span>
                        </div>

                        {/* RIO 84 Node */}
                        <div className="bg-[#161616] border border-purple-500 p-2 flex flex-col items-center justify-center min-w-[140px] text-center shrink-0">
                          <span className="text-purple-400 text-[7px] uppercase tracking-wider font-bold">Giao Tiếp RIO (Remote I/O)</span>
                          <span className="font-bold text-[#F2F2F2] mt-1 text-[11px]">Pharos RIO 84</span>
                          <span className="text-[7px] text-[#888888] mt-0.5">8 Inputs / 4 Relays</span>
                          <span className="text-[6.5px] bg-purple-950/60 text-purple-300 px-1 py-0.5 mt-1 border border-purple-800/40">
                            Tủ Giao Tiếp BMS
                          </span>
                        </div>

                        {/* RIO 84 -> Pharos LPC Link */}
                        <div className="flex flex-row md:flex-col items-center justify-center gap-1 shrink-0 px-2">
                          <ArrowRight className="w-3.5 h-3.5 text-emerald-500 rotate-90 md:rotate-0" />
                          <span className="text-[7px] text-emerald-500 font-bold bg-emerald-950/40 px-1 border border-emerald-900/30">
                            Cáp LAN CAT6 (PoE)
                          </span>
                        </div>
                      </>
                    ) : (activeMasterCtrl?.model?.includes('ZXP399') || activeMasterCtrl?.bmsIntegrationType === 'External Gateway') ? (
                      <>
                        {/* BMS -> ADFWeb Gateway Link */}
                        <div className="flex flex-row md:flex-col items-center justify-center gap-1 shrink-0 px-2">
                          <ArrowRight className="w-3.5 h-3.5 text-[#00A3FF] rotate-90 md:rotate-0" />
                          <span className="text-[7px] text-[#00A3FF] font-bold bg-blue-950/40 px-1 border border-blue-900/30">
                            Cáp Mạng / RS485
                          </span>
                        </div>

                        {/* 3rd Party Gateway Node (ADFWeb / Intesis) */}
                        <div className="bg-[#161616] border border-[#00A3FF] p-2 flex flex-col items-center justify-center min-w-[150px] text-center shrink-0">
                          <span className="text-[#00A3FF] text-[7px] uppercase tracking-wider font-bold">Gateway Hãng Thứ 3</span>
                          <span className="font-bold text-white mt-1 text-[11px]">ADFWeb / Intesis Gateway</span>
                          <span className="text-[7px] text-[#00A3FF] mt-0.5 font-bold">BACnet/Modbus ➔ DMX IN</span>
                          <span className="text-[6.5px] bg-blue-950/60 text-blue-300 px-1 py-0.5 mt-1 border border-blue-800/40">
                            DIN-Rail Tủ BMS / Server
                          </span>
                        </div>

                        {/* ADFWeb -> ZXP399 DMX IN Link */}
                        <div className="flex flex-row md:flex-col items-center justify-center gap-1 shrink-0 px-2">
                          <ArrowRight className="w-3.5 h-3.5 text-amber-400 rotate-90 md:rotate-0" />
                          <span className="text-[7px] text-amber-400 font-bold bg-amber-950/40 px-1 border border-amber-900/30">
                            Cáp DMX IN (Kích Hoạt Cảnh)
                          </span>
                        </div>
                      </>
                    ) : (
                      /* BMS -> Master Link */
                      <div className="flex flex-row md:flex-col items-center justify-center gap-1 shrink-0 px-2">
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-500 rotate-90 md:rotate-0" />
                        <span className="text-[7px] text-emerald-500 font-bold bg-emerald-950/40 px-1 border border-emerald-900/30">
                          {activeMasterCtrl?.bmsCableType || 'Cáp Cat6 SFTP'}
                        </span>
                      </div>
                    )}

                    {/* Node 2: Central Master Controller */}
                    <div className="bg-[#141414] border-2 border-amber-400 p-2 flex flex-col items-center justify-center min-w-[160px] text-center shrink-0">
                      <span className="text-amber-400 text-[7px] uppercase tracking-wider font-bold">Phòng ĐK Server (PC Hub)</span>
                      <span className="font-bold text-white mt-1 text-[11px]">{activeMasterCtrl?.model}</span>
                      <span className="text-[8px] text-[#888888] mt-0.5">{activeMasterCtrl?.brand}</span>
                      <span className="text-[7px] text-gray-400 mt-0.5">{masterPortsCount} Ports Direct • {activeMasterCtrl?.rackUnit}</span>
                    </div>

                    {/* Master -> Subs Link based on Link Mode */}
                    {linkMode === 'daisy-chain' ? (
                      <>
                        {/* Sequence: Master -> Sub 1 -> Sub 2 */}
                        <div className="flex flex-row md:flex-col items-center justify-center gap-1 shrink-0 px-2">
                          <ArrowRight className="w-3.5 h-3.5 text-purple-400 rotate-90 md:rotate-0" />
                          <span className="text-[7px] text-purple-400 font-bold bg-purple-950/40 px-1 border border-purple-900/30">
                            Cáp LAN Ethernet / AWG
                          </span>
                        </div>

                        {isSub1Active ? (
                          <>
                            <div className="bg-purple-950/20 border-2 border-purple-500 p-2 flex flex-col items-center justify-center min-w-[160px] text-center shrink-0">
                              <span className="text-purple-300 text-[7px] uppercase tracking-wider font-bold">Mở Rộng Sub-Node 1</span>
                              <span className="font-bold text-white mt-1 text-[11px]">{currentSub?.model}</span>
                              <span className="text-[7px] text-purple-400 mt-0.5 font-bold">+{sub1PortsCount} Ports ({currentSub?.brand})</span>
                            </div>

                            {isSub2Active && (
                              <>
                                <div className="flex flex-row md:flex-col items-center justify-center gap-1 shrink-0 px-2">
                                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400 rotate-90 md:rotate-0" />
                                  <span className="text-[7px] text-indigo-400 font-bold bg-indigo-950/40 px-1 border border-indigo-900/30">
                                    Daisy-Chain (AWG)
                                  </span>
                                </div>

                                <div className="bg-indigo-950/20 border-2 border-indigo-500 p-2 flex flex-col items-center justify-center min-w-[160px] text-center shrink-0">
                                  <span className="text-indigo-300 text-[7px] uppercase tracking-wider font-bold">Mở Rộng Sub-Node 2</span>
                                  <span className="font-bold text-white mt-1 text-[11px]">{currentSub2?.model}</span>
                                  <span className="text-[7px] text-indigo-400 mt-0.5 font-bold">+{sub2PortsCount} Ports ({currentSub2?.brand})</span>
                                </div>
                              </>
                            )}
                          </>
                        ) : (
                          <div className="p-3 border border-dashed border-[#222] flex items-center justify-center text-[#555] text-[8px] min-w-[150px]">
                            Chưa kích hoạt Sub-Controller
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {/* STAR TOPOLOGY: Both connect directly to Master via separate LAN lines */}
                        <div className="flex-1 flex flex-col justify-center gap-1.5 border-l border-[#222] pl-3 min-w-[180px]">
                          {isSub1Active && (
                            <div className="flex items-center gap-2 bg-purple-950/15 p-1 border border-purple-500/10">
                              <div className="shrink-0 font-bold text-purple-400 text-[7px] bg-purple-950/40 px-1 border border-purple-900/20">LAN 1</div>
                              <div className="truncate text-left">
                                <div className="font-bold text-purple-300 text-[9px]">{currentSub?.model} (Sub 1)</div>
                                <div className="text-[7px] text-gray-400">Ethernet sACN ➔ {sub1PortsCount} Ports</div>
                              </div>
                            </div>
                          )}

                          {isSub2Active && (
                            <div className="flex items-center gap-2 bg-indigo-950/15 p-1 border border-indigo-500/10">
                              <div className="shrink-0 font-bold text-indigo-400 text-[7px] bg-indigo-950/40 px-1 border border-indigo-900/20">LAN 2</div>
                              <div className="truncate text-left">
                                <div className="font-bold text-indigo-300 text-[9px]">{currentSub2?.model} (Sub 2)</div>
                                <div className="text-[7px] text-gray-400">Ethernet sACN ➔ {sub2PortsCount} Ports</div>
                              </div>
                            </div>
                          )}

                          {!isSub1Active && !isSub2Active && (
                            <div className="text-[#555] text-[8px] italic">Không dùng bộ điều khiển phụ (Chỉ có Cổng chính)</div>
                          )}
                        </div>
                      </>
                    )}

                    {/* Summary Capacity Block */}
                    <div className="bg-[#101010] border border-[#222] p-2 flex-1 flex flex-col justify-between min-w-[180px]">
                      <div className="flex items-center justify-between text-[#888]">
                        <span>Tuyến Đèn Khu Vực:</span>
                        <span className="font-bold text-amber-400 bg-[#1A1A1A] px-1.5 border border-amber-500/20">
                          {areaLines.length} Tuyến
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[#888] mt-0.5">
                        <span>Universe cần/có:</span>
                        <span className="font-bold text-[#00A3FF] bg-[#1A1A1A] px-1.5 border border-[#00A3FF]/20">
                          {totalReqUniverses} / {masterPortsCount + (isSub1Active ? sub1PortsCount : 0) + (isSub2Active ? sub2PortsCount : 0)} Univ
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tree-Branching Topology Chains Grouped by Parent Node */}
                <div className="space-y-3 font-sans">
                  {/* 1. MASTER GROUP BRANCHES */}
                  {grouped.master.length > 0 && (
                    <div className="border border-[#1E293B] bg-[#111317]/50 p-3 space-y-3">
                      <div className="flex items-center justify-between border-b border-[#1E293B] pb-1.5 text-[#00A3FF]">
                        <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider">
                          <GitBranch className="w-4 h-4" />
                          <span>Nhánh Cổng Chính: {activeMasterCtrl?.model} (Trực tiếp)</span>
                        </div>
                        <span className="text-[9px] font-mono bg-[#1E293B]/40 px-1.5 py-0.2 border border-[#1E293B] text-gray-300">
                          {grouped.master.length} Tuyến
                        </span>
                      </div>

                      <div className="space-y-3.5 pl-3 border-l-2 border-[#1E293B]/60">
                        {grouped.master.map((res, lIdx) => renderBranchRow(res, lIdx, 'master', activeMasterCtrl, lIdx + 1))}
                      </div>
                    </div>
                  )}

                  {/* 2. SUB1 GROUP BRANCHES */}
                  {isSub1Active && (
                    <div className="border border-[#5B21B6]/30 bg-[#161120]/50 p-3 space-y-3">
                      <div className="flex items-center justify-between border-b border-[#5B21B6]/30 pb-1.5 text-purple-300">
                        <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider">
                          <GitBranch className="w-4 h-4" />
                          <span>Nhánh Qua Sub-Controller 1: {currentSub?.model} ({currentSub?.brand})</span>
                        </div>
                        <span className="text-[9px] font-mono bg-purple-950/40 px-1.5 py-0.2 border border-purple-800/30 text-purple-200">
                          {grouped.sub1.length} Tuyến • {grouped.sub1.length} / {sub1PortsCount} Ports Khả Dụng
                        </span>
                      </div>

                      {grouped.sub1.length === 0 ? (
                        <div className="p-3 text-center text-[10px] text-[#777] italic font-mono bg-[#0D0A12] border border-[#221A30]">
                          Không có tuyến đèn nào kết nối vào Sub-Controller 1.
                        </div>
                      ) : (
                        <div className="space-y-3.5 pl-3 border-l-2 border-[#5B21B6]/40">
                          {grouped.sub1.map((res, lIdx) => renderBranchRow(res, lIdx, 'sub1', currentSub, lIdx + 1))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. SUB2 GROUP BRANCHES */}
                  {isSub2Active && (
                    <div className="border border-indigo-900/30 bg-[#111520]/50 p-3 space-y-3">
                      <div className="flex items-center justify-between border-b border-indigo-900/30 pb-1.5 text-indigo-300">
                        <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider">
                          <GitBranch className="w-4 h-4" />
                          <span>Nhánh Qua Sub-Controller 2: {currentSub2?.model} ({currentSub2?.brand})</span>
                        </div>
                        <span className="text-[9px] font-mono bg-indigo-950/40 px-1.5 py-0.2 border border-indigo-800/30 text-indigo-200">
                          {grouped.sub2.length} Tuyến • {grouped.sub2.length} / {sub2PortsCount} Ports Khả Dụng
                        </span>
                      </div>

                      {grouped.sub2.length === 0 ? (
                        <div className="p-3 text-center text-[10px] text-[#777] italic font-mono bg-[#0A0D14] border border-[#171B2B]">
                          Không có tuyến đèn nào kết nối vào Sub-Controller 2.
                        </div>
                      ) : (
                        <div className="space-y-3.5 pl-3 border-l-2 border-indigo-900/40">
                          {grouped.sub2.map((res, lIdx) => renderBranchRow(res, lIdx, 'sub2', currentSub2, lIdx + 1))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* SECTION 2: BILL OF QUANTITIES (BOQ / BOM) TABLE */}
      <div className="bg-[#0A0A0A] border border-[#333333] overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-[#333333] flex items-center justify-between">
          <div>
            <h3 className="text-base font-light italic font-serif text-[#F2F2F2] flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              2. Bảng Tổng Hợp Khối Lượng Khai Báo Báo Giá Equipment (Bill of Quantities)
            </h3>
            <p className="text-xs text-[#888888] font-sans mt-0.5">
              Tự động gom nhóm các Bộ Điều Khiển Trung Tâm theo từng Khu Vực, thiết bị điều khiển phụ, đèn chiếu sáng mặt đứng, phụ kiện trộn nguồn/data và amplifiers.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#181818] text-[#888888] text-[10px] uppercase font-mono font-bold tracking-wider border-b border-[#333333]">
                <th className="p-3 w-8 text-center">#</th>
                <th className="p-3">Phân Loại Equipment</th>
                <th className="p-3">Hãng Sản Xuất</th>
                <th className="p-3">Mã Thiết Bị (Model)</th>
                <th className="p-3 min-w-[220px]">Tên Chi Tiết Equipment</th>
                <th className="p-3 text-center">Số Lượng</th>
                <th className="p-3 text-center">Đơn Vị</th>
                <th className="p-3 text-right">Đơn Giá (VNĐ)</th>
                <th className="p-3 text-right">Thành Tiền (VNĐ)</th>
                <th className="p-3 min-w-[220px]">Ghi Chú Kỹ Thuật</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#222222] text-[#E0E0E0]">
              {boqItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-[#888888] font-sans">
                    Chưa có thiết bị nào trong danh mục BOQ.
                  </td>
                </tr>
              ) : (
                boqItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-[#141414] transition-colors border-b border-[#222222]">
                    <td className="p-3 text-center font-mono text-[#555555]">{idx + 1}</td>
                    <td className="p-3 font-semibold text-[#CCCCCC]">
                      <span className="px-2 py-0.5 text-[10px] font-mono bg-[#181818] border border-[#333333] text-[#00A3FF]">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-[#00A3FF] whitespace-nowrap font-mono">{item.brand}</td>
                    <td className="p-3 font-mono font-bold text-amber-400">{item.model}</td>
                    <td className="p-3 font-medium text-[#F2F2F2] font-sans">{item.name}</td>
                    <td className="p-3 text-center font-mono font-bold text-purple-400">{item.quantity}</td>
                    <td className="p-3 text-center text-[#888888] font-mono">{item.unit}</td>
                    <td className="p-3 text-right font-mono text-[#CCCCCC]">{formatVND(item.unitPriceVND)}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-400">{formatVND(item.totalPriceVND)}</td>
                    <td className="p-3 text-[11px] text-[#888888] font-sans leading-snug">{item.notes}</td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Total Row */}
            {boqItems.length > 0 && (
              <tfoot>
                <tr className="bg-[#111111] font-bold border-t-2 border-[#333333] text-sm font-mono">
                  <td colSpan={5} className="p-4 text-[#F2F2F2]">
                    TỔNG CỘNG DỰ TOÁN NGÂN SÁCH THIẾT BỊ HỆ THỐNG
                  </td>
                  <td className="p-4 text-center text-purple-400">
                    {boqItems.reduce((sum, i) => sum + i.quantity, 0)}
                  </td>
                  <td colSpan={2} className="p-4 text-right text-[#888888] text-xs font-sans">
                    Tổng Tải: <strong className="text-amber-400 font-mono">{totalPowerKW.toFixed(2)} kW</strong>
                  </td>
                  <td className="p-4 text-right text-emerald-400 text-base">
                    {formatVND(totalCostVND)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* BMS Modal */}
      {activeBMSModalController && (
        <BMSConnectionModal
          controller={activeBMSModalController.controller}
          areaName={activeBMSModalController.areaName}
          onClose={() => setActiveBMSModalController(null)}
        />
      )}
    </div>
  );
};
