import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Building2 } from 'lucide-react';
import { ControllerDevice, ProtocolType } from '../types';

const DEFAULT_CONTROLLER_BRANDS = [
  'Signify Dynalite',
  'Pharos Architectural',
  'Helvar',
  'LTECH',
  'Nicolaudie',
  'Lutron',
  'Crestron',
  'KNX / ABB',
  'Siemens',
  'Schneider Electric',
  'Philips / Signify',
  'Madrix',
  'MA Lighting',
  'Mean Well'
];

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (device: ControllerDevice) => void;
  existingBrands?: string[];
}

export const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ 
  isOpen, 
  onClose, 
  onAdd,
  existingBrands = []
}) => {
  // Combine unique brands from props and defaults
  const brandList = React.useMemo(() => {
    const combined = Array.from(new Set([...existingBrands, ...DEFAULT_CONTROLLER_BRANDS].filter(Boolean)));
    return combined.sort((a, b) => a.localeCompare(b));
  }, [existingBrands]);

  const [selectedBrandPreset, setSelectedBrandPreset] = useState<string>(brandList[0] || 'Signify Dynalite');
  const [customBrand, setCustomBrand] = useState('');
  const [isCustomBrand, setIsCustomBrand] = useState(false);

  const [model, setModel] = useState('');
  const [name, setName] = useState('');
  const [protocol, setProtocol] = useState<ProtocolType>('DALI-2');
  const [maxAddressesPerPort, setMaxAddressesPerPort] = useState(64);
  const [portsCount, setPortsCount] = useState(1);
  const [maxDaisyChainDevices, setMaxDaisyChainDevices] = useState(64);
  const [maxCableDistanceMeters, setMaxCableDistanceMeters] = useState(300);
  const [voltageInput, setVoltageInput] = useState('220V AC');
  const [priceVND, setPriceVND] = useState(15000000);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen && brandList.length > 0 && !isCustomBrand && !selectedBrandPreset) {
      setSelectedBrandPreset(brandList[0]);
    }
  }, [isOpen, brandList, isCustomBrand, selectedBrandPreset]);

  if (!isOpen) return null;

  const effectiveBrand = isCustomBrand ? (customBrand.trim() || 'Hãng Tùy Chỉnh') : selectedBrandPreset;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!model || !name) return;

    const newDevice: ControllerDevice = {
      id: `custom-ctrl-${Date.now()}`,
      brand: effectiveBrand,
      model,
      name,
      protocol,
      bmsSupport: ['BACnet IP', 'Modbus TCP'],
      maxAddressesPerPort,
      portsCount,
      maxDaisyChainDevices,
      maxCableDistanceMeters,
      voltageInput,
      priceVND,
      notes: notes || 'Thiết bị thêm thủ công'
    };

    onAdd(newDevice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0A0A0A] border border-[#333333] shadow-2xl max-w-lg w-full p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#333333] pb-3">
          <h3 className="text-lg font-light italic font-serif text-[#F2F2F2] flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-[#00A3FF]" />
            Thêm Thiết Bị Điều Khiển Mới Vào Sheet 1
          </h3>
          <button onClick={onClose} className="text-[#888888] hover:text-[#F2F2F2] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Brand Selection: Dropdown of existing brands + Custom input */}
          <div className="p-2.5 bg-[#121212] border border-[#2E2E2E] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[#00A3FF] font-mono font-bold flex items-center gap-1.5 uppercase text-[11px]">
                <Building2 className="w-3.5 h-3.5 text-[#00A3FF]" />
                Hãng Sản Xuất (Brand)
              </label>
              <span className="text-[10px] text-[#888888] font-mono">
                {isCustomBrand ? 'Hãng mới tùy chỉnh' : 'Chọn hãng có sẵn'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Dropdown of existing brands */}
              <div>
                <label className="block text-[#999999] text-[10px] mb-1 font-mono">
                  1. Chọn Hãng Có Sẵn:
                </label>
                <select
                  value={isCustomBrand ? '__NEW__' : selectedBrandPreset}
                  onChange={e => {
                    if (e.target.value === '__NEW__') {
                      setIsCustomBrand(true);
                    } else {
                      setIsCustomBrand(false);
                      setSelectedBrandPreset(e.target.value);
                    }
                  }}
                  className="w-full bg-[#181818] border border-[#3A3A3A] px-2.5 py-1.5 text-[#F2F2F2] font-sans focus:outline-none focus:border-[#00A3FF]"
                >
                  {brandList.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                  <option value="__NEW__" className="text-[#00A3FF] font-bold bg-[#222222]">
                    + Thêm Hãng Mới Khác...
                  </option>
                </select>
              </div>

              {/* Text Input for Custom/New Brand */}
              <div>
                <label className="block text-[#999999] text-[10px] mb-1 font-mono">
                  2. Hoặc Nhập Hãng Mới:
                </label>
                <input
                  type="text"
                  value={customBrand}
                  onChange={e => {
                    setCustomBrand(e.target.value);
                    if (!isCustomBrand) setIsCustomBrand(true);
                  }}
                  onFocus={() => {
                    if (!isCustomBrand && customBrand.trim()) setIsCustomBrand(true);
                  }}
                  placeholder="VD: Pharos, Helvar, Dynalite..."
                  className={`w-full bg-[#181818] border ${isCustomBrand ? 'border-[#00A3FF] text-[#33B5FF]' : 'border-[#3A3A3A] text-[#888888]'} px-2.5 py-1.5 font-sans focus:outline-none focus:border-[#00A3FF]`}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#CCCCCC] font-sans font-medium mb-1">Mã Thiết Bị (Model)</label>
              <input
                type="text"
                value={model}
                onChange={e => setModel(e.target.value)}
                placeholder="VD: DDC320"
                className="w-full bg-[#141414] border border-[#333333] px-2.5 py-1.5 text-[#00A3FF] font-mono font-bold focus:outline-none focus:border-[#00A3FF]"
                required
              />
            </div>

            <div>
              <label className="block text-[#CCCCCC] font-sans font-medium mb-1">Điện Áp Cấp Nguồn</label>
              <input
                type="text"
                value={voltageInput}
                onChange={e => setVoltageInput(e.target.value)}
                placeholder="VD: 220V AC / 24V DC"
                className="w-full bg-[#141414] border border-[#333333] px-2.5 py-1.5 text-[#F2F2F2] font-mono focus:outline-none focus:border-[#00A3FF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#CCCCCC] font-sans font-medium mb-1">Tên & Chức Năng Equipment</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="VD: Bộ Điều Khiển DALI 2-Line Router"
              className="w-full bg-[#141414] border border-[#333333] px-2.5 py-1.5 text-[#F2F2F2] font-sans focus:outline-none focus:border-[#00A3FF]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#CCCCCC] font-sans font-medium mb-1">Giao Thức Chánh</label>
              <select
                value={protocol}
                onChange={e => setProtocol(e.target.value as ProtocolType)}
                className="w-full bg-[#141414] border border-[#333333] px-2.5 py-1.5 text-[#F2F2F2] font-mono focus:outline-none focus:border-[#00A3FF]"
              >
                <option value="DALI-2">DALI-2</option>
                <option value="DALI DT8">DALI DT8</option>
                <option value="1-10V">1-10V</option>
                <option value="DMX512/RDM">DMX512/RDM</option>
                <option value="Phase-Cut">Phase-Cut</option>
              </select>
            </div>

            <div>
              <label className="block text-[#CCCCCC] font-sans font-medium mb-1">Max Addr / Port</label>
              <input
                type="number"
                value={maxAddressesPerPort}
                onChange={e => setMaxAddressesPerPort(parseInt(e.target.value) || 64)}
                className="w-full bg-[#141414] border border-[#333333] px-2.5 py-1.5 text-[#F2F2F2] font-mono focus:outline-none focus:border-[#00A3FF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[#CCCCCC] font-sans font-medium mb-1">Số Port</label>
              <input
                type="number"
                value={portsCount}
                onChange={e => setPortsCount(parseInt(e.target.value) || 1)}
                className="w-full bg-[#141414] border border-[#333333] px-2.5 py-1.5 text-[#F2F2F2] font-mono focus:outline-none focus:border-[#00A3FF]"
              />
            </div>

            <div>
              <label className="block text-[#CCCCCC] font-sans font-medium mb-1">KC Dây Max (m)</label>
              <input
                type="number"
                value={maxCableDistanceMeters}
                onChange={e => setMaxCableDistanceMeters(parseInt(e.target.value) || 300)}
                className="w-full bg-[#141414] border border-[#333333] px-2.5 py-1.5 text-[#F2F2F2] font-mono focus:outline-none focus:border-[#00A3FF]"
              />
            </div>

            <div>
              <label className="block text-[#CCCCCC] font-sans font-medium mb-1">Đơn Giá (VNĐ)</label>
              <input
                type="number"
                value={priceVND}
                onChange={e => setPriceVND(parseInt(e.target.value) || 0)}
                className="w-full bg-[#141414] border border-[#333333] px-2.5 py-1.5 text-[#F2F2F2] font-mono focus:outline-none focus:border-[#00A3FF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#CCCCCC] font-sans font-medium mb-1">Ghi Chú Kỹ Thuật</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              className="w-full bg-[#141414] border border-[#333333] px-2.5 py-1.5 text-[#F2F2F2] font-sans focus:outline-none focus:border-[#00A3FF]"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-[#333333]">
            <button
              type="button"
              onClick={onClose}
              className="bg-[#181818] hover:bg-[#252525] text-[#CCCCCC] font-mono text-xs uppercase tracking-wider px-4 py-2 border border-[#333333] transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="bg-[#00A3FF] hover:bg-[#33B5FF] text-black font-bold font-sans text-xs uppercase tracking-wider px-4 py-2 transition-colors"
            >
              Lưu Thiết Bị
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

