import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Building2 } from 'lucide-react';
import { LuminaireFixture, ProtocolType, DimType } from '../types';

const DEFAULT_LUMINAIRE_BRANDS = [
  'Sylvania',
  'Philips / Signify',
  'ColorKinetics',
  'Signify Dynalite',
  'Pharos Architectural',
  'Helvar',
  'LTECH',
  'ELR',
  'ERCO',
  'iGuzzini',
  'L&L Luce&Light',
  'Traxon / OSRAM',
  'Nicolaudie',
  'Lutron',
  'Mean Well'
];

interface AddLuminaireModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (luminaire: LuminaireFixture) => void;
  existingBrands?: string[];
}

export const AddLuminaireModal: React.FC<AddLuminaireModalProps> = ({ 
  isOpen, 
  onClose, 
  onAdd,
  existingBrands = []
}) => {
  // Combine unique brands from props and defaults
  const brandList = React.useMemo(() => {
    const combined = Array.from(new Set([...existingBrands, ...DEFAULT_LUMINAIRE_BRANDS].filter(Boolean)));
    return combined.sort((a, b) => a.localeCompare(b));
  }, [existingBrands]);

  const [selectedBrandPreset, setSelectedBrandPreset] = useState<string>(brandList[0] || 'ColorKinetics (Signify)');
  const [customBrand, setCustomBrand] = useState('');
  const [isCustomBrand, setIsCustomBrand] = useState(false);

  const [model, setModel] = useState('');
  const [name, setName] = useState('');
  const [protocol, setProtocol] = useState<ProtocolType>('DMX512/RDM');
  const [dimType, setDimType] = useState<DimType>('RGBW');
  const [addressesConsumed, setAddressesConsumed] = useState(4);
  const [wattage, setWattage] = useState(50);
  const [voltage, setVoltage] = useState('100-277V AC Direct');
  const [requiresSpecialInjector, setRequiresSpecialInjector] = useState(true);
  const [injectorModelRequired, setInjectorModelRequired] = useState('Signify Data Enabler Pro (320W / 32 Fixtures)');
  const [maxFixturesPerInjector, setMaxFixturesPerInjector] = useState(32);
  const [maxWattagePerInjector, setMaxWattagePerInjector] = useState(320);
  const [priceVND, setPriceVND] = useState(12000000);
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

    const newLuminaire: LuminaireFixture = {
      id: `custom-lum-${Date.now()}`,
      brand: effectiveBrand,
      model,
      name,
      protocol,
      dimType,
      addressesConsumed,
      wattage,
      voltage,
      requiresSpecialInjector,
      injectorModelRequired: requiresSpecialInjector ? injectorModelRequired : undefined,
      maxFixturesPerInjector: requiresSpecialInjector ? maxFixturesPerInjector : undefined,
      maxWattagePerInjector: requiresSpecialInjector ? maxWattagePerInjector : undefined,
      maxInterFixtureDistanceMeters: 3,
      maxControllerToLastFixtureMeters: 100,
      repeaterThresholdDistanceMeters: 100,
      priceVND,
      notes: notes || 'Thêm thủ công'
    };

    onAdd(newLuminaire);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0A0A0A] border border-[#333333] shadow-2xl max-w-lg w-full p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#333333] pb-3">
          <h3 className="text-lg font-light italic font-serif text-[#F2F2F2] flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-amber-400" />
            Thêm Loại Đèn Mới Vào Sheet 2
          </h3>
          <button onClick={onClose} className="text-[#888888] hover:text-[#F2F2F2] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Brand Selection: Dropdown of existing brands + Custom input */}
          <div className="p-2.5 bg-[#121212] border border-[#2E2E2E] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-amber-400 font-mono font-bold flex items-center gap-1.5 uppercase text-[11px]">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
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
                  className="w-full bg-[#181818] border border-[#3A3A3A] px-2.5 py-1.5 text-[#F2F2F2] font-sans focus:outline-none focus:border-amber-400"
                >
                  {brandList.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                  <option value="__NEW__" className="text-amber-400 font-bold bg-[#222222]">
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
                  placeholder="VD: Osram, Traxon, Erco..."
                  className={`w-full bg-[#181818] border ${isCustomBrand ? 'border-amber-400 text-amber-300' : 'border-[#3A3A3A] text-[#888888]'} px-2.5 py-1.5 font-sans focus:outline-none focus:border-amber-400`}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#CCCCCC] font-sans font-medium mb-1">Mã Đèn (Model)</label>
              <input
                type="text"
                value={model}
                onChange={e => setModel(e.target.value)}
                placeholder="VD: UniStrip G4 BCP383"
                className="w-full bg-[#141414] border border-[#333333] px-2.5 py-1.5 text-amber-400 font-mono font-bold focus:outline-none focus:border-[#00A3FF]"
                required
              />
            </div>

            <div>
              <label className="block text-[#CCCCCC] font-sans font-medium mb-1">Điện Áp Hoạt Động</label>
              <input
                type="text"
                value={voltage}
                onChange={e => setVoltage(e.target.value)}
                placeholder="VD: 220-240V AC Direct / 24V DC"
                className="w-full bg-[#141414] border border-[#333333] px-2.5 py-1.5 text-[#F2F2F2] font-mono focus:outline-none focus:border-[#00A3FF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#CCCCCC] font-sans font-medium mb-1">Tên & Loại Đèn Fixture</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="VD: Đèn Led Thanh Hắt Tường RGBW 1.0m 36W IP66"
              className="w-full bg-[#141414] border border-[#333333] px-2.5 py-1.5 text-[#F2F2F2] font-sans focus:outline-none focus:border-[#00A3FF]"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[#CCCCCC] font-sans font-medium mb-1">Chuẩn Dimming</label>
              <select
                value={protocol}
                onChange={e => setProtocol(e.target.value as ProtocolType)}
                className="w-full bg-[#141414] border border-[#333333] px-2.5 py-1.5 text-[#F2F2F2] font-mono focus:outline-none focus:border-[#00A3FF]"
              >
                <option value="DMX512/RDM">DMX512/RDM</option>
                <option value="DALI-2">DALI-2</option>
                <option value="DALI DT8">DALI DT8</option>
                <option value="1-10V">1-10V</option>
                <option value="Phase-Cut">Phase-Cut</option>
              </select>
            </div>

            <div>
              <label className="block text-[#CCCCCC] font-sans font-medium mb-1">Kiểu Dim</label>
              <select
                value={dimType}
                onChange={e => setDimType(e.target.value as DimType)}
                className="w-full bg-[#141414] border border-[#333333] px-2.5 py-1.5 text-[#F2F2F2] font-mono focus:outline-none focus:border-[#00A3FF]"
              >
                <option value="RGBW">RGBW</option>
                <option value="RGB">RGB</option>
                <option value="Tunable White (TW)">Tunable White (TW)</option>
                <option value="Single Color (Mono)">Single Color (Mono)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#CCCCCC] font-sans font-medium mb-1">Địa Chỉ/Đèn</label>
              <input
                type="number"
                value={addressesConsumed}
                onChange={e => setAddressesConsumed(parseInt(e.target.value) || 1)}
                className="w-full bg-[#141414] border border-[#333333] px-2.5 py-1.5 text-[#F2F2F2] font-mono focus:outline-none focus:border-[#00A3FF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#CCCCCC] font-sans font-medium mb-1">Công Suất (W)</label>
              <input
                type="number"
                value={wattage}
                onChange={e => setWattage(parseInt(e.target.value) || 0)}
                className="w-full bg-[#141414] border border-[#333333] px-2.5 py-1.5 text-[#F2F2F2] font-mono focus:outline-none focus:border-[#00A3FF]"
              />
            </div>

            <div>
              <label className="block text-[#CCCCCC] font-sans font-medium mb-1">Đơn Giá Tham Khảo (VNĐ)</label>
              <input
                type="number"
                value={priceVND}
                onChange={e => setPriceVND(parseInt(e.target.value) || 0)}
                className="w-full bg-[#141414] border border-[#333333] px-2.5 py-1.5 text-[#F2F2F2] font-mono focus:outline-none focus:border-[#00A3FF]"
              />
            </div>
          </div>

          <div className="p-3 bg-[#111111] border border-[#333333] space-y-2">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-amber-400 font-sans">
              <input
                type="checkbox"
                checked={requiresSpecialInjector}
                onChange={e => setRequiresSpecialInjector(e.target.checked)}
                className="text-amber-500 bg-[#141414] border-[#333333] focus:ring-0"
              />
              <span>Yêu cầu Bộ Trộn Nguồn & Signal riêng (Data Enabler Pro / PDS)?</span>
            </label>

            {requiresSpecialInjector && (
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                <div>
                  <label className="block text-[#888888] text-[10px] mb-0.5">Tên Bộ Trộn Nguồn/Data</label>
                  <input
                    type="text"
                    value={injectorModelRequired}
                    onChange={e => setInjectorModelRequired(e.target.value)}
                    className="w-full bg-[#141414] border border-[#333333] px-2 py-1 text-[#F2F2F2]"
                  />
                </div>
                <div>
                  <label className="block text-[#888888] text-[10px] mb-0.5">Max Watt / Bộ Trộn</label>
                  <input
                    type="number"
                    value={maxWattagePerInjector}
                    onChange={e => setMaxWattagePerInjector(parseInt(e.target.value) || 320)}
                    className="w-full bg-[#141414] border border-[#333333] px-2 py-1 text-[#F2F2F2]"
                  />
                </div>
              </div>
            )}
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
              Lưu Loại Đèn
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

