import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  Activity, 
  Cable, 
  TrendingDown, 
  ShieldCheck, 
  AlertTriangle, 
  Cpu, 
  Download, 
  Sliders, 
  CheckCircle2, 
  XCircle, 
  Layers,
  Scale,
  Split,
  RefreshCw
} from 'lucide-react';
import { 
  CalculatedLineResult, 
  DesignLineItem, 
  SupplyPhaseType 
} from '../types';
import { 
  calculateVoltageDropForLine, 
  calculateVoltageDropProjectSummary, 
  autoBalancePhases,
  STANDARD_CABLE_SIZES_MM2 
} from '../utils/voltageDropCalculator';
import { PowerLoadDistributionChart } from './PowerLoadDistributionChart';

interface SheetVoltageDropProps {
  calculatedResults: CalculatedLineResult[];
  lineItems: DesignLineItem[];
  onUpdateLineItem: (id: string, updates: Partial<DesignLineItem>) => void;
}

export const SheetVoltageDrop: React.FC<SheetVoltageDropProps> = ({
  calculatedResults,
  lineItems,
  onUpdateLineItem
}) => {
  // Global Calculation Parameters
  const [allowableDropPercent, setAllowableDropPercent] = useState<number>(3.0);
  const [powerFactorCosPhi, setPowerFactorCosPhi] = useState<number>(0.92);
  const [ambientTempC, setAmbientTempC] = useState<number>(35);
  const [insulationType, setInsulationType] = useState<'PVC' | 'XLPE'>('PVC');
  const [conductorMaterial, setConductorMaterial] = useState<'Cu' | 'Al'>('Cu');
  const [installationMethod, setInstallationMethod] = useState<'Conduit' | 'CableTray' | 'DirectBuried' | 'Air'>('Conduit');

  // Per-line manual overrides for wire size & phase assignment
  const [manualSizes, setManualSizes] = useState<Record<string, number>>({});
  const [localLinePhases, setLocalLinePhases] = useState<Record<string, 'L1' | 'L2' | 'L3' | '3P' | 'DC'>>({});
  const [localSupplyTypes, setLocalSupplyTypes] = useState<Record<string, SupplyPhaseType>>({});

  const [filterStatus, setFilterStatus] = useState<'all' | 'compliant' | 'warning' | 'L1' | 'L2' | 'L3' | '3P'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Calculate voltage drop for all lines considering phase assignment
  const voltageDropResults = useMemo(() => {
    return calculatedResults.map(res => {
      const lineId = res.item.id;
      const manualSize = manualSizes[lineId];
      const assignedPhase = localLinePhases[lineId] || res.item.assignedPhase;
      const supplyPhaseTypeOverride = localSupplyTypes[lineId] || res.item.supplyPhaseType;

      return calculateVoltageDropForLine(res, {
        allowableDropPercent,
        powerFactorCosPhi,
        ambientTempC,
        insulationType,
        conductorMaterial,
        installationMethod,
        manualOverrideSizeMm2: manualSize,
        assignedPhase,
        supplyPhaseTypeOverride
      });
    });
  }, [
    calculatedResults,
    allowableDropPercent,
    powerFactorCosPhi,
    ambientTempC,
    insulationType,
    conductorMaterial,
    installationMethod,
    manualSizes,
    localLinePhases,
    localSupplyTypes
  ]);

  // Project aggregate summary
  const summary = useMemo(() => {
    return calculateVoltageDropProjectSummary(voltageDropResults);
  }, [voltageDropResults]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return voltageDropResults.filter(row => {
      if (filterStatus === 'compliant' && !row.isOverallCompliant) return false;
      if (filterStatus === 'warning' && row.isOverallCompliant) return false;
      if (filterStatus === 'L1' && row.assignedPhase !== 'L1') return false;
      if (filterStatus === 'L2' && row.assignedPhase !== 'L2') return false;
      if (filterStatus === 'L3' && row.assignedPhase !== 'L3') return false;
      if (filterStatus === '3P' && row.assignedPhase !== '3P') return false;

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          row.zoneName.toLowerCase().includes(term) ||
          row.luminaireModel.toLowerCase().includes(term) ||
          row.selectedCableCode.toLowerCase().includes(term) ||
          row.assignedPhase.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [voltageDropResults, filterStatus, searchTerm]);

  // Handle manual size override
  const handleSizeChange = (lineId: string, sizeMm2: number) => {
    setManualSizes(prev => ({
      ...prev,
      [lineId]: sizeMm2
    }));
  };

  // Handle Phase Selection per Line
  const handlePhaseChange = (lineId: string, newPhase: 'L1' | 'L2' | 'L3' | '3P' | 'DC') => {
    setLocalLinePhases(prev => ({
      ...prev,
      [lineId]: newPhase
    }));

    let supplyType: SupplyPhaseType = '1P_220V';
    if (newPhase === '3P') supplyType = '3P_380V';
    else if (newPhase === 'DC') supplyType = 'DC_24V';
    else supplyType = '1P_220V';

    setLocalSupplyTypes(prev => ({
      ...prev,
      [lineId]: supplyType
    }));

    // Update parent state
    onUpdateLineItem(lineId, {
      assignedPhase: newPhase,
      supplyPhaseType: supplyType
    });
  };

  // Auto Phase Balancing Action (LPT Algorithm)
  const handleAutoBalance = () => {
    const balancedMap = autoBalancePhases(calculatedResults, localLinePhases);
    setLocalLinePhases(balancedMap);

    const newSupplyTypes: Record<string, SupplyPhaseType> = {};
    Object.entries(balancedMap).forEach(([id, phase]) => {
      const type: SupplyPhaseType = phase === '3P' ? '3P_380V' : (phase === 'DC' ? 'DC_24V' : '1P_220V');
      newSupplyTypes[id] = type;
      onUpdateLineItem(id, {
        assignedPhase: phase,
        supplyPhaseType: type
      });
    });
    setLocalSupplyTypes(newSupplyTypes);
  };

  // Round-Robin Phase Balancing (L1 -> L2 -> L3)
  const handleRoundRobinBalance = () => {
    const phases: Array<'L1' | 'L2' | 'L3'> = ['L1', 'L2', 'L3'];
    const newMap: Record<string, 'L1' | 'L2' | 'L3' | '3P' | 'DC'> = {};
    const newSupplyTypes: Record<string, SupplyPhaseType> = {};

    let acIndex = 0;
    calculatedResults.forEach(res => {
      const v = (res.effectiveVoltage || res.fixture?.voltage || '').toLowerCase();
      if (v.includes('380') || v.includes('3p')) {
        newMap[res.item.id] = '3P';
        newSupplyTypes[res.item.id] = '3P_380V';
      } else if (v.includes('24v') || v.includes('48v') || v.includes('12v')) {
        newMap[res.item.id] = 'DC';
        newSupplyTypes[res.item.id] = 'DC_24V';
      } else {
        const assigned = phases[acIndex % 3];
        newMap[res.item.id] = assigned;
        newSupplyTypes[res.item.id] = '1P_220V';
        acIndex++;
      }

      onUpdateLineItem(res.item.id, {
        assignedPhase: newMap[res.item.id],
        supplyPhaseType: newSupplyTypes[res.item.id]
      });
    });

    setLocalLinePhases(newMap);
    setLocalSupplyTypes(newSupplyTypes);
  };

  // Set all lines to 1-Phase 220V
  const handleSetAll1Phase = () => {
    const newMap: Record<string, 'L1' | 'L2' | 'L3' | '3P' | 'DC'> = {};
    const newSupplyTypes: Record<string, SupplyPhaseType> = {};

    calculatedResults.forEach(res => {
      const v = (res.effectiveVoltage || res.fixture?.voltage || '').toLowerCase();
      if (v.includes('24v') || v.includes('48v') || v.includes('12v')) {
        newMap[res.item.id] = 'DC';
        newSupplyTypes[res.item.id] = 'DC_24V';
      } else {
        newMap[res.item.id] = 'L1';
        newSupplyTypes[res.item.id] = '1P_220V';
      }
      onUpdateLineItem(res.item.id, {
        assignedPhase: newMap[res.item.id],
        supplyPhaseType: newSupplyTypes[res.item.id]
      });
    });

    setLocalLinePhases(newMap);
    setLocalSupplyTypes(newSupplyTypes);
  };

  // Set all AC lines to 3-Phase 380V
  const handleSetAll3Phase = () => {
    const newMap: Record<string, 'L1' | 'L2' | 'L3' | '3P' | 'DC'> = {};
    const newSupplyTypes: Record<string, SupplyPhaseType> = {};

    calculatedResults.forEach(res => {
      const v = (res.effectiveVoltage || res.fixture?.voltage || '').toLowerCase();
      if (v.includes('24v') || v.includes('48v') || v.includes('12v')) {
        newMap[res.item.id] = 'DC';
        newSupplyTypes[res.item.id] = 'DC_24V';
      } else {
        newMap[res.item.id] = '3P';
        newSupplyTypes[res.item.id] = '3P_380V';
      }
      onUpdateLineItem(res.item.id, {
        assignedPhase: newMap[res.item.id],
        supplyPhaseType: newSupplyTypes[res.item.id]
      });
    });

    setLocalLinePhases(newMap);
    setLocalSupplyTypes(newSupplyTypes);
  };

  // Reset all overrides to auto
  const handleResetAllToAuto = () => {
    setManualSizes({});
    handleAutoBalance();
  };

  // Calculate Neutral Wire current estimate (In = sqrt(I1^2 + I2^2 + I3^2 - I1*I2 - I2*I3 - I3*I1))
  const neutralCurrentA = useMemo(() => {
    const { currentL1A, currentL2A, currentL3A } = summary.phaseDistribution;
    const val = Math.sqrt(
      Math.max(0, 
        Math.pow(currentL1A, 2) + Math.pow(currentL2A, 2) + Math.pow(currentL3A, 2) - 
        (currentL1A * currentL2A) - (currentL2A * currentL3A) - (currentL3A * currentL1A)
      )
    );
    return parseFloat(val.toFixed(1));
  }, [summary.phaseDistribution]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'STT',
      'Tên Tuyến / Khu Vực',
      'Pha Cấp Nguồn',
      'Mã Đèn',
      'Số Lượng (Bộ)',
      'Công Suất Tuyến (W)',
      'Điện Áp Cấp (V)',
      'Dòng Điện Ib (A)',
      'Chiều Dài L (m)',
      'Tiết Diện Tính Smin (mm2)',
      'Tiết Diện Chuẩn Chọn S (mm2)',
      'Mã Cáp Động Lực',
      'Sụt Áp Thực Tế (V)',
      'Sụt Áp Thực Tế (%)',
      'Sụt Áp Cho Phép (%)',
      'Dòng Cho Phép Iz (A)',
      'Aptomat MCB Đề Xuất',
      'Đánh Giá TCVN'
    ];

    const rows = voltageDropResults.map((r, index) => [
      index + 1,
      `"${r.zoneName}"`,
      `"${r.assignedPhase === '3P' ? '3 Pha (380V)' : r.assignedPhase === 'DC' ? 'DC Supply' : `Pha ${r.assignedPhase}`}"`,
      `"${r.luminaireModel}"`,
      r.fixtureQuantity,
      r.totalWattageW,
      r.voltageSupply,
      r.loadCurrentA,
      r.cableLengthMeters,
      r.calculatedMinCrossSectionMm2,
      r.selectedStandardSizeMm2,
      `"${r.selectedCableCode}"`,
      r.actualVoltageDropV,
      `${r.actualVoltageDropPercent}%`,
      `${r.allowableDropPercent}%`,
      r.currentCarryingCapacityIz,
      `"${r.recommendedMCB}"`,
      r.isOverallCompliant ? 'ĐẠT CHUẨN' : 'KHÔNG ĐẠT'
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Bang_Tinh_Sut_Ap_Can_Bang_Pha_TCVN_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalACWatts = summary.phaseDistribution.pL1Watts + summary.phaseDistribution.pL2Watts + summary.phaseDistribution.pL3Watts;

  return (
    <div className="space-y-6 pb-20">
      {/* 1. TOP HERO HEADER & METRICS */}
      <div className="bg-[#111111] border border-[#262626] p-5 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-[#222222] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[11px] font-mono font-bold uppercase flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Sheet 05: Tính Sụt Áp, Chọn Cáp & Cân Bằng Pha
              </span>
              <span className="text-xs text-[#888888] font-mono">
                Tiêu Chuẩn TCVN 7114 • TCVN 7447 • IEC 60364-5-52 • IEC 61439
              </span>
            </div>
            <h2 className="text-xl font-bold text-white font-sans tracking-tight">
              Bảng Tính Sụt Áp Tuyến Dây Động Lực, Chọn Cáp TCVN & Cân Bằng Pha (Phase Balancing)
            </h2>
            <p className="text-xs text-[#999999] max-w-4xl font-sans">
              Hệ thống tự động liên kết công suất (W), chiều dài dây (m), phân pha cấp nguồn (1 Pha L1/L2/L3 hoặc 3 Pha 380V) từ Sheet 03 để tính toán dòng định mức Ib, độ sụt áp ΔU, tự động làm tròn tiết diện dây chuẩn ({STANDARD_CABLE_SIZES_MM2.join(', ')} mm²), cân bằng phân bố tải 3 pha và đề xuất Aptomat MCB.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleAutoBalance}
              className="px-3.5 py-1.5 bg-amber-950/70 hover:bg-amber-900/80 text-amber-300 text-xs font-mono font-bold border border-amber-600/60 transition-colors flex items-center gap-1.5 shadow-md"
              title="Tự động phân bổ các tuyến 1 pha vào L1, L2, L3 để giảm thiểu độ lệch pha"
            >
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              <span>⚡ Tự Động Cân Bằng Pha</span>
            </button>
            <button
              onClick={handleResetAllToAuto}
              className="px-3 py-1.5 bg-[#1C1C1C] hover:bg-[#252525] text-[#CCCCCC] text-xs font-mono border border-[#333333] transition-colors flex items-center gap-1.5"
              title="Đặt lại toàn bộ các tuyến về chế độ tự động tính theo TCVN"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tự Động Chọn Lại</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-300 text-xs font-mono font-bold border border-emerald-700/50 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất Bảng Tính (.CSV)</span>
            </button>
          </div>
        </div>

        {/* 4 Core Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
          {/* Card 1: Total Load & Current */}
          <div className="bg-[#161616] border border-[#2B2B2B] p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#888888] text-[11px] uppercase">
              <span>Tổng Công Suất & Tải</span>
              <Activity className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-amber-400">
                {summary.totalLoadKW} <span className="text-sm font-normal text-[#AAAAAA]">kW</span>
              </div>
              <div className="text-xs text-[#888888] mt-0.5 flex items-center justify-between">
                <span>Tổng Dòng Điện Ib:</span>
                <strong className="text-white">{summary.totalCurrentA} A</strong>
              </div>
            </div>
          </div>

          {/* Card 2: Total Cable Length */}
          <div className="bg-[#161616] border border-[#2B2B2B] p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#888888] text-[11px] uppercase">
              <span>Tổng Chiều Dài Cáp</span>
              <Cable className="w-4 h-4 text-[#00A3FF]" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-[#00A3FF]">
                {summary.totalCableLengthM} <span className="text-sm font-normal text-[#AAAAAA]">mét</span>
              </div>
              <div className="text-xs text-[#888888] mt-0.5 flex items-center justify-between">
                <span>Số Tuyến Đèn:</span>
                <strong className="text-white">{summary.totalLinesCount} Tuyến</strong>
              </div>
            </div>
          </div>

          {/* Card 3: Max Voltage Drop */}
          <div className="bg-[#161616] border border-[#2B2B2B] p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#888888] text-[11px] uppercase">
              <span>Độ Sụt Áp Lớn Nhất (ΔU)</span>
              <TrendingDown className={`w-4 h-4 ${summary.maxVoltageDropPercent > allowableDropPercent ? 'text-red-400' : 'text-emerald-400'}`} />
            </div>
            <div className="mt-2">
              <div className={`text-2xl font-bold ${summary.maxVoltageDropPercent > allowableDropPercent ? 'text-red-400' : 'text-emerald-400'}`}>
                {summary.maxVoltageDropPercent.toFixed(2)}%
                <span className="text-xs font-normal text-[#888888] ml-1.5">
                  (Giới hạn: &le; {allowableDropPercent}%)
                </span>
              </div>
              <div className="text-xs text-[#888888] mt-0.5 flex items-center justify-between">
                <span>Trung Bình Dự Án:</span>
                <strong className="text-white">{summary.avgVoltageDropPercent.toFixed(2)}%</strong>
              </div>
            </div>
          </div>

          {/* Card 4: Compliance Status */}
          <div className="bg-[#161616] border border-[#2B2B2B] p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#888888] text-[11px] uppercase">
              <span>Mức Độ Đạt Chuẩn TCVN</span>
              {summary.nonCompliantLinesCount === 0 ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between">
                <div className={`text-2xl font-bold ${summary.nonCompliantLinesCount === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {summary.totalLinesCount > 0 ? Math.round((summary.compliantLinesCount / summary.totalLinesCount) * 100) : 100}%
                </div>
                <span className="text-[10px] px-1.5 py-0.5 bg-[#222222] border border-[#333333] text-white">
                  {summary.compliantLinesCount}/{summary.totalLinesCount} Tuyến Đạt
                </span>
              </div>
              <div className="text-xs text-[#888888] mt-0.5">
                {summary.nonCompliantLinesCount === 0 ? (
                  <span className="text-emerald-400">Tất cả tuyến dây an toàn & đủ tải</span>
                ) : (
                  <span className="text-red-400">{summary.nonCompliantLinesCount} tuyến cần nâng tiết diện dây</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PHASE BALANCING & 3-PHASE / 1-PHASE DISTRIBUTION DASHBOARD */}
      <div className="bg-[#0D0D0D] border border-[#2A2A2A] p-5 shadow-2xl space-y-4 font-mono">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-[#222222] pb-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" />
              Bảng Phân Tích & Cân Bằng Pha Tải Chiếu Sáng (3-Phase Load Balance Analysis)
            </h3>
            <p className="text-xs text-[#888888] font-sans">
              Phân bổ công suất các lộ chiếu sáng trên 3 pha R(L1) - S(L2) - T(L3) từ tủ phân phối chiếu sáng, kiểm soát độ lệch pha theo TCVN 7447 (&le; 15%)
            </p>
          </div>

          {/* Quick System Phase Switchers */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[10px] text-[#777777] uppercase mr-1">Chế Độ Cấp Nguồn:</span>
            <button
              onClick={handleAutoBalance}
              className="px-2.5 py-1 bg-[#1A1A1A] hover:bg-[#252525] border border-amber-500/50 text-amber-300 text-[11px] flex items-center gap-1"
              title="Cân bằng thông minh tự động tối ưu hóa tải 3 pha"
            >
              <Scale className="w-3 h-3 text-amber-400" />
              Tự Động Cân Bằng (LPT)
            </button>
            <button
              onClick={handleRoundRobinBalance}
              className="px-2.5 py-1 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333333] text-[#CCCCCC] text-[11px] flex items-center gap-1"
              title="Chia đều tuần tự từng tuyến vào L1 -> L2 -> L3"
            >
              <Split className="w-3 h-3 text-blue-400" />
              Chia Đều L1-L2-L3
            </button>
            <button
              onClick={handleSetAll3Phase}
              className="px-2.5 py-1 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333333] text-[#CCCCCC] text-[11px]"
              title="Chuyển toàn bộ tuyến AC thành 3 Pha 380V"
            >
              Toàn Bộ 3P-380V
            </button>
            <button
              onClick={handleSetAll1Phase}
              className="px-2.5 py-1 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333333] text-[#CCCCCC] text-[11px]"
              title="Chuyển toàn bộ thành 1 Pha 220V (Pha L1)"
            >
              Toàn Bộ 1P-220V
            </button>
          </div>
        </div>

        {/* Phase Gauges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Phase L1 Card */}
          <div className="bg-[#141414] border border-[#262626] p-3.5 space-y-2.5 hover:border-red-500/40 transition-colors">
            <div className="flex items-center justify-between border-b border-[#202020] pb-2">
              <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse inline-block" />
                Pha L1 (Phase R - 220V)
              </span>
              <span className="text-[10px] text-[#AAAAAA] bg-[#202020] px-1.5 py-0.5 border border-[#333333]">
                {summary.phaseDistribution.linesPerPhase.L1} Tuyến 1P
              </span>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {summary.phaseDistribution.pL1Watts.toLocaleString()} <span className="text-xs text-[#888888] font-normal">W</span>
              </div>
              <div className="text-xs text-[#888888] flex items-center justify-between mt-0.5">
                <span>Dòng điện I(L1):</span>
                <strong className="text-red-300">{summary.phaseDistribution.currentL1A} A</strong>
              </div>
            </div>
            {/* Progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-[#777777]">
                <span>Tỷ lệ tải AC:</span>
                <span>{totalACWatts > 0 ? ((summary.phaseDistribution.pL1Watts / totalACWatts) * 100).toFixed(1) : 0}%</span>
              </div>
              <div className="w-full bg-[#202020] h-1.5 overflow-hidden">
                <div 
                  className="bg-red-500 h-full transition-all duration-300"
                  style={{ width: `${totalACWatts > 0 ? Math.min(100, (summary.phaseDistribution.pL1Watts / (totalACWatts / 3)) * 33.3) : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Phase L2 Card */}
          <div className="bg-[#141414] border border-[#262626] p-3.5 space-y-2.5 hover:border-yellow-500/40 transition-colors">
            <div className="flex items-center justify-between border-b border-[#202020] pb-2">
              <span className="text-xs font-bold text-yellow-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse inline-block" />
                Pha L2 (Phase S - 220V)
              </span>
              <span className="text-[10px] text-[#AAAAAA] bg-[#202020] px-1.5 py-0.5 border border-[#333333]">
                {summary.phaseDistribution.linesPerPhase.L2} Tuyến 1P
              </span>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {summary.phaseDistribution.pL2Watts.toLocaleString()} <span className="text-xs text-[#888888] font-normal">W</span>
              </div>
              <div className="text-xs text-[#888888] flex items-center justify-between mt-0.5">
                <span>Dòng điện I(L2):</span>
                <strong className="text-yellow-300">{summary.phaseDistribution.currentL2A} A</strong>
              </div>
            </div>
            {/* Progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-[#777777]">
                <span>Tỷ lệ tải AC:</span>
                <span>{totalACWatts > 0 ? ((summary.phaseDistribution.pL2Watts / totalACWatts) * 100).toFixed(1) : 0}%</span>
              </div>
              <div className="w-full bg-[#202020] h-1.5 overflow-hidden">
                <div 
                  className="bg-yellow-400 h-full transition-all duration-300"
                  style={{ width: `${totalACWatts > 0 ? Math.min(100, (summary.phaseDistribution.pL2Watts / (totalACWatts / 3)) * 33.3) : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Phase L3 Card */}
          <div className="bg-[#141414] border border-[#262626] p-3.5 space-y-2.5 hover:border-blue-500/40 transition-colors">
            <div className="flex items-center justify-between border-b border-[#202020] pb-2">
              <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse inline-block" />
                Pha L3 (Phase T - 220V)
              </span>
              <span className="text-[10px] text-[#AAAAAA] bg-[#202020] px-1.5 py-0.5 border border-[#333333]">
                {summary.phaseDistribution.linesPerPhase.L3} Tuyến 1P
              </span>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {summary.phaseDistribution.pL3Watts.toLocaleString()} <span className="text-xs text-[#888888] font-normal">W</span>
              </div>
              <div className="text-xs text-[#888888] flex items-center justify-between mt-0.5">
                <span>Dòng điện I(L3):</span>
                <strong className="text-blue-300">{summary.phaseDistribution.currentL3A} A</strong>
              </div>
            </div>
            {/* Progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-[#777777]">
                <span>Tỷ lệ tải AC:</span>
                <span>{totalACWatts > 0 ? ((summary.phaseDistribution.pL3Watts / totalACWatts) * 100).toFixed(1) : 0}%</span>
              </div>
              <div className="w-full bg-[#202020] h-1.5 overflow-hidden">
                <div 
                  className="bg-blue-500 h-full transition-all duration-300"
                  style={{ width: `${totalACWatts > 0 ? Math.min(100, (summary.phaseDistribution.pL3Watts / (totalACWatts / 3)) * 33.3) : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Phase Unbalance & Neutral Card */}
          <div className="bg-[#141414] border border-[#262626] p-3.5 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-[#202020] pb-2">
              <span className="text-xs font-bold text-[#E0E0E0] uppercase flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                Độ Lệch Pha (Unbalance)
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 border font-bold ${
                summary.phaseDistribution.unbalancePercent <= 10
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50'
                  : summary.phaseDistribution.unbalancePercent <= 15
                  ? 'bg-amber-950/60 text-amber-400 border-amber-800/50'
                  : 'bg-red-950/60 text-red-400 border-red-800/50'
              }`}>
                {summary.phaseDistribution.unbalancePercent <= 10 ? 'RẤT TỐT' : (summary.phaseDistribution.unbalancePercent <= 15 ? 'ĐẠT TCVN' : 'CẢNH BÁO')}
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold ${
                  summary.phaseDistribution.unbalancePercent <= 15 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {summary.phaseDistribution.unbalancePercent}%
                </span>
                <span className="text-[10px] text-[#777777]">
                  (Chuẩn TCVN: &le; 15%)
                </span>
              </div>
              <div className="text-xs text-[#888888] mt-1 space-y-0.5">
                <div className="flex justify-between">
                  <span>Dòng dây trung tính I(N):</span>
                  <strong className="text-white">{neutralCurrentA} A</strong>
                </div>
                <div className="flex justify-between">
                  <span>Tuyến 3 Pha / DC:</span>
                  <span className="text-[#AAAAAA]">{summary.phaseDistribution.linesPerPhase['3P']} lộ 3P • {summary.phaseDistribution.linesPerPhase.DC} lộ DC</span>
                </div>
              </div>
            </div>

            {summary.phaseDistribution.unbalancePercent > 15 && (
              <div className="text-[10px] text-red-400 bg-red-950/40 p-1.5 border border-red-900/50 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Nhấn "Tự Động Cân Bằng Pha" để tối ưu hóa phụ tải</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. SECTION 3: POWER DISTRIBUTION CHART FOR LIGHTING LINES & OVERLOAD SAFETY WARNINGS */}
      <PowerLoadDistributionChart lineResults={calculatedResults} />

      {/* 4. CALCULATION PARAMETERS & STANDARDS CONFIGURATION PANEL */}
      <div className="bg-[#0F0F0F] border border-[#222222] p-4 space-y-3 font-mono">
        <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-2">
          <span className="text-xs uppercase text-[#E0E0E0] font-bold flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            Tham Số Môi Trường & Tiêu Chuẩn Sụt Áp (TCVN / IEC 60364-5-52)
          </span>
          <span className="text-[10px] text-[#777777]">
            Tự động cập nhật dòng định mức Iz, hệ số hiệu chỉnh nhiệt độ k_temp, và sụt áp ΔU
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
          {/* Preset Standard Allowable Drop Limit */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-[#888888] uppercase">
              Sụt Áp Cho Phép (ΔU max):
            </label>
            <select
              value={allowableDropPercent}
              onChange={e => setAllowableDropPercent(parseFloat(e.target.value))}
              className="bg-[#181818] text-amber-300 font-bold px-2.5 py-1.5 border border-[#333333] focus:outline-none focus:border-amber-400"
            >
              <option value={3.0}>3.0% - TCVN Chiếu Sáng Trong Nhà</option>
              <option value={5.0}>5.0% - TCVN Chiếu Sáng Ngoài Trời / Facade</option>
              <option value={2.0}>2.0% - Tiêu Chuẩn Khắt Khe (High Spec)</option>
              <option value={4.0}>4.0% - Trung Bình</option>
              <option value={6.0}>6.0% - Tải Động Cơ / Phụ</option>
              <option value={8.0}>8.0% - Tuyến Dài Đặc Thù</option>
            </select>
          </div>

          {/* Power Factor Cos Phi */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-[#888888] uppercase">
              Hệ Số Công Suất (cos φ):
            </label>
            <select
              value={powerFactorCosPhi}
              onChange={e => setPowerFactorCosPhi(parseFloat(e.target.value))}
              className="bg-[#181818] text-[#F2F2F2] px-2.5 py-1.5 border border-[#333333] focus:outline-none focus:border-blue-400"
            >
              <option value={0.95}>0.95 (Driver LED Cao Cấp APFC)</option>
              <option value={0.92}>0.92 (Driver LED Tiêu Chuẩn TCVN)</option>
              <option value={0.90}>0.90 (Phổ Thông)</option>
              <option value={0.85}>0.85 (Driver Thường)</option>
            </select>
          </div>

          {/* Ambient Temp */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-[#888888] uppercase">
              Nhiệt Độ Môi Trường:
            </label>
            <select
              value={ambientTempC}
              onChange={e => setAmbientTempC(parseInt(e.target.value))}
              className="bg-[#181818] text-[#F2F2F2] px-2.5 py-1.5 border border-[#333333] focus:outline-none focus:border-blue-400"
            >
              <option value={30}>30°C (Tiêu chuẩn phòng lạnh)</option>
              <option value={35}>35°C (Khí hậu Việt Nam tiêu chuẩn)</option>
              <option value={40}>40°C (Ngoài trời nắng nóng / Tủ điện)</option>
              <option value={45}>45°C (Khu vực kỹ thuật nóng bức)</option>
            </select>
          </div>

          {/* Conductor Material */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-[#888888] uppercase">
              Vật Liệu Ruột Dẫn:
            </label>
            <select
              value={conductorMaterial}
              onChange={e => setConductorMaterial(e.target.value as 'Cu' | 'Al')}
              className="bg-[#181818] text-[#F2F2F2] px-2.5 py-1.5 border border-[#333333] focus:outline-none focus:border-blue-400"
            >
              <option value="Cu">Đồng (Copper - Cu)</option>
              <option value="Al">Nhôm (Aluminum - Al)</option>
            </select>
          </div>

          {/* Insulation Type */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-[#888888] uppercase">
              Vỏ Cách Điện Cáp:
            </label>
            <select
              value={insulationType}
              onChange={e => setInsulationType(e.target.value as 'PVC' | 'XLPE')}
              className="bg-[#181818] text-[#F2F2F2] px-2.5 py-1.5 border border-[#333333] focus:outline-none focus:border-blue-400"
            >
              <option value="PVC">PVC (Nhiệt độ tối đa 70°C)</option>
              <option value="XLPE">XLPE (Chịu nhiệt 90°C cao cấp)</option>
            </select>
          </div>

          {/* Installation Method */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-[#888888] uppercase">
              Phương Pháp Đi Dây:
            </label>
            <select
              value={installationMethod}
              onChange={e => setInstallationMethod(e.target.value as any)}
              className="bg-[#181818] text-[#F2F2F2] px-2.5 py-1.5 border border-[#333333] focus:outline-none focus:border-blue-400"
            >
              <option value="Conduit">Ống luồn âm tường / Conduit</option>
              <option value="CableTray">Máng cáp đục lỗ / Cable Tray</option>
              <option value="DirectBuried">Chôn ngầm trực tiếp đất</option>
              <option value="Air">Đi tự do trên không / Máng hở</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. MAIN VOLTAGE DROP & PHASE SELECTION CALCULATION TABLE */}
      <div className="bg-[#0B0B0B] border border-[#262626] shadow-2xl overflow-hidden space-y-0">
        {/* Table Filter & Search Header */}
        <div className="bg-[#141414] p-3 border-b border-[#222222] flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
          <div className="flex items-center gap-3">
            <span className="text-[#888888] uppercase font-bold">Lọc Dữ Liệu:</span>
            <div className="flex flex-wrap items-center gap-1 bg-[#0A0A0A] p-0.5 border border-[#2A2A2A]">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1 text-xs transition-colors ${
                  filterStatus === 'all' ? 'bg-[#282828] text-white font-bold' : 'text-[#888888] hover:text-white'
                }`}
              >
                Tất Cả ({voltageDropResults.length})
              </button>
              <button
                onClick={() => setFilterStatus('compliant')}
                className={`px-2.5 py-1 text-xs transition-colors ${
                  filterStatus === 'compliant' ? 'bg-emerald-950 text-emerald-300 font-bold' : 'text-[#888888] hover:text-white'
                }`}
              >
                Đạt Chuẩn ({summary.compliantLinesCount})
              </button>
              <button
                onClick={() => setFilterStatus('warning')}
                className={`px-2.5 py-1 text-xs transition-colors ${
                  filterStatus === 'warning' ? 'bg-red-950 text-red-300 font-bold' : 'text-[#888888] hover:text-white'
                }`}
              >
                Cần Tăng Tiết Diện ({summary.nonCompliantLinesCount})
              </button>
              <span className="w-[1px] h-4 bg-[#333333] mx-1" />
              <button
                onClick={() => setFilterStatus('L1')}
                className={`px-2 py-0.5 text-xs transition-colors flex items-center gap-1 ${
                  filterStatus === 'L1' ? 'bg-red-950 text-red-300 font-bold border border-red-700' : 'text-red-400/70 hover:text-red-400'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Pha L1 ({summary.phaseDistribution.linesPerPhase.L1})
              </button>
              <button
                onClick={() => setFilterStatus('L2')}
                className={`px-2 py-0.5 text-xs transition-colors flex items-center gap-1 ${
                  filterStatus === 'L2' ? 'bg-yellow-950 text-yellow-300 font-bold border border-yellow-700' : 'text-yellow-400/70 hover:text-yellow-400'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-yellow-400" />
                Pha L2 ({summary.phaseDistribution.linesPerPhase.L2})
              </button>
              <button
                onClick={() => setFilterStatus('L3')}
                className={`px-2 py-0.5 text-xs transition-colors flex items-center gap-1 ${
                  filterStatus === 'L3' ? 'bg-blue-950 text-blue-300 font-bold border border-blue-700' : 'text-blue-400/70 hover:text-blue-400'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Pha L3 ({summary.phaseDistribution.linesPerPhase.L3})
              </button>
              <button
                onClick={() => setFilterStatus('3P')}
                className={`px-2 py-0.5 text-xs transition-colors flex items-center gap-1 ${
                  filterStatus === '3P' ? 'bg-purple-950 text-purple-300 font-bold border border-purple-700' : 'text-purple-400/70 hover:text-purple-400'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                3 Pha ({summary.phaseDistribution.linesPerPhase['3P']})
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Tìm kiếm khu vực / pha / mã đèn / loại cáp..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-[#181818] text-white text-xs px-3 py-1.5 border border-[#333333] focus:outline-none focus:border-amber-400 w-64"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-[#161616] text-[#AAAAAA] border-b border-[#2B2B2B] text-[10px] uppercase font-bold tracking-wider">
                <th className="p-2.5 border-r border-[#222222] w-10 text-center">STT</th>
                <th className="p-2.5 border-r border-[#222222] min-w-[170px]">Tuyến Đèn / Khu Vực</th>
                <th className="p-2.5 border-r border-[#222222] bg-[#191919] text-amber-300 min-w-[140px]" title="Chọn phân pha L1, L2, L3 hoặc 3 Pha 380V cho tuyến">
                  Pha Cấp Nguồn (Phase)
                </th>
                <th className="p-2.5 border-r border-[#222222] min-w-[130px]">Mã Đèn & Số Lượng</th>
                <th className="p-2.5 border-r border-[#222222] text-right min-w-[100px]">Tải Tuyến (W)</th>
                <th className="p-2.5 border-r border-[#222222] text-right min-w-[85px]">Dòng Ib (A)</th>
                <th className="p-2.5 border-r border-[#222222] text-right min-w-[75px]">Dài L (m)</th>
                <th className="p-2.5 border-r border-[#222222] text-right min-w-[85px]" title="Tiết diện tối thiểu lý thuyết để thỏa mãn sụt áp">
                  S_min (mm²)
                </th>
                <th className="p-2.5 border-r border-[#222222] bg-[#1B1B1B] text-amber-300 min-w-[155px]">
                  Tiết Diện Chuẩn S (TCVN)
                </th>
                <th className="p-2.5 border-r border-[#222222] min-w-[185px]">Mã Cáp Động Lực Đề Xuất</th>
                <th className="p-2.5 border-r border-[#222222] text-right min-w-[125px]">
                  Sụt Áp ΔU (%)
                </th>
                <th className="p-2.5 border-r border-[#222222] text-right min-w-[85px]" title="Dòng điện mang tải cho phép theo điều kiện lắp đặt">
                  Iz (A)
                </th>
                <th className="p-2.5 border-r border-[#222222] min-w-[135px]">Aptomat (MCB)</th>
                <th className="p-2.5 text-center min-w-[85px]">Đánh Giá</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D1D1D] bg-[#0C0C0C]">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={14} className="p-8 text-center text-[#777777] font-sans text-xs">
                    Không có tuyến đèn nào khớp với bộ lọc hiện tại. Vui lòng kiểm tra lại cấu hình ở Sheet 03.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, index) => {
                  const isManual = Boolean(manualSizes[row.lineId]);
                  const dropProgress = Math.min(100, (row.actualVoltageDropPercent / row.allowableDropPercent) * 100);

                  return (
                    <tr
                      key={row.lineId}
                      className={`hover:bg-[#151515] transition-colors ${
                        !row.isOverallCompliant ? 'bg-red-950/15' : ''
                      }`}
                    >
                      {/* STT */}
                      <td className="p-2.5 border-r border-[#1C1C1C] text-center text-[#777777]">
                        {index + 1}
                      </td>

                      {/* Zone Name */}
                      <td className="p-2.5 border-r border-[#1C1C1C]">
                        <div className="font-bold text-white truncate max-w-[190px]" title={row.zoneName}>
                          {row.zoneName}
                        </div>
                        <div className="text-[10px] text-[#777777] flex items-center gap-1 mt-0.5">
                          <span className="px-1 bg-[#1A1A1A] border border-[#2B2B2B] text-[#AAAAAA]">
                            {row.voltageSupply}V • {row.phaseType.replace('_', ' ')}
                          </span>
                        </div>
                      </td>

                      {/* Phase Selection Dropdown */}
                      <td className="p-2 border-r border-[#1C1C1C] bg-[#121212]">
                        <select
                          value={row.assignedPhase}
                          onChange={e => handlePhaseChange(row.lineId, e.target.value as any)}
                          className={`w-full text-xs font-bold px-2 py-1 border focus:outline-none ${
                            row.assignedPhase === 'L1'
                              ? 'bg-red-950/40 text-red-300 border-red-700/60'
                              : row.assignedPhase === 'L2'
                              ? 'bg-yellow-950/40 text-yellow-300 border-yellow-700/60'
                              : row.assignedPhase === 'L3'
                              ? 'bg-blue-950/40 text-blue-300 border-blue-700/60'
                              : row.assignedPhase === '3P'
                              ? 'bg-purple-950/40 text-purple-300 border-purple-700/60'
                              : 'bg-slate-900 text-slate-300 border-slate-700'
                          }`}
                        >
                          <option value="L1">🔴 Pha L1 (R - 220V)</option>
                          <option value="L2">🟡 Pha L2 (S - 220V)</option>
                          <option value="L3">🔵 Pha L3 (T - 220V)</option>
                          <option value="3P">🟣 3 Pha (3P - 380V)</option>
                          <option value="DC">⚪ DC Supply (24/48V)</option>
                        </select>
                      </td>

                      {/* Luminaire Model & Qty */}
                      <td className="p-2.5 border-r border-[#1C1C1C]">
                        <div className="text-[#CCCCCC] truncate max-w-[150px]" title={row.luminaireModel}>
                          {row.luminaireModel}
                        </div>
                        <div className="text-[10px] text-[#888888]">
                          {row.fixtureQuantity} bộ • {row.unitWattage}W/bộ
                        </div>
                      </td>

                      {/* Total Wattage */}
                      <td className="p-2.5 border-r border-[#1C1C1C] text-right font-bold text-amber-400">
                        {row.totalWattageW.toLocaleString()} W
                      </td>

                      {/* Load Current Ib */}
                      <td className="p-2.5 border-r border-[#1C1C1C] text-right text-[#00A3FF] font-bold">
                        {row.loadCurrentA} A
                      </td>

                      {/* Cable Length L */}
                      <td className="p-2.5 border-r border-[#1C1C1C] text-right text-[#F0F0F0]">
                        {row.cableLengthMeters} m
                      </td>

                      {/* Calculated Min Cross-Section Smin */}
                      <td className="p-2.5 border-r border-[#1C1C1C] text-right text-[#888888]" title="Tiết diện tính toán lý thuyết tối thiểu">
                        {row.calculatedMinCrossSectionMm2} mm²
                      </td>

                      {/* Selected Standard Wire Size (Dropdown Selector) */}
                      <td className="p-2 border-r border-[#1C1C1C] bg-[#131313]">
                        <div className="flex items-center gap-1">
                          <select
                            value={row.selectedStandardSizeMm2}
                            onChange={e => handleSizeChange(row.lineId, parseFloat(e.target.value))}
                            className={`w-full text-xs font-bold px-2 py-1 border focus:outline-none ${
                              isManual
                                ? 'bg-amber-950/40 text-amber-300 border-amber-600/60'
                                : 'bg-[#1C1C1C] text-emerald-400 border-[#383838]'
                            }`}
                          >
                            {STANDARD_CABLE_SIZES_MM2.map(s => (
                              <option key={s} value={s}>
                                {s} mm² {s === row.selectedStandardSizeMm2 && !isManual ? '(Auto TCVN)' : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                        {isManual && (
                          <div className="text-[9px] text-amber-400 flex items-center justify-between mt-0.5">
                            <span>Chỉnh tay</span>
                            <button
                              onClick={() => {
                                const copy = { ...manualSizes };
                                delete copy[row.lineId];
                                setManualSizes(copy);
                              }}
                              className="text-[#888888] hover:text-white underline text-[8px]"
                            >
                              Tự động lại
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Cable Description */}
                      <td className="p-2.5 border-r border-[#1C1C1C]">
                        <span className="text-[#DDDDDD] text-[11px] font-sans font-medium">
                          {row.selectedCableCode}
                        </span>
                      </td>

                      {/* Actual Voltage Drop */}
                      <td className="p-2.5 border-r border-[#1C1C1C] text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span
                            className={`font-bold ${
                              row.actualVoltageDropPercent > row.allowableDropPercent
                                ? 'text-red-400'
                                : row.actualVoltageDropPercent > row.allowableDropPercent * 0.8
                                ? 'text-amber-300'
                                : 'text-emerald-400'
                            }`}
                          >
                            {row.actualVoltageDropPercent}%
                          </span>
                          <span className="text-[10px] text-[#777777]">
                            ({row.actualVoltageDropV}V)
                          </span>
                        </div>
                        {/* Progress visual */}
                        <div className="w-full bg-[#202020] h-1 mt-1 overflow-hidden">
                          <div
                            className={`h-full ${
                              row.actualVoltageDropPercent > row.allowableDropPercent
                                ? 'bg-red-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, dropProgress)}%` }}
                          />
                        </div>
                      </td>

                      {/* Iz Carrying Capacity */}
                      <td className="p-2.5 border-r border-[#1C1C1C] text-right text-[#AAAAAA]">
                        <span className="text-white font-bold">{row.currentCarryingCapacityIz}A</span>
                        <div className="text-[9px] text-[#777777]">
                          Dự phòng: +{row.safetyMarginPercent}%
                        </div>
                      </td>

                      {/* Recommended MCB */}
                      <td className="p-2.5 border-r border-[#1C1C1C]">
                        <span className="text-purple-300 text-[11px]">
                          {row.recommendedMCB}
                        </span>
                      </td>

                      {/* Compliance Status */}
                      <td className="p-2.5 text-center">
                        {row.isOverallCompliant ? (
                          <span className="px-2 py-0.5 bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 text-[10px] font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            ĐẠT
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-red-950/60 text-red-400 border border-red-800/50 text-[10px] font-bold inline-flex items-center gap-1" title="Sụt áp vượt mức cho phép hoặc dòng tải vượt quá khả năng chịu dòng của dây">
                            <XCircle className="w-3 h-3 text-red-400" />
                            VƯỢT {row.actualVoltageDropPercent}%
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. CABLE SIZING BREAKDOWN BOQ TABLE */}
      <div className="bg-[#111111] border border-[#262626] p-5 shadow-2xl space-y-4 font-mono">
        <div className="flex items-center justify-between border-b border-[#222222] pb-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Tổng Hợp Khối Lượng Dây Cáp Động Lực (Cable Sizing BOQ Schedule)
            </h3>
            <p className="text-xs text-[#888888] font-sans">
              Bảng bóc tách tổng khối lượng mét cáp phân bổ theo từng tiết diện tiêu chuẩn TCVN cho toàn bộ dự án
            </p>
          </div>
          <span className="text-xs text-amber-400 font-bold bg-amber-950/30 px-2 py-1 border border-amber-800/40">
            Tổng cộng: {summary.totalCableLengthM.toLocaleString()} mét cáp
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {summary.cableSizeBreakdown.map(item => (
            <div
              key={item.sizeMm2}
              className="bg-[#161616] border border-[#262626] p-3 space-y-2 hover:border-[#383838] transition-colors"
            >
              <div className="flex items-center justify-between border-b border-[#202020] pb-1.5">
                <span className="text-xs font-bold text-amber-400">
                  Cáp {item.sizeMm2} mm²
                </span>
                <span className="text-[10px] text-[#888888] bg-[#0A0A0A] px-1.5 py-0.5 border border-[#2B2B2B]">
                  {item.percentage}% dự án
                </span>
              </div>
              <div className="text-lg font-bold text-white">
                {item.totalLengthMeters.toLocaleString()} <span className="text-xs font-normal text-[#888888]">mét</span>
              </div>
              <div className="text-[10px] text-[#777777] truncate" title={item.cableType}>
                {item.linesCount} tuyến sử dụng • {item.cableType}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
