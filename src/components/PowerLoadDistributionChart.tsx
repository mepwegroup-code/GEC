import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid, 
  Cell, 
  ReferenceLine 
} from 'recharts';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  SlidersHorizontal, 
  Zap, 
  TrendingUp, 
  Info, 
  Flame, 
  ShieldAlert, 
  ArrowUpDown,
  Layers,
  Cpu
} from 'lucide-react';
import { CalculatedLineResult } from '../types';
import { parsePhaseAndVoltage, getRecommendedMCB } from '../utils/voltageDropCalculator';

interface PowerLoadDistributionChartProps {
  lineResults: CalculatedLineResult[];
}

export const PowerLoadDistributionChart: React.FC<PowerLoadDistributionChartProps> = ({
  lineResults
}) => {
  // State for view controls
  const [viewMode, setViewMode] = useState<'zone' | 'area' | 'brand'>('zone');
  const [powerUnit, setPowerUnit] = useState<'W' | 'kW'>('W');
  const [overloadThresholdW, setOverloadThresholdW] = useState<number>(1500); // 1500W default limit for standard branch
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc' | 'original'>('desc');

  // Helper: Extract Area from Zone Name
  const getAreaGroup = (zoneName: string) => {
    if (zoneName.includes(' - ')) return zoneName.split(' - ')[0].trim();
    if (zoneName.includes(': ')) return zoneName.split(': ')[0].trim();
    return zoneName.trim();
  };

  // Prepare chart data based on view mode
  const rawChartData = useMemo(() => {
    if (viewMode === 'area') {
      // Aggregate by Area Group
      const areaMap = new Map<string, {
        name: string;
        powerW: number;
        fixtureCount: number;
        lineCount: number;
        lines: CalculatedLineResult[];
      }>();

      lineResults.forEach(res => {
        const area = getAreaGroup(res.item.zoneName);
        if (!areaMap.has(area)) {
          areaMap.set(area, {
            name: area,
            powerW: 0,
            fixtureCount: 0,
            lineCount: 0,
            lines: []
          });
        }
        const entry = areaMap.get(area)!;
        entry.powerW += res.totalWattage;
        entry.fixtureCount += res.item.fixtureQuantity;
        entry.lineCount += 1;
        entry.lines.push(res);
      });

      return Array.from(areaMap.values()).map(item => {
        const powerVal = powerUnit === 'kW' ? Number((item.powerW / 1000).toFixed(3)) : item.powerW;
        return {
          id: item.name,
          name: item.name,
          power: powerVal,
          powerW: item.powerW,
          powerKW: item.powerW / 1000,
          fixtureCount: item.fixtureCount,
          subLabel: `${item.lineCount} tuyến đèn`,
          details: `${item.lineCount} tuyến • ${item.fixtureCount} đèn`,
          status: item.powerW > overloadThresholdW * 2 ? 'critical' : (item.powerW > overloadThresholdW ? 'warning' : 'safe'),
          currentAmps: Number((item.powerW / (220 * 0.95)).toFixed(2)),
          lines: item.lines
        };
      });
    } else if (viewMode === 'brand') {
      // Aggregate by Luminaire Brand
      const brandMap = new Map<string, {
        name: string;
        powerW: number;
        fixtureCount: number;
        lineCount: number;
      }>();

      lineResults.forEach(res => {
        const brand = res.fixture?.brand || res.item.luminaireBrand || 'Khác';
        if (!brandMap.has(brand)) {
          brandMap.set(brand, {
            name: brand,
            powerW: 0,
            fixtureCount: 0,
            lineCount: 0
          });
        }
        const entry = brandMap.get(brand)!;
        entry.powerW += res.totalWattage;
        entry.fixtureCount += res.item.fixtureQuantity;
        entry.lineCount += 1;
      });

      return Array.from(brandMap.values()).map(item => {
        const powerVal = powerUnit === 'kW' ? Number((item.powerW / 1000).toFixed(3)) : item.powerW;
        return {
          id: item.name,
          name: item.name,
          power: powerVal,
          powerW: item.powerW,
          powerKW: item.powerW / 1000,
          fixtureCount: item.fixtureCount,
          subLabel: `${item.fixtureCount} đèn`,
          details: `${item.lineCount} tuyến • ${item.fixtureCount} bộ đèn`,
          status: item.powerW > overloadThresholdW * 3 ? 'warning' : 'safe',
          currentAmps: Number((item.powerW / (220 * 0.95)).toFixed(2))
        };
      });
    } else {
      // By Zone / Line Item (Default)
      return lineResults.map(res => {
        const powerVal = powerUnit === 'kW' ? Number((res.totalWattage / 1000).toFixed(3)) : res.totalWattage;
        const isOverload = res.totalWattage >= overloadThresholdW;
        const isNearLimit = res.totalWattage >= overloadThresholdW * 0.75;
        const currentAmps = Number((res.totalWattage / (220 * 0.95)).toFixed(2));
        
        const { phase } = parsePhaseAndVoltage(res.item.selectedVoltage);
        const recommendedMCB = getRecommendedMCB(currentAmps, phase);

        let recommendedCable = '3x1.5 mm² Cu/PVC/PVC';
        if (res.item.totalCableLengthMeters > 80 || currentAmps > 10) recommendedCable = '3x4.0 mm²';
        else if (res.item.totalCableLengthMeters > 45 || currentAmps > 6) recommendedCable = '3x2.5 mm²';

        return {
          id: res.item.id,
          name: res.item.zoneName,
          shortName: res.item.zoneName.length > 22 ? res.item.zoneName.slice(0, 20) + '...' : res.item.zoneName,
          power: powerVal,
          powerW: res.totalWattage,
          powerKW: res.totalWattage / 1000,
          fixtureCount: res.item.fixtureQuantity,
          fixtureModel: res.fixture?.model || res.item.luminaireId,
          unitWattage: res.effectiveWattage,
          cableLength: res.item.totalCableLengthMeters,
          currentAmps,
          recommendedMCB,
          recommendedCable,
          status: isOverload ? 'critical' : (isNearLimit ? 'warning' : 'safe'),
          warnings: res.warnings
        };
      });
    }
  }, [lineResults, viewMode, powerUnit, overloadThresholdW]);

  // Sorted chart data
  const chartData = useMemo(() => {
    const list = [...rawChartData];
    if (sortOrder === 'desc') {
      list.sort((a, b) => b.powerW - a.powerW);
    } else if (sortOrder === 'asc') {
      list.sort((a, b) => a.powerW - b.powerW);
    }
    return list;
  }, [rawChartData, sortOrder]);

  // Analytics Metrics
  const totalPowerW = useMemo(() => lineResults.reduce((sum, r) => sum + r.totalWattage, 0), [lineResults]);
  const avgZonePowerW = useMemo(() => lineResults.length ? Math.round(totalPowerW / lineResults.length) : 0, [totalPowerW, lineResults]);
  
  const overloadedZones = useMemo(() => {
    return lineResults.filter(r => r.totalWattage >= overloadThresholdW);
  }, [lineResults, overloadThresholdW]);

  const peakZone = useMemo(() => {
    if (!lineResults.length) return null;
    return [...lineResults].sort((a, b) => b.totalWattage - a.totalWattage)[0];
  }, [lineResults]);

  // 3-Phase balance distribution estimation (Simulated L1, L2, L3 load assignment)
  const phaseLoads = useMemo(() => {
    let l1 = 0;
    let l2 = 0;
    let l3 = 0;
    // Greedy round-robin by descending load for optimal phase balance
    const sorted = [...lineResults].sort((a, b) => b.totalWattage - a.totalWattage);
    sorted.forEach(line => {
      if (l1 <= l2 && l1 <= l3) {
        l1 += line.totalWattage;
      } else if (l2 <= l1 && l2 <= l3) {
        l2 += line.totalWattage;
      } else {
        l3 += line.totalWattage;
      }
    });

    const maxP = Math.max(l1, l2, l3);
    const minP = Math.min(l1, l2, l3);
    const unbalancePercent = maxP > 0 ? Number((((maxP - minP) / maxP) * 100).toFixed(1)) : 0;

    return { l1, l2, l3, unbalancePercent };
  }, [lineResults]);

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;

    return (
      <div className="bg-[#0C0C0C] border-2 border-[#333333] p-3.5 shadow-2xl rounded-none text-xs font-mono max-w-xs z-50">
        <div className="flex items-center justify-between border-b border-[#252525] pb-2 mb-2">
          <div className="font-bold text-[#F2F2F2] font-sans text-sm truncate max-w-[200px]" title={data.name}>
            {data.name}
          </div>
          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
            data.status === 'critical'
              ? 'bg-rose-950/80 text-rose-300 border border-rose-600/60'
              : data.status === 'warning'
              ? 'bg-amber-950/80 text-amber-300 border border-amber-600/60'
              : 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/60'
          }`}>
            {data.status === 'critical' ? 'Quá Tải' : (data.status === 'warning' ? 'Tải Cao' : 'An Toàn')}
          </span>
        </div>

        <div className="space-y-1.5 text-[11px]">
          <div className="flex justify-between items-center text-gray-400">
            <span>Công suất tiêu thụ:</span>
            <span className="font-bold text-amber-400 text-sm">{data.powerW} W ({data.powerKW.toFixed(2)} kW)</span>
          </div>

          <div className="flex justify-between items-center text-gray-400">
            <span>Dòng điện ước tính (220V):</span>
            <span className="font-bold text-[#00A3FF]">{data.currentAmps} A</span>
          </div>

          {data.fixtureModel && (
            <div className="flex justify-between items-center text-gray-400">
              <span>Quy cách đèn:</span>
              <span className="text-gray-200 font-sans text-[10px] truncate max-w-[150px]">{data.fixtureCount}x {data.fixtureModel} ({data.unitWattage}W)</span>
            </div>
          )}

          {data.cableLength !== undefined && (
            <div className="flex justify-between items-center text-gray-400">
              <span>Chiều dài cáp tuyến:</span>
              <span className="text-gray-200">{data.cableLength.toFixed(1)} m</span>
            </div>
          )}

          {data.recommendedMCB && (
            <div className="pt-2 border-t border-[#222222] flex justify-between items-center text-[10px]">
              <span className="text-purple-400">CB đề xuất:</span>
              <span className="font-bold text-purple-300 bg-purple-950/40 px-1.5 py-0.5 border border-purple-800/40">{data.recommendedMCB}</span>
            </div>
          )}

          {data.recommendedCable && (
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-emerald-400">Cáp đề xuất:</span>
              <span className="font-bold text-emerald-300 bg-emerald-950/40 px-1.5 py-0.5 border border-emerald-800/40">{data.recommendedCable}</span>
            </div>
          )}

          {data.status === 'critical' && (
            <div className="mt-2 p-1.5 bg-rose-950/40 border border-rose-600/50 text-[10px] text-rose-300 flex items-start gap-1 font-sans">
              <Flame className="w-3.5 h-3.5 shrink-0 text-rose-400 mt-0.5" />
              <span>Vượt ngưỡng an toàn nhánh {overloadThresholdW}W! Hãy tách tuyến hoặc tăng cỡ dây/CB.</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const thresholdDisplay = powerUnit === 'kW' ? overloadThresholdW / 1000 : overloadThresholdW;

  return (
    <div className="bg-[#0A0A0A] border border-[#333333] p-5 space-y-5 shadow-2xl print:hidden">
      {/* Header & Subtitle */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-[#2A2A2A] pb-4">
        <div>
          <div className="text-[10px] uppercase font-mono font-bold tracking-widest text-amber-400 flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Phân Tích Phụ Tải & Kiểm Soát Quá Tải Điện Tuyến (Power Load Distribution & Overload Analysis)</span>
          </div>
          <h3 className="text-lg font-light italic font-serif text-[#F2F2F2] mt-0.5">
            Biểu Đồ Phân Bổ Công Suất Tuyến Đèn & Cảnh Báo An Toàn Quá Tải Tuyến
          </h3>
          <p className="text-xs text-[#888888] font-sans mt-0.5">
            Trực quan hóa phụ tải từng tuyến theo chuẩn thiết kế điện <strong>TCVN 7114 / IEC 61439</strong>. Phát hiện sớm nguy cơ sụt áp, quá nhiệt và quá dòng trên từng lộ dây.
          </p>
        </div>

        {/* Quick Insights Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {overloadedZones.length > 0 ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/60 border border-rose-600 text-rose-300 font-mono text-xs font-bold animate-pulse">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>{overloadedZones.length} Tuyến Cảnh Báo Quá Tải (&gt;{overloadThresholdW}W)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/40 border border-emerald-700/60 text-emerald-300 font-mono text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>100% Tuyến Nằm Trong Giới Hạn An Toàn</span>
            </div>
          )}
        </div>
      </div>

      {/* Control Bar: View Modes, Unit Toggle, Threshold Selector, Sort */}
      <div className="bg-[#121212] border border-[#262626] p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        {/* Left: View Mode Selection */}
        <div className="flex items-center gap-2">
          <span className="text-[#888888] text-[11px] uppercase tracking-wider font-bold">Góc Nhìn:</span>
          <div className="flex border border-[#333333] bg-[#0A0A0A]">
            <button
              onClick={() => setViewMode('zone')}
              className={`px-3 py-1.5 text-xs transition-colors flex items-center gap-1.5 ${
                viewMode === 'zone'
                  ? 'bg-[#00A3FF] text-black font-bold'
                  : 'text-[#888888] hover:text-[#CCCCCC]'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Từng Tuyến Đèn</span>
            </button>
            <button
              onClick={() => setViewMode('area')}
              className={`px-3 py-1.5 text-xs transition-colors flex items-center gap-1.5 ${
                viewMode === 'area'
                  ? 'bg-[#00A3FF] text-black font-bold'
                  : 'text-[#888888] hover:text-[#CCCCCC]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Theo Khu Vực (Area)</span>
            </button>
            <button
              onClick={() => setViewMode('brand')}
              className={`px-3 py-1.5 text-xs transition-colors flex items-center gap-1.5 ${
                viewMode === 'brand'
                  ? 'bg-[#00A3FF] text-black font-bold'
                  : 'text-[#888888] hover:text-[#CCCCCC]'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Theo Hãng Đèn</span>
            </button>
          </div>
        </div>

        {/* Middle: Threshold Limit Setting */}
        <div className="flex items-center gap-2">
          <span className="text-[#888888] text-[11px] uppercase tracking-wider font-bold flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span>Ngưỡng Cảnh Báo:</span>
          </span>
          <select
            value={overloadThresholdW}
            onChange={(e) => setOverloadThresholdW(Number(e.target.value))}
            className="bg-[#1A1A1A] border border-[#3A3A3A] text-amber-400 px-2 py-1 text-xs focus:outline-none focus:border-amber-400"
          >
            <option value={500}>500 W (Nhánh cực nhẹ / DALI Bus / Điều khiển)</option>
            <option value={800}>800 W (Nhánh nhẹ / Dimmer 4A)</option>
            <option value={1000}>1000 W (CB 6A - Khuyên dùng tối đa 1.0 kW)</option>
            <option value={1200}>1200 W (CB 6A - 90% Tải định mức)</option>
            <option value={1500}>1500 W (CB 10A - Khuyên Dùng)</option>
            <option value={1800}>1800 W (CB 10A - 80% Tải liên tục)</option>
            <option value={2000}>2000 W (CB 16A / Dây 1.5mm²)</option>
            <option value={2500}>2500 W (CB 16A - 80% Tải liên tục / Dây 2.5mm²)</option>
            <option value={3000}>3000 W (CB 20A / Trục chính tầng)</option>
            <option value={3500}>3500 W (CB 20A - 80% Tải liên tục)</option>
            <option value={4000}>4000 W (CB 25A / Lộ công suất lớn)</option>
            <option value={4500}>4500 W (CB 25A - 80% Tải liên tục)</option>
            <option value={5000}>5000 W (CB 32A / Trục chính tủ tầng)</option>
            <option value={6000}>6000 W (CB 32A - 80% Tải liên tục)</option>
            <option value={8000}>8000 W (CB 40A / Phân phối trung tâm)</option>
            <option value={10000}>10000 W (CB 50A hoặc CB 3P / Tổng công suất lớn)</option>
          </select>
        </div>

        {/* Right: Unit & Sorting */}
        <div className="flex items-center gap-3">
          {/* Unit Toggle */}
          <div className="flex items-center border border-[#333333] bg-[#0A0A0A]">
            <button
              onClick={() => setPowerUnit('W')}
              className={`px-2.5 py-1 text-xs font-bold ${
                powerUnit === 'W' ? 'bg-amber-400 text-black' : 'text-[#888888] hover:text-[#CCCCCC]'
              }`}
            >
              W
            </button>
            <button
              onClick={() => setPowerUnit('kW')}
              className={`px-2.5 py-1 text-xs font-bold ${
                powerUnit === 'kW' ? 'bg-amber-400 text-black' : 'text-[#888888] hover:text-[#CCCCCC]'
              }`}
            >
              kW
            </button>
          </div>

          {/* Sort Order */}
          <button
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : prev === 'asc' ? 'original' : 'desc')}
            className="flex items-center gap-1 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333333] px-2.5 py-1 text-[#CCCCCC] hover:text-white transition-colors"
            title="Đổi thứ tự sắp xếp tải"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
            <span>{sortOrder === 'desc' ? 'Tải Cao ➔ Thấp' : sortOrder === 'asc' ? 'Tải Thấp ➔ Cao' : 'Mặc Định'}</span>
          </button>
        </div>
      </div>

      {/* Main Bar Chart Container */}
      <div className="bg-[#101010] border border-[#242424] p-4 relative">
        {chartData.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-[#777777] text-xs font-sans">
            <Activity className="w-8 h-8 text-[#444444] mb-2" />
            <span>Chưa có dữ liệu tuyến đèn nào để vẽ biểu đồ phụ tải. Hãy thêm tuyến ở Sheet 03.</span>
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 10, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#222222" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#666666"
                  tick={{ fill: '#888888', fontSize: 10, fontFamily: 'monospace' }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={50}
                  tickFormatter={(val: string) => val.length > 18 ? val.substring(0, 16) + '...' : val}
                />
                <YAxis
                  stroke="#666666"
                  tick={{ fill: '#888888', fontSize: 10, fontFamily: 'monospace' }}
                  unit={powerUnit === 'kW' ? ' kW' : ' W'}
                  domain={[0, (dataMax: number) => Math.max(Math.ceil(dataMax * 1.2), Math.ceil(thresholdDisplay * 1.15))]}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Reference Warning Line for Overload Threshold */}
                <ReferenceLine
                  y={thresholdDisplay}
                  stroke="#EF4444"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: `Ngưỡng Cảnh Báo (${overloadThresholdW} W)`,
                    fill: '#EF4444',
                    position: 'top',
                    fontSize: 10,
                    fontFamily: 'monospace',
                    fontWeight: 'bold'
                  }}
                />

                {/* Average Load Line */}
                <ReferenceLine
                  y={powerUnit === 'kW' ? avgZonePowerW / 1000 : avgZonePowerW}
                  stroke="#00A3FF"
                  strokeDasharray="2 2"
                  strokeWidth={1}
                  label={{
                    value: `Tải TB (${avgZonePowerW} W)`,
                    fill: '#00A3FF',
                    position: 'insideBottomRight',
                    fontSize: 9,
                    fontFamily: 'monospace'
                  }}
                />

                {/* The Bars with dynamic Color Mapping */}
                <Bar dataKey="power" name={`Công suất (${powerUnit})`} radius={[3, 3, 0, 0]}>
                  {chartData.map((entry, index) => {
                    let barColor = '#00A3FF'; // Safe blue
                    if (entry.status === 'critical') {
                      barColor = '#EF4444'; // Red for overload!
                    } else if (entry.status === 'warning') {
                      barColor = '#F59E0B'; // Amber for high load
                    } else if (entry.powerW < overloadThresholdW * 0.4) {
                      barColor = '#10B981'; // Green for light load
                    }
                    return <Cell key={`cell-${index}`} fill={barColor} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Legend / Color Code Description */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-2 border-t border-[#1F1F1F] text-[10px] font-mono text-[#888888]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[#10B981] inline-block"></span>
              <span>Tải Nhẹ (&lt;40% ngưỡng)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[#00A3FF] inline-block"></span>
              <span>Tải Chuẩn (40% - 75%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[#F59E0B] inline-block"></span>
              <span>Tải Cao (75% - 100%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[#EF4444] inline-block"></span>
              <span className="text-rose-400 font-bold">Cảnh Báo Quá Tải (&gt;{overloadThresholdW}W)</span>
            </div>
          </div>

          <div className="text-right">
            <span>Hiển thị <strong>{chartData.length}</strong> mục phân bổ tải</span>
          </div>
        </div>
      </div>

      {/* Analytical Diagnostic Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Peak Load Zone */}
        <div className="bg-[#121212] border border-[#262626] p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#888888] uppercase font-bold">
              <span>Tuyến Tải Đỉnh (Peak Zone)</span>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            {peakZone ? (
              <div className="mt-2 space-y-1">
                <div className="text-sm font-bold text-[#F2F2F2] font-sans truncate" title={peakZone.item.zoneName}>
                  {peakZone.item.zoneName}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-mono font-bold text-amber-400">{peakZone.totalWattage} W</span>
                  <span className="text-xs text-[#888888] font-mono">
                    ({((peakZone.totalWattage / (totalPowerW || 1)) * 100).toFixed(1)}% tổng tải)
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 font-mono">
                  {peakZone.item.fixtureQuantity} đèn • Dòng I ≈ {(peakZone.totalWattage / (220 * 0.95)).toFixed(1)}A
                </div>
              </div>
            ) : (
              <div className="text-xs text-[#666666] mt-2">Chưa có dữ liệu</div>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-[#222222] text-[10px] text-gray-400 flex items-center justify-between font-mono">
            <span>CB đề xuất cho đỉnh:</span>
            <span className="text-purple-400 font-bold bg-purple-950/30 px-1.5 py-0.5 border border-purple-800" title="Tính bằng 1.25 lần dòng định mức để vận hành liên tục">
              {peakZone ? (() => {
                const currentAmps = peakZone.totalWattage / (220 * 0.95);
                const { phase } = parsePhaseAndVoltage(peakZone.item.selectedVoltage);
                return getRecommendedMCB(currentAmps, phase);
              })() : 'N/A'}
            </span>
          </div>
        </div>

        {/* Card 2: Average & Load Density */}
        <div className="bg-[#121212] border border-[#262626] p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#888888] uppercase font-bold">
              <span>Tải Trung Bình Mỗi Tuyến</span>
              <TrendingUp className="w-4 h-4 text-[#00A3FF]" />
            </div>
            <div className="mt-2 space-y-1">
              <div className="text-lg font-mono font-bold text-[#00A3FF]">{avgZonePowerW} W / Tuyến</div>
              <p className="text-[11px] text-[#888888] font-sans">
                Tổng công suất: <strong className="text-gray-200 font-mono">{(totalPowerW / 1000).toFixed(2)} kW</strong> trên <strong className="text-gray-200 font-mono">{lineResults.length}</strong> tuyến đèn.
              </p>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#222222] text-[10px] text-gray-400 flex items-center justify-between font-mono">
            <span>Dòng tải TB / tuyến:</span>
            <span className="text-[#00A3FF] font-bold">
              {(avgZonePowerW / (220 * 0.95)).toFixed(2)} A (Điện áp 220V)
            </span>
          </div>
        </div>

        {/* Card 3: 3-Phase R-S-T Balancing Estimation */}
        <div className="bg-[#121212] border border-[#262626] p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#888888] uppercase font-bold">
              <span>Phân Bổ Cân Bằng 3 Pha (R-S-T)</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="mt-2 grid grid-cols-3 gap-1.5 text-center font-mono text-[10px]">
              <div className="bg-[#1A1A1A] p-1.5 border border-red-900/40">
                <div className="text-red-400 font-bold">Pha R (L1)</div>
                <div className="font-bold text-white mt-0.5">{(phaseLoads.l1 / 1000).toFixed(2)}kW</div>
              </div>
              <div className="bg-[#1A1A1A] p-1.5 border border-yellow-900/40">
                <div className="text-yellow-400 font-bold">Pha S (L2)</div>
                <div className="font-bold text-white mt-0.5">{(phaseLoads.l2 / 1000).toFixed(2)}kW</div>
              </div>
              <div className="bg-[#1A1A1A] p-1.5 border border-blue-900/40">
                <div className="text-blue-400 font-bold">Pha T (L3)</div>
                <div className="font-bold text-white mt-0.5">{(phaseLoads.l3 / 1000).toFixed(2)}kW</div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#222222] text-[10px] text-gray-400 flex items-center justify-between font-mono">
            <span>Độ Lệch Pha Dự Kiến:</span>
            <span className={`font-bold px-1.5 py-0.2 ${
              phaseLoads.unbalancePercent > 15
                ? 'text-rose-400 bg-rose-950/30 border border-rose-800'
                : 'text-emerald-400 bg-emerald-950/30 border border-emerald-800'
            }`}>
              {phaseLoads.unbalancePercent}% {phaseLoads.unbalancePercent <= 15 ? '(Rất Tốt < 15%)' : '(Cần Điều Chỉnh)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
