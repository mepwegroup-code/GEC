import React, { useState } from 'react';
import { X, Building2, Plus, Cpu, Lightbulb, Sparkles, Network, Lock, Cable } from 'lucide-react';
import { ControllerDevice, LuminaireFixture, DesignLineItem, SubControllerDevice, BMSProtocol } from '../types';
import { isControllerBmsSupported } from '../utils/calculator';

interface AddAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  controllers: ControllerDevice[];
  luminaires: LuminaireFixture[];
  subControllers: SubControllerDevice[];
  onAddArea: (newLine: DesignLineItem, areaName: string) => void;
  existingAreaCount: number;
}

const PRESET_AREA_NAMES = [
  'Facade Khối Tháp Tower',
  'Khối Đế Facade & Sảnh Đón',
  'Vương Miện & Đỉnh Mái Tòa Nhà',
  'Tường Cảnh Quan Sân Vườn & Quảng Trường',
  'Trục Kính Mặt Tiền Facade Glass',
  'Cổng Vòm & Trục Cột Kiến Trúc',
  'Sảnh Khách Sạn & Atrium Ballroom'
];

export const AddAreaModal: React.FC<AddAreaModalProps> = ({
  isOpen,
  onClose,
  controllers,
  luminaires,
  subControllers,
  onAddArea,
  existingAreaCount
}) => {
  const [areaName, setAreaName] = useState(() => `Khu Vực 0${existingAreaCount + 1}: Facade Khối Tháp`);
  const [selectedCtrlBrand, setSelectedCtrlBrand] = useState(() => controllers[0]?.brand || 'Pharos Controls');
  const [selectedCtrlId, setSelectedCtrlId] = useState(() => controllers[0]?.id || '');
  const [selectedSubId, setSelectedSubId] = useState(() => subControllers.find(s => s.brand.toLowerCase().includes((controllers[0]?.brand || '').toLowerCase()))?.id || subControllers[0]?.id || '');
  const [selectedLumBrand, setSelectedLumBrand] = useState(() => luminaires[0]?.brand || 'Griven');
  const [selectedLumId, setSelectedLumId] = useState(() => luminaires[0]?.id || '');
  const [initialQuantity, setInitialQuantity] = useState<number>(24);
  const [firstLineName, setFirstLineName] = useState('Tuyến 1: Đèn Chiếu Sáng Chính');
  const [selectedBmsProtocol, setSelectedBmsProtocol] = useState<BMSProtocol>('BACnet IP');

  if (!isOpen) return null;

  const controllerBrands = Array.from(new Set(controllers.map(c => c.brand)));
  const luminaireBrands = Array.from(new Set(luminaires.map(l => l.brand)));

  const filteredControllers = controllers.filter(c => c.brand === selectedCtrlBrand);
  const filteredSubControllers = subControllers.filter(s =>
    s.brand.toLowerCase().includes(selectedCtrlBrand.toLowerCase()) ||
    selectedCtrlBrand.toLowerCase().includes(s.brand.toLowerCase())
  );
  const filteredLuminaires = luminaires.filter(l => l.brand === selectedLumBrand);

  const activeCtrl = controllers.find(c => c.id === selectedCtrlId) || filteredControllers[0];
  const isBMSSupported = isControllerBmsSupported(activeCtrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaName.trim()) return;

    const fullZoneName = `${areaName.trim()} - ${firstLineName.trim() || 'Tuyến 1: Đèn Chiếu Sáng'}`;
    const targetLum = luminaires.find(l => l.id === selectedLumId) || luminaires[0];
    const targetCtrl = controllers.find(c => c.id === selectedCtrlId) || controllers[0];
    const targetSub = (selectedSubId && filteredSubControllers.some(s => s.id === selectedSubId))
      ? filteredSubControllers.find(s => s.id === selectedSubId)
      : filteredSubControllers[0];

    const newLine: DesignLineItem = {
      id: `line-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      zoneName: fullZoneName,
      luminaireBrand: selectedLumBrand,
      luminaireId: selectedLumId || (targetLum ? targetLum.id : ''),
      fixtureQuantity: initialQuantity,
      controllerBrand: selectedCtrlBrand,
      controllerId: selectedCtrlId || (targetCtrl ? targetCtrl.id : ''),
      subControllerBrand: (isBMSSupported && targetSub) ? selectedCtrlBrand : undefined,
      subControllerId: (isBMSSupported && targetSub) ? targetSub.id : undefined,
      subControllerQuantity: (isBMSSupported && targetSub) ? 1 : undefined,
      bmsRequired: selectedBmsProtocol,
      controllerToFirstFixtureDistance: 50,
      interFixtureDistance: 2.0,
      totalCableLengthMeters: 50 + Math.max(0, initialQuantity - 1) * 2.0
    };

    onAddArea(newLine, areaName.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0A0A0A] border-2 border-[#333333] w-full max-w-2xl shadow-2xl overflow-hidden font-sans max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-[#121212] px-6 py-4 border-b border-[#2A2A2A] flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00A3FF]/15 border border-[#00A3FF]/40 text-[#00A3FF]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#00A3FF]">
                Area Zone Architecture
              </div>
              <h2 className="text-lg font-bold text-[#F2F2F2] mt-0.5">
                Thêm Khu Vực Chiếu Sáng Mới (New Facade Zone)
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="text-[#888888] hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Quick Presets */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-[#AAAAAA] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Gợi ý tên khu vực phổ biến:</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_AREA_NAMES.map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAreaName(`Khu Vực 0${existingAreaCount + 1}: ${preset}`)}
                  className="text-[10px] font-mono bg-[#161616] hover:bg-[#252525] text-[#CCCCCC] hover:text-[#00A3FF] px-2 py-1 border border-[#333333] transition-colors"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Area Name Input */}
          <div className="space-y-1">
            <label className="text-xs font-mono font-bold text-white">Tên Khu Vực (*):</label>
            <input
              type="text"
              required
              value={areaName}
              onChange={e => setAreaName(e.target.value)}
              placeholder="VD: Khu Vực 01: Facade Khối Tháp Tower"
              className="w-full bg-[#141414] text-[#F2F2F2] p-2.5 border border-[#333333] focus:outline-none focus:border-[#00A3FF] font-medium text-sm"
            />
          </div>

          {/* Master Controller for the Area */}
          <div className="bg-[#111111] p-3.5 border border-[#262626] space-y-2">
            <div className="text-[11px] font-mono uppercase text-amber-400 font-bold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>1. Bộ Điều Khiển Trung Tâm (Master Controller)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <label className="text-[10px] text-[#888888]">Hãng Điều Khiển:</label>
                <select
                  value={selectedCtrlBrand}
                  onChange={e => {
                    const b = e.target.value;
                    setSelectedCtrlBrand(b);
                    const list = controllers.filter(c => c.brand === b);
                    if (list.length > 0) setSelectedCtrlId(list[0].id);
                    const subList = subControllers.filter(s =>
                      s.brand.toLowerCase().includes(b.toLowerCase()) ||
                      b.toLowerCase().includes(s.brand.toLowerCase())
                    );
                    setSelectedSubId(subList[0]?.id || '');
                  }}
                  className="w-full bg-[#181818] text-[#00A3FF] font-bold p-2 border border-[#333333] mt-1"
                >
                  {controllerBrands.map(b => (
                    <option key={b} value={b} className="bg-[#141414] text-[#E0E0E0]">{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#888888]">Model Master Controller:</label>
                <select
                  value={selectedCtrlId}
                  onChange={e => setSelectedCtrlId(e.target.value)}
                  className="w-full bg-[#181818] text-amber-400 font-bold p-2 border border-[#333333] mt-1"
                >
                  {filteredControllers.map(c => (
                    <option key={c.id} value={c.id} className="bg-[#141414] text-[#E0E0E0]">
                      {c.model} ({c.portsCount} Ports • {c.protocol})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Communication / Interface Device for the Area */}
          <div className="bg-[#111111] p-3.5 border border-[#262626] space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-mono uppercase text-purple-400 font-bold flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5 text-purple-400" />
                <span>2. Thiết Bị Hỗ Trợ Giao Tiếp Controller (BMS / Màn hình / Bàn phím / Remote / Mạng)</span>
              </div>
              {!isBMSSupported && (
                <span className="text-[9px] font-mono text-amber-400 bg-amber-950/40 px-1.5 py-0.5 border border-amber-800/40 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  Controller không hỗ trợ BMS
                </span>
              )}
            </div>

            {!isBMSSupported ? (
              <div className="p-2 bg-[#161616] border border-[#2A2A2A] text-[11px] text-amber-300 font-mono">
                Bộ điều khiển đã chọn hoạt động Standalone (Độc lập), không dùng thiết bị giao tiếp trung gian.
              </div>
            ) : filteredSubControllers.length === 0 ? (
              <div className="p-2 bg-[#161616] border border-[#2A2A2A] text-[11px] text-[#888888] font-mono">
                Hãng {selectedCtrlBrand} không có thiết bị giao tiếp trung gian riêng (Controller điều khiển trực tiếp).
              </div>
            ) : (
              <div className="text-xs font-mono">
                <label className="text-[10px] text-[#888888]">
                  Model Thiết Bị Giao Tiếp (Tự động theo hãng {selectedCtrlBrand}):
                </label>
                <select
                  value={selectedSubId || filteredSubControllers[0]?.id || ''}
                  onChange={e => setSelectedSubId(e.target.value)}
                  className="w-full bg-[#181818] text-purple-300 font-bold p-2 border border-[#333333] mt-1"
                >
                  {filteredSubControllers.map(s => (
                    <option key={s.id} value={s.id} className="bg-[#141414] text-[#E0E0E0]">
                      {s.model} ({s.portsCount} Ports • {s.voltageInput}) — {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* BMS Protocol Selection for the Area */}
          <div className="bg-[#111111] p-3.5 border border-[#262626] space-y-2">
            <div className="text-[11px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5 text-emerald-400" />
              <span>3. Giao Thức Kết Nối BMS Tòa Nhà (BMS Protocol Hub)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <label className="text-[10px] text-[#888888]">Chuẩn Giao Thức BMS:</label>
                <select
                  value={selectedBmsProtocol}
                  onChange={e => setSelectedBmsProtocol(e.target.value as BMSProtocol)}
                  className="w-full bg-[#181818] text-emerald-400 font-bold p-2 border border-[#333333] mt-1"
                >
                  <option value="None" className="bg-[#141414] text-[#E0E0E0]">None (Standalone - Chạy Độc Lập)</option>
                  <option value="BACnet IP" className="bg-[#141414] text-[#E0E0E0]">BACnet IP (Server Phòng Điều Khiển)</option>
                  <option value="BACnet MSTP" className="bg-[#141414] text-[#E0E0E0]">BACnet MS/TP (RS-485)</option>
                  <option value="Modbus TCP" className="bg-[#141414] text-[#E0E0E0]">Modbus TCP (LAN Ethernet)</option>
                  <option value="Modbus RTU" className="bg-[#141414] text-[#E0E0E0]">Modbus RTU (RS-485 Serial)</option>
                  <option value="KNX" className="bg-[#141414] text-[#E0E0E0]">KNX (Building Automation Bus)</option>
                  <option value="Ethernet/IP" className="bg-[#141414] text-[#E0E0E0]">Ethernet/IP</option>
                  <option value="MQTT" className="bg-[#141414] text-[#E0E0E0]">MQTT (IoT Cloud Service)</option>
                  <option value="Rest API" className="bg-[#141414] text-[#E0E0E0]">Rest API (Web Service)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#888888]">Đặc tính kết nối:</label>
                <div className="p-2 bg-[#161616] border border-[#2A2A2A] text-[11px] mt-1">
                  {selectedBmsProtocol === 'None' ? (
                    <span className="text-[#888888]">Bộ điều khiển hoạt động độc lập (Local Scheduler)</span>
                  ) : isBMSSupported && activeCtrl?.bmsSupport?.includes(selectedBmsProtocol) ? (
                    <span className="text-emerald-400 font-bold">✓ Hỗ trợ Native trên Controller đã chọn</span>
                  ) : (
                    <span className="text-amber-400 font-bold">⚠️ Sẽ tự động bổ sung 1 Gateway BMS vào BOQ</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Initial First Line Configuration */}
          <div className="bg-[#111111] p-3.5 border border-[#262626] space-y-3">
            <div className="text-[11px] font-mono uppercase text-[#00A3FF] font-bold flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-[#00A3FF]" />
              <span>4. Tuyến Đèn Đầu Tiên Trong Khu Vực</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs font-mono">
              <div className="sm:col-span-6">
                <label className="text-[10px] text-[#888888]">Tên Tuyến:</label>
                <input
                  type="text"
                  value={firstLineName}
                  onChange={e => setFirstLineName(e.target.value)}
                  className="w-full bg-[#181818] text-[#F2F2F2] p-2 border border-[#333333] mt-1"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-[10px] text-[#888888]">Hãng Đèn:</label>
                <select
                  value={selectedLumBrand}
                  onChange={e => {
                    const b = e.target.value;
                    setSelectedLumBrand(b);
                    const list = luminaires.filter(l => l.brand === b);
                    if (list.length > 0) setSelectedLumId(list[0].id);
                  }}
                  className="w-full bg-[#181818] text-amber-400 font-bold p-2 border border-[#333333] mt-1"
                >
                  {luminaireBrands.map(b => (
                    <option key={b} value={b} className="bg-[#141414] text-[#E0E0E0]">{b}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="text-[10px] text-[#888888]">Số Lượng Đèn:</label>
                <input
                  type="number"
                  min={1}
                  value={initialQuantity}
                  onChange={e => setInitialQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-[#181818] text-amber-400 text-center font-bold p-2 border border-[#333333] mt-1"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#222222]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-[#1A1A1A] hover:bg-[#252525] text-[#CCCCCC] text-xs font-mono uppercase border border-[#333333]"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#00A3FF] hover:bg-[#33B5FF] text-black text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Khu Vực Mới</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
