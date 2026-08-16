import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, ArrowUpDown, ShieldCheck, Zap, Cable, Network, Info, Server, Cpu, Layers } from 'lucide-react';
import { ControllerDevice, SubControllerDevice, ProtocolType } from '../types';
import { formatVND } from '../utils/calculator';
import { BMSConnectionModal } from './BMSConnectionModal';

interface SheetControllersProps {
  controllers: ControllerDevice[];
  subControllers?: SubControllerDevice[];
  onOpenAddModal: () => void;
}

export const SheetControllers: React.FC<SheetControllersProps> = ({
  controllers,
  subControllers = [],
  onOpenAddModal
}) => {
  const [catalogType, setCatalogType] = useState<'master' | 'sub'>('master');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [selectedProtocol, setSelectedProtocol] = useState<string>('ALL');
  const [sortField, setSortField] = useState<keyof ControllerDevice>('brand');
  const [sortAsc, setSortAsc] = useState(true);
  const [activeBMSModalController, setActiveBMSModalController] = useState<ControllerDevice | null>(null);

  // Extract unique brands
  const brands = useMemo(() => {
    const list = Array.from(new Set(
      catalogType === 'master' 
        ? controllers.map(c => c.brand)
        : subControllers.map(s => s.brand)
    ));
    return ['ALL', ...list];
  }, [controllers, subControllers, catalogType]);

  // Extract unique protocols
  const protocols = useMemo(() => {
    const list = Array.from(new Set(controllers.map(c => c.protocol)));
    return ['ALL', ...list];
  }, [controllers]);

  // Filtered and Sorted master controllers
  const filteredControllers = useMemo(() => {
    return controllers
      .filter(c => {
        const matchesSearch =
          c.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.protocol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.product12NC && c.product12NC.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (c.bmsCableType && c.bmsCableType.toLowerCase().includes(searchTerm.toLowerCase())) ||
          c.notes.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesBrand = selectedBrand === 'ALL' || c.brand === selectedBrand;
        const matchesProtocol = selectedProtocol === 'ALL' || c.protocol === selectedProtocol;

        return matchesSearch && matchesBrand && matchesProtocol;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === 'string') {
          valA = (valA as string).toLowerCase();
        }
        if (typeof valB === 'string') {
          valB = (valB as string).toLowerCase();
        }

        if (valA === undefined || valB === undefined) return 0;
        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [controllers, searchTerm, selectedBrand, selectedProtocol, sortField, sortAsc]);

  // Filtered sub-controllers
  const filteredSubControllers = useMemo(() => {
    return subControllers.filter(s => {
      const matchesSearch =
        s.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.voltageInput.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBrand = selectedBrand === 'ALL' || s.brand === selectedBrand;
      return matchesSearch && matchesBrand;
    });
  }, [subControllers, searchTerm, selectedBrand]);

  const handleSort = (field: keyof ControllerDevice) => {
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
          <div className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#00A3FF] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00A3FF]"></span>
            Sheet 01 • Master & Auxiliary Controller Catalog
          </div>
          <h2 className="text-xl font-light italic font-serif text-[#F2F2F2] mt-0.5">
            Danh Mục Thiết Bị Điều Khiển & Giao Tiếp Phụ Trợ (Controllers & Remote I/O)
          </h2>
          <p className="text-xs text-[#888888] font-sans mt-0.5">
            Tra cứu Pharos LPC X/TPC, Pharos RIO 84/80/44/A/D, Signify ZXP399, Dynalite DDNG485/DMPI, Helvar & BMS Gateway.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Catalog Type Toggle Switch */}
          <div className="flex items-center bg-[#141414] p-1 border border-[#333333]">
            <button
              onClick={() => { setCatalogType('master'); setSelectedBrand('ALL'); }}
              className={`px-3 py-1.5 text-xs font-mono font-bold uppercase transition-colors flex items-center gap-1.5 ${
                catalogType === 'master'
                  ? 'bg-amber-400 text-black shadow'
                  : 'text-[#AAAAAA] hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Master Controllers ({controllers.length})</span>
            </button>
            <button
              onClick={() => { setCatalogType('sub'); setSelectedBrand('ALL'); }}
              className={`px-3 py-1.5 text-xs font-mono font-bold uppercase transition-colors flex items-center gap-1.5 ${
                catalogType === 'sub'
                  ? 'bg-purple-500 text-black shadow'
                  : 'text-[#AAAAAA] hover:text-white'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Thiết Bị Phụ Trợ & RIO ({subControllers.length})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#666666]" />
            <input
              type="text"
              placeholder="Tìm theo Mã, Hãng, RIO, BMS..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#141414] text-[#E0E0E0] text-xs font-mono pl-9 pr-3 py-2 border border-[#333333] focus:outline-none focus:border-[#00A3FF]"
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
              <option value="ALL" className="bg-[#141414]">Tất cả Hãng</option>
              {brands.filter(b => b !== 'ALL').map(b => (
                <option key={b} value={b} className="bg-[#141414]">{b}</option>
              ))}
            </select>
          </div>

          {catalogType === 'master' && (
            <div className="flex items-center gap-1.5 bg-[#141414] border border-[#333333] px-2.5 py-1.5 text-xs text-[#E0E0E0] font-mono">
              <select
                value={selectedProtocol}
                onChange={e => setSelectedProtocol(e.target.value)}
                className="bg-transparent focus:outline-none text-[#E0E0E0]"
              >
                <option value="ALL" className="bg-[#141414]">Tất cả Giao Thức</option>
                {protocols.filter(p => p !== 'ALL').map(p => (
                  <option key={p} value={p} className="bg-[#141414]">{p}</option>
                ))}
              </select>
            </div>
          )}

          {/* Add New Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 bg-[#00A3FF] hover:bg-[#33B5FF] text-black text-xs font-bold uppercase tracking-wider px-3.5 py-2 transition-colors font-sans"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Mới</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet Table for Master or Sub Controllers */}
      {catalogType === 'master' ? (
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
                    className="p-3 cursor-pointer hover:bg-[#222222] transition min-w-[170px]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Mã Model & 12NC</span>
                      <ArrowUpDown className="w-3 h-3 text-[#666666]" />
                    </div>
                  </th>
                  <th className="p-3 min-w-[220px]">Tên & Chức Năng Controller</th>
                  <th
                    onClick={() => handleSort('protocol')}
                    className="p-3 cursor-pointer hover:bg-[#222222] transition"
                  >
                    <div className="flex items-center gap-1">
                      <span>Giao Thức</span>
                      <ArrowUpDown className="w-3 h-3 text-[#666666]" />
                    </div>
                  </th>
                  <th className="p-3 text-center">Số Cổng / Univ</th>
                  <th className="p-3 text-center">Nguồn Cấp</th>
                  <th className="p-3 text-center">Chuẩn Lắp</th>
                  <th className="p-3 min-w-[170px]">Tích Hợp BMS Tòa Nhà</th>
                  <th
                    onClick={() => handleSort('priceVND')}
                    className="p-3 text-right cursor-pointer hover:bg-[#222222] transition"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Đơn Giá Dự Toán</span>
                      <ArrowUpDown className="w-3 h-3 text-[#666666]" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222] font-mono">
                {filteredControllers.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-[#666666]">
                      Không tìm thấy thiết bị điều khiển phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredControllers.map((ctrl, idx) => (
                    <tr
                      key={ctrl.id}
                      className="hover:bg-[#141414] transition-colors group"
                    >
                      <td className="p-3 text-center text-[#555555]">{idx + 1}</td>
                      <td className="p-3 font-bold text-amber-400">{ctrl.brand}</td>
                      <td className="p-3">
                        <div className="font-bold text-[#F2F2F2]">{ctrl.model}</div>
                        {ctrl.product12NC && (
                          <div className="text-[10px] text-amber-500/80 font-mono">
                            12NC: {ctrl.product12NC}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="text-[#CCCCCC] font-sans font-medium">{ctrl.name}</div>
                        <div className="text-[10px] text-[#666666] line-clamp-1">{ctrl.notes}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-[#1F1F1F] text-[#00A3FF] border border-[#333333] font-bold text-[10px]">
                          {ctrl.protocol}
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold text-purple-400">
                        {ctrl.portsCount} Ports
                        <span className="block text-[9px] text-[#666666] font-normal">
                          {ctrl.maxAddressesPerPort} Addr/Port
                        </span>
                      </td>
                      <td className="p-3 text-center text-[#AAAAAA]">{ctrl.voltageInput}</td>
                      <td className="p-3 text-center text-[#888888]">
                        <span className="px-1.5 py-0.5 bg-[#161616] border border-[#262626]">
                          {ctrl.rackUnit || 'DIN Rail'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap gap-1">
                            {ctrl.bmsSupport && ctrl.bmsSupport.length > 0 && !ctrl.bmsSupport.includes('None') ? (
                              ctrl.bmsSupport.map(b => (
                                <span key={b} className="px-1.5 py-0.2 bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 text-[9px] font-bold">
                                  {b}
                                </span>
                              ))
                            ) : (
                              <span className="text-[#555555] text-[10px]">None</span>
                            )}
                          </div>
                          {ctrl.bmsCableType && ctrl.bmsCableType !== 'None' && (
                            <button
                              onClick={() => setActiveBMSModalController(ctrl)}
                              className="text-[10px] text-[#00A3FF] hover:underline flex items-center gap-1"
                            >
                              <Cable className="w-3 h-3 text-[#00A3FF]" />
                              <span>{ctrl.bmsCableType}</span>
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-400">
                        {formatVND(ctrl.priceVND)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-[#0A0A0A] border border-[#333333] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#181818] text-[#888888] text-[10px] uppercase font-bold tracking-wider border-b border-[#333333] select-none font-mono">
                  <th className="p-3 w-10 text-center">#</th>
                  <th className="p-3">Hãng Sản Xuất</th>
                  <th className="p-3 min-w-[180px]">Mã Model Thiết Bị Phụ Trợ</th>
                  <th className="p-3 min-w-[240px]">Tên & Chức Năng Giao Tiếp I/O</th>
                  <th className="p-3 text-center">Số Cổng I/O / Ports</th>
                  <th className="p-3 text-center">Nguồn Cấp / PoE</th>
                  <th className="p-3 min-w-[260px]">Ứng Dụng Trong Hệ Thống (Pharos / Dynalite / Helvar)</th>
                  <th className="p-3 text-right">Đơn Giá Dự Toán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222] font-mono">
                {filteredSubControllers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-[#666666]">
                      Không tìm thấy thiết bị phụ trợ phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredSubControllers.map((sub, idx) => (
                    <tr
                      key={sub.id}
                      className="hover:bg-[#141414] transition-colors group"
                    >
                      <td className="p-3 text-center text-[#555555]">{idx + 1}</td>
                      <td className="p-3 font-bold text-purple-400">{sub.brand}</td>
                      <td className="p-3">
                        <div className="font-bold text-[#F2F2F2] flex items-center gap-1.5">
                          <Network className="w-3.5 h-3.5 text-purple-400" />
                          <span>{sub.model}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-[#CCCCCC] font-sans font-medium">{sub.name}</div>
                      </td>
                      <td className="p-3 text-center font-bold text-[#00A3FF]">
                        {sub.portsCount} Ports
                        <span className="block text-[9px] text-[#777777] font-normal">
                          {sub.maxAddressesPerPort} Addr/Port
                        </span>
                      </td>
                      <td className="p-3 text-center text-[#AAAAAA]">
                        <span className="px-1.5 py-0.5 bg-[#161616] border border-[#262626]">
                          {sub.voltageInput}
                        </span>
                      </td>
                      <td className="p-3 text-[#888888] text-[11px] font-sans">
                        {sub.notes}
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-400">
                        {formatVND(sub.priceVND)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BMS Modal */}
      {activeBMSModalController && (
        <BMSConnectionModal
          controller={activeBMSModalController}
          areaName="Tra Cứu Danh Mục Thiết Bị"
          onClose={() => setActiveBMSModalController(null)}
        />
      )}
    </div>
  );
};
