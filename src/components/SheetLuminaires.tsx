import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, ArrowUpDown, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import { LuminaireFixture } from '../types';
import { formatVND } from '../utils/calculator';

interface SheetLuminairesProps {
  luminaires: LuminaireFixture[];
  onOpenAddModal: () => void;
}

export const SheetLuminaires: React.FC<SheetLuminairesProps> = ({
  luminaires,
  onOpenAddModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [selectedProtocol, setSelectedProtocol] = useState<string>('ALL');
  const [sortField, setSortField] = useState<keyof LuminaireFixture>('brand');
  const [sortAsc, setSortAsc] = useState(true);

  // Extract unique brands
  const brands = useMemo(() => {
    const list = Array.from(new Set(luminaires.map(l => l.brand)));
    return ['ALL', ...list];
  }, [luminaires]);

  // Extract unique protocols
  const protocols = useMemo(() => {
    const list = Array.from(new Set(luminaires.map(l => l.protocol)));
    return ['ALL', ...list];
  }, [luminaires]);

  // Filtered & Sorted luminaires
  const filteredLuminaires = useMemo(() => {
    return luminaires
      .filter(l => {
        const matchesSearch =
          l.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.protocol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.dimType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.notes.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesBrand = selectedBrand === 'ALL' || l.brand === selectedBrand;
        const matchesProtocol = selectedProtocol === 'ALL' || l.protocol === selectedProtocol;

        return matchesSearch && matchesBrand && matchesProtocol;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === 'string') {
          valA = (valA as string).toLowerCase();
          valB = (valB as string).toLowerCase();
        }

        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [luminaires, searchTerm, selectedBrand, selectedProtocol, sortField, sortAsc]);

  const handleSort = (field: keyof LuminaireFixture) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="bg-[#0A0A0A] p-4 border border-[#333333] shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase font-mono font-bold tracking-widest text-amber-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Sheet 02 • Luminaires & Fixtures Catalog
          </div>
          <h2 className="text-xl font-light italic font-serif text-[#F2F2F2] mt-0.5">
            Danh Mục Hãng Đèn & Loại Đèn Điều Khiển (Luminaires Catalog)
          </h2>
          <p className="text-xs text-[#888888] font-sans mt-0.5">
            Phân loại gọn gàng theo Hãng đèn (Signify, ColorKinetics, ERCO, iGuzzini...), Công suất, Protocol & Phụ kiện nhận tín hiệu.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#666666]" />
            <input
              type="text"
              placeholder="Tìm Mã đèn, Hãng, Kiểu dim..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#141414] text-[#E0E0E0] text-xs font-mono pl-9 pr-3 py-2 border border-[#333333] focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Brand Filter */}
          <div className="flex items-center gap-1.5 bg-[#141414] border border-[#333333] px-2.5 py-1.5 text-xs text-[#E0E0E0] font-mono">
            <Filter className="w-3.5 h-3.5 text-[#666666]" />
            <select
              value={selectedBrand}
              onChange={e => setSelectedBrand(e.target.value)}
              className="bg-transparent focus:outline-none text-[#E0E0E0]"
            >
              <option value="ALL" className="bg-[#141414]">Tất cả Hãng Đèn</option>
              {brands.filter(b => b !== 'ALL').map(b => (
                <option key={b} value={b} className="bg-[#141414]">{b}</option>
              ))}
            </select>
          </div>

          {/* Protocol Filter */}
          <div className="flex items-center gap-1.5 bg-[#141414] border border-[#333333] px-2.5 py-1.5 text-xs text-[#E0E0E0] font-mono">
            <select
              value={selectedProtocol}
              onChange={e => setSelectedProtocol(e.target.value)}
              className="bg-transparent focus:outline-none text-[#E0E0E0]"
            >
              <option value="ALL" className="bg-[#141414]">Tất cả Chuẩn Dim</option>
              {protocols.filter(p => p !== 'ALL').map(p => (
                <option key={p} value={p} className="bg-[#141414]">{p}</option>
              ))}
            </select>
          </div>

          {/* Add New Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold uppercase tracking-wider px-3.5 py-2 transition-colors font-sans"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Mã Đèn</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet Table */}
      <div className="bg-[#0A0A0A] border border-[#333333] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#181818] text-[#888888] text-[10px] uppercase font-bold tracking-wider border-b border-[#333333] select-none font-mono">
                <th className="p-3 w-10 text-center">#</th>
                <th
                  onClick={() => handleSort('brand')}
                  className="p-3 cursor-pointer hover:bg-[#222222] transition"
                >
                  <div className="flex items-center gap-1">
                    <span>Hãng Sản Xuất</span>
                    <ArrowUpDown className="w-3 h-3 text-[#666666]" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('model')}
                  className="p-3 cursor-pointer hover:bg-[#222222] transition"
                >
                  <div className="flex items-center gap-1">
                    <span>Mã Đèn (Model)</span>
                    <ArrowUpDown className="w-3 h-3 text-[#666666]" />
                  </div>
                </th>
                <th className="p-3 min-w-[220px]">Tên & Loại Đèn Fixture</th>
                <th className="p-3 min-w-[220px] bg-[#141414] text-amber-400">Thông Số Quang Học & Kỹ Thuật Spec</th>
                <th
                  onClick={() => handleSort('protocol')}
                  className="p-3 cursor-pointer hover:bg-[#222222] transition"
                >
                  <div className="flex items-center gap-1">
                    <span>Chuẩn Dimming</span>
                    <ArrowUpDown className="w-3 h-3 text-[#666666]" />
                  </div>
                </th>
                <th className="p-3">Kiểu Cấu Hình Dim</th>
                <th className="p-3 text-center">Addr/Đèn</th>
                <th
                  onClick={() => handleSort('wattage')}
                  className="p-3 text-center cursor-pointer hover:bg-[#222222] transition"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Công Suất</span>
                    <ArrowUpDown className="w-3 h-3 text-[#666666]" />
                  </div>
                </th>
                <th className="p-3">Điện Áp Cấp</th>
                <th className="p-3 min-w-[200px]">Bộ Trộn Nguồn & Tín Hiệu Khai Báo</th>
                <th className="p-3 text-center">KC Đèn-Đèn Max</th>
                <th className="p-3 text-center">KC Ctrl-Đèn Max</th>
                <th
                  onClick={() => handleSort('priceVND')}
                  className="p-3 text-right cursor-pointer hover:bg-[#222222] transition"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Đơn Giá Tham Khảo</span>
                    <ArrowUpDown className="w-3 h-3 text-[#666666]" />
                  </div>
                </th>
                <th className="p-3 min-w-[220px]">Ghi Chú & Đặc Tính</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#222222] text-[#E0E0E0] font-mono">
              {filteredLuminaires.length === 0 ? (
                <tr>
                  <td colSpan={15} className="p-8 text-center text-[#888888] font-sans">
                    Không tìm thấy loại đèn nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredLuminaires.map((lum, index) => (
                  <tr
                    key={lum.id}
                    className="hover:bg-[#151515] transition-colors group border-b border-[#222222]"
                  >
                    <td className="p-3 text-center text-[#555555]">{index + 1}</td>
                    <td className="p-3 font-bold text-[#F2F2F2] font-sans whitespace-nowrap">{lum.brand}</td>
                    <td className="p-3 font-bold text-amber-400">
                      <span className="bg-[#141414] border border-[#2A2A2A] px-2 py-0.5 rounded text-xs">
                        {lum.model}
                      </span>
                    </td>
                    <td className="p-3 font-sans font-medium text-[#F2F2F2]">{lum.name}</td>
                    
                    {/* Extra Detailed Technical Specs Badges */}
                    <td className="p-3 bg-[#0E0E0E] space-y-1 font-mono text-[10px]">
                      <div className="flex flex-wrap items-center gap-1">
                        {lum.ipRating && (
                          <span className="bg-[#181818] text-amber-400 border border-amber-500/30 px-1.5 py-0.5 font-bold">
                            {lum.ipRating}
                          </span>
                        )}
                        {lum.cri && (
                          <span className="bg-[#181818] text-purple-300 border border-purple-500/30 px-1.5 py-0.5 font-bold">
                            {lum.cri}
                          </span>
                        )}
                        {lum.beamAngle && (
                          <span className="bg-[#181818] text-[#00A3FF] border border-[#00A3FF]/30 px-1.5 py-0.5">
                            Góc: {lum.beamAngle}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1 text-[9px] text-[#AAAAAA]">
                        {lum.luminousFluxLm && (
                          <span className="text-emerald-400 font-bold">
                            {lum.luminousFluxLm.toLocaleString()} lm
                          </span>
                        )}
                        {lum.colorTemp && (
                          <span className="text-[#CCCCCC]">
                            • {lum.colorTemp}
                          </span>
                        )}
                      </div>

                      {lum.housingMaterial && (
                        <div className="text-[9px] text-[#777777] font-sans truncate max-w-[200px]" title={lum.housingMaterial}>
                          Vỏ: {lum.housingMaterial}
                        </div>
                      )}
                    </td>

                    <td className="p-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#181818] text-[#00A3FF] border border-[#333333]">
                        {lum.protocol}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap text-xs text-[#CCCCCC] font-sans">{lum.dimType}</td>
                    <td className="p-3 text-center font-bold text-purple-400">{lum.addressesConsumed}</td>
                    <td className="p-3 text-center font-bold text-amber-400">{lum.wattage}W</td>
                    <td className="p-3 text-[#888888] text-[11px] whitespace-nowrap">{lum.voltage}</td>
                    <td className="p-3 whitespace-nowrap">
                      {lum.requiresSpecialInjector ? (
                        <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-1 text-[11px]">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="font-sans font-medium">{lum.injectorModelRequired || 'Cần Data Enabler'}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[#666666] text-[11px] font-sans">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Không yêu cầu</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-center text-[#CCCCCC]">{lum.maxInterFixtureDistanceMeters}m</td>
                    <td className="p-3 text-center text-amber-400">{lum.maxControllerToLastFixtureMeters}m</td>
                    <td className="p-3 text-right font-bold text-emerald-400 whitespace-nowrap">
                      {formatVND(lum.priceVND)}
                    </td>
                    <td className="p-3 text-[11px] text-[#888888] font-sans leading-relaxed">{lum.notes}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="bg-[#111111] px-4 py-3 border-t border-[#333333] flex items-center justify-between text-xs text-[#888888] font-mono">
          <span>Total Fixtures: <strong className="text-[#F2F2F2]">{filteredLuminaires.length}</strong> / <strong>{luminaires.length}</strong></span>
          <span className="text-[10px] uppercase tracking-wider text-[#666666]">ColorKinetics • ERCO • iGuzzini • Targetti • OSRAM • Zumtobel</span>
        </div>
      </div>
    </div>
  );
};
