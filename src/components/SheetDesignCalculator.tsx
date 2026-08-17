import React, { useState } from 'react';
import { 
  Plus, 
  Copy, 
  Trash2, 
  AlertTriangle, 
  ShieldCheck, 
  Zap, 
  Info, 
  Building2, 
  Cpu, 
  Layers, 
  Network, 
  Cable, 
  CheckCircle2, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  Edit3,
  Check,
  X,
  AlertCircle,
  Lock,
  Unlock,
  Radio,
  PlusCircle
} from 'lucide-react';
import { DesignLineItem, LuminaireFixture, ControllerDevice, SubControllerDevice, CalculatedLineResult, BMSProtocol } from '../types';
import { calculateLineResult, isControllerBmsSupported, isLedStrip } from '../utils/calculator';
import { INITIAL_SUB_CONTROLLERS } from '../data/subControllersData';
import { BMSConnectionModal } from './BMSConnectionModal';
import { AddAreaModal } from './AddAreaModal';

interface SheetDesignCalculatorProps {
  lineItems: DesignLineItem[];
  luminaires: LuminaireFixture[];
  controllers: ControllerDevice[];
  subControllers?: SubControllerDevice[];
  onUpdateLineItem: (updated: DesignLineItem) => void;
  onAddLineItem: () => void;
  onDuplicateLineItem: (id: string) => void;
  onDeleteLineItem: (id: string) => void;
  lastSavedTime?: string;
  isAutoSaving?: boolean;
}

// Preset area suggestions
const AREA_PRESETS = [
  'Facade Khối Tháp Tower',
  'Khối Đế Facade & Sảnh Đón',
  'Vương Miện & Đỉnh Mái Tòa Nhà',
  'Tường Cảnh Quan Sân Vườn & Quảng Trường',
  'Sảnh Khách Sạn & Atrium Ballroom'
];

export const SheetDesignCalculator: React.FC<SheetDesignCalculatorProps> = ({
  lineItems,
  luminaires,
  controllers,
  subControllers = INITIAL_SUB_CONTROLLERS,
  onUpdateLineItem,
  onAddLineItem,
  onDuplicateLineItem,
  onDeleteLineItem,
  lastSavedTime,
  isAutoSaving
}) => {
  const [filterArea, setFilterArea] = useState<string>('ALL');
  const [activeBMSModalController, setActiveBMSModalController] = useState<{
    controller: ControllerDevice;
    subController?: SubControllerDevice | null;
    subControllerQuantity?: number;
    subController2?: SubControllerDevice | null;
    subController2Quantity?: number;
    areaName: string;
  } | null>(null);
  const [isAddAreaModalOpen, setIsAddAreaModalOpen] = useState(false);
  
  // Area Delete Confirmation State
  const [areaToDelete, setAreaToDelete] = useState<{ name: string; linesCount: number; powerKW: number } | null>(null);

  // Area Rename Modal State
  const [editingAreaName, setEditingAreaName] = useState<{ oldName: string; currentName: string } | null>(null);

  // Extract unique brands for dropdowns
  const luminaireBrands = Array.from(new Set(luminaires.map(l => l.brand)));
  const controllerBrands = Array.from(new Set(controllers.map(c => c.brand)));

  // Compute live calculations for all line items
  const lineResults: CalculatedLineResult[] = lineItems.map(item =>
    calculateLineResult(item, controllers, luminaires, subControllers)
  );

  // Grouping helper: Extract main area name from zoneName (e.g. "Facade Khối Tháp Tower - Tuyến 1..." -> "Facade Khối Tháp Tower")
  const getAreaGroup = (zoneName: string) => {
    if (zoneName.includes(' - ')) return zoneName.split(' - ')[0].trim();
    if (zoneName.includes(': ')) return zoneName.split(': ')[0].trim();
    return zoneName.trim();
  };

  // Get line items grouped by Area
  const areaGroupsMap = new Map<string, CalculatedLineResult[]>();
  lineResults.forEach(res => {
    const areaName = getAreaGroup(res.item.zoneName);
    if (!areaGroupsMap.has(areaName)) {
      areaGroupsMap.set(areaName, []);
    }
    areaGroupsMap.get(areaName)!.push(res);
  });

  const uniqueAreaNames = Array.from(areaGroupsMap.keys());

  // Update BMS Protocol for an entire Area
  const handleUpdateAreaBmsProtocol = (areaName: string, protocol: BMSProtocol) => {
    lineItems.forEach(item => {
      if (getAreaGroup(item.zoneName) === areaName) {
        onUpdateLineItem({
          ...item,
          bmsRequired: protocol
        });
      }
    });
  };

  // Update Master Controller for an entire Area
  const handleUpdateAreaMasterController = (areaName: string, newBrand: string, newId: string) => {
    const newCtrl = controllers.find(c => c.id === newId) || controllers.find(c => c.brand === newBrand);
    const isZXP = Boolean(
      newCtrl?.model.includes('ZXP399') ||
      newCtrl?.id.includes('zxp399') ||
      newCtrl?.brand.toLowerCase().includes('signify') ||
      newCtrl?.brand.toLowerCase().includes('philips') ||
      newBrand.toLowerCase().includes('signify') ||
      newBrand.toLowerCase().includes('philips')
    );
    const supportsSub = isControllerBmsSupported(newCtrl) || isZXP;

    // Find matching default sub-controller for this brand
    const matchingSub = subControllers.find(s => {
      if (isZXP) {
        return s.brand.toLowerCase().includes('signify') || s.brand.toLowerCase().includes('philips') || s.model.includes('ZXP399');
      }
      return s.brand.toLowerCase().includes(newBrand.toLowerCase());
    }) || subControllers[0];
    
    lineItems.forEach(item => {
      if (getAreaGroup(item.zoneName) === areaName) {
        onUpdateLineItem({
          ...item,
          controllerBrand: newBrand,
          controllerId: newId,
          subControllerBrand: supportsSub ? (matchingSub?.brand || item.subControllerBrand) : undefined,
          subControllerId: supportsSub ? (matchingSub?.id || item.subControllerId) : undefined,
          subControllerQuantity: supportsSub ? (item.subControllerQuantity || 1) : undefined,
          subController2Brand: supportsSub ? item.subController2Brand : undefined,
          subController2Id: supportsSub ? item.subController2Id : undefined,
          subController2Quantity: supportsSub ? item.subController2Quantity : undefined
        });
      }
    });
  };

  // Update Auxiliary / Sub-Controller 1 for an entire Area (e.g., Pharos RIO 84, EDN, DDNG485)
  const handleUpdateAreaSubController = (
    areaName: string,
    newBrand?: string,
    newSubId?: string,
    quantity?: number,
    clear?: boolean
  ) => {
    lineItems.forEach(item => {
      if (getAreaGroup(item.zoneName) === areaName) {
        if (clear) {
          const updated = { ...item };
          delete updated.subControllerBrand;
          delete updated.subControllerQuantity;
          // Set to 'none' to explicitly indicate not using a sub-controller
          updated.subControllerId = 'none';
          onUpdateLineItem(updated);
        } else {
          onUpdateLineItem({
            ...item,
            ...(newBrand !== undefined ? { subControllerBrand: newBrand } : {}),
            ...(newSubId !== undefined ? { subControllerId: newSubId } : {}),
            ...(quantity !== undefined ? { subControllerQuantity: quantity } : {})
          });
        }
      }
    });
  };

  // Update Link Mode for an entire Area
  const handleUpdateAreaSubControllerLinkMode = (
    areaName: string,
    linkMode: 'star' | 'daisy-chain'
  ) => {
    lineItems.forEach(item => {
      if (getAreaGroup(item.zoneName) === areaName) {
        onUpdateLineItem({
          ...item,
          subControllerLinkMode: linkMode
        });
      }
    });
  };

  // Update Auxiliary / Sub-Controller 2 for an entire Area (e.g., Keypads, Sensors, RIO 80)
  const handleUpdateAreaSubController2 = (
    areaName: string,
    newBrand?: string,
    newSubId?: string,
    quantity?: number,
    clear?: boolean
  ) => {
    lineItems.forEach(item => {
      if (getAreaGroup(item.zoneName) === areaName) {
        if (clear) {
          const updated = { ...item };
          delete updated.subController2Brand;
          delete updated.subController2Id;
          delete updated.subController2Quantity;
          onUpdateLineItem(updated);
        } else {
          onUpdateLineItem({
            ...item,
            ...(newBrand !== undefined ? { subController2Brand: newBrand } : {}),
            ...(newSubId !== undefined ? { subController2Id: newSubId } : {}),
            ...(quantity !== undefined ? { subController2Quantity: quantity } : {})
          });
        }
      }
    });
  };

  // Rename an entire Area
  const handleRenameArea = (oldAreaName: string, newAreaName: string) => {
    const trimmedNewName = newAreaName.trim();
    if (!trimmedNewName || oldAreaName === trimmedNewName) return;

    lineItems.forEach(item => {
      if (getAreaGroup(item.zoneName) === oldAreaName) {
        const subLinePart = item.zoneName.includes(' - ') 
          ? item.zoneName.substring(item.zoneName.indexOf(' - ') + 3)
          : (item.zoneName.includes(': ') ? item.zoneName.substring(item.zoneName.indexOf(': ') + 2) : 'Tuyến Đèn');
        onUpdateLineItem({
          ...item,
          zoneName: `${trimmedNewName} - ${subLinePart}`
        });
      }
    });

    if (filterArea === oldAreaName) {
      setFilterArea(trimmedNewName);
    }
    setEditingAreaName(null);
  };

  // Add a new sub-line to a specific area
  const handleAddLineToArea = (areaName: string) => {
    const linesInArea = lineItems.filter(item => getAreaGroup(item.zoneName) === areaName);
    const newIndex = linesInArea.length + 1;
    const defaultLum = luminaires[0] || { brand: 'Griven', id: 'lum-griven-capital600' };
    
    // Inherit the area's existing master controller
    const existingAreaItem = linesInArea[0];
    const defaultCtrlBrand = existingAreaItem ? existingAreaItem.controllerBrand : (controllers[0]?.brand || 'Pharos Controls');
    const defaultCtrlId = existingAreaItem ? existingAreaItem.controllerId : (controllers[0]?.id || 'ctrl-pharos-lpc2');

    const newItem: DesignLineItem = {
      id: `line-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      zoneName: `${areaName} - Tuyến ${newIndex}: Đèn Chiếu Sáng Mới`,
      luminaireBrand: defaultLum.brand,
      luminaireId: defaultLum.id,
      fixtureQuantity: 24,
      controllerBrand: defaultCtrlBrand,
      controllerId: defaultCtrlId,
      subControllerBrand: existingAreaItem?.subControllerBrand,
      subControllerId: existingAreaItem?.subControllerId,
      subControllerQuantity: existingAreaItem?.subControllerQuantity,
      subController2Brand: existingAreaItem?.subController2Brand,
      subController2Id: existingAreaItem?.subController2Id,
      subController2Quantity: existingAreaItem?.subController2Quantity,
      bmsRequired: existingAreaItem?.bmsRequired || 'BACnet IP',
      controllerToFirstFixtureDistance: 50,
      interFixtureDistance: 2.0,
      totalCableLengthMeters: 96
    };

    onUpdateLineItem(newItem);
  };

  // Create a brand new Area with an initial standard line
  const handleCreateNewArea = (customAreaName?: string) => {
    const areaName = customAreaName || `Khu Vực 0${uniqueAreaNames.length + 1}: Facade Khối Mới`;
    const defaultLum = luminaires[0] || { brand: 'Griven', id: 'lum-griven-capital600' };
    const defaultCtrl = controllers[0] || { brand: 'Pharos Controls', id: 'ctrl-pharos-lpc2' };

    const newItem: DesignLineItem = {
      id: `line-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      zoneName: `${areaName} - Tuyến 1: Đèn Chiếu Sáng Chính`,
      luminaireBrand: defaultLum.brand,
      luminaireId: defaultLum.id,
      fixtureQuantity: 30,
      controllerBrand: defaultCtrl.brand,
      controllerId: defaultCtrl.id,
      bmsRequired: 'BACnet IP',
      controllerToFirstFixtureDistance: 60,
      interFixtureDistance: 2.5,
      totalCableLengthMeters: 132.5
    };

    onUpdateLineItem(newItem);
    setFilterArea('ALL');
  };

  // Handle Add Area from Modal
  const handleAddAreaFromModal = (newLine: DesignLineItem, areaName: string) => {
    onUpdateLineItem(newLine);
    setFilterArea('ALL');
  };

  // Delete all lines in an Area
  const handleConfirmDeleteArea = (areaName: string) => {
    const itemsToDelete = lineItems.filter(item => getAreaGroup(item.zoneName) === areaName);
    itemsToDelete.forEach(item => onDeleteLineItem(item.id));
    setAreaToDelete(null);
    if (filterArea === areaName) {
      setFilterArea('ALL');
    }
  };

  // Duplicate an entire Area
  const handleDuplicateArea = (areaName: string) => {
    const itemsToDuplicate = lineItems.filter(item => getAreaGroup(item.zoneName) === areaName);
    const newAreaName = `${areaName} (Bản Sao)`;
    itemsToDuplicate.forEach((item, idx) => {
      const subLinePart = item.zoneName.includes(' - ') 
        ? item.zoneName.substring(item.zoneName.indexOf(' - ') + 3)
        : `Tuyến ${idx + 1}`;
      const newItem: DesignLineItem = {
        ...item,
        id: `line-${Date.now()}-${Math.random().toString(36).substring(2, 5)}-${idx}`,
        zoneName: `${newAreaName} - ${subLinePart}`
      };
      onUpdateLineItem(newItem);
    });
  };

  // Filter areas to display
  const displayedAreas = filterArea === 'ALL'
    ? uniqueAreaNames
    : uniqueAreaNames.filter(a => a === filterArea);

  return (
    <div className="space-y-6">
      {/* Top Banner & Multi-Fixture Zone Engine */}
      <div className="bg-[#0A0A0A] p-4 border border-[#333333] shadow-lg space-y-3">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#00A3FF] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00A3FF]"></span>
              Sheet 03 • Area-Grouped Multi-Line & Central Master Controller Engine
            </div>
            <h2 className="text-xl font-light italic font-serif text-[#F2F2F2] mt-0.5">
              Bảng Chọn & Tính Toán Hệ Thống Đèn Facade Theo Từng Khu Vực
            </h2>
            <p className="text-xs text-[#888888] font-sans mt-0.5 leading-relaxed">
              <strong>1 Bộ Điều Khiển Trung Tâm (Master Controller đặt tại Phòng Server có PC kết nối)</strong> quản lý <strong>nhiều tuyến đèn đa chủng loại</strong> trong cùng 1 Khu Vực. Cột chọn Controller được gom tập trung tại Tiêu đề Khu Vực, tránh lặp lại trên từng hàng.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div 
              className="flex items-center gap-2 bg-[#121212] px-3 py-2 border border-[#2A2A2A] shadow-inner"
              title="Mọi thay đổi trên từng tuyến đèn, khu vực hoặc thiết bị đều được tự động lưu vào LocalStorage"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${isAutoSaving ? 'inline-flex' : 'hidden'}`}></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <div className="flex flex-col">
                <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Auto-Save Bật (LocalStorage)
                </span>
                {lastSavedTime && (
                  <span className="text-[9px] font-mono text-[#888888]">
                    Lưu lúc: <strong className="text-[#CCCCCC]">{lastSavedTime}</strong>
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsAddAreaModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#00A3FF] hover:bg-[#33B5FF] text-black text-xs font-bold uppercase tracking-wider px-4 py-2.5 transition-colors font-sans whitespace-nowrap shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm Khu Vực Mới (Area Zone)</span>
            </button>
          </div>
        </div>

        {/* Quick Area Filter Bar */}
        <div className="pt-2 border-t border-[#222222] flex flex-wrap items-center justify-between gap-2 text-xs font-sans">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-[#888888] font-mono flex items-center gap-1 mr-1">
              <Building2 className="w-3.5 h-3.5 text-[#00A3FF]" />
              Lọc Khu Vực:
            </span>
            <button
              onClick={() => setFilterArea('ALL')}
              className={`px-2.5 py-1 text-[11px] font-mono transition-colors ${
                filterArea === 'ALL'
                  ? 'bg-[#00A3FF] text-black font-bold'
                  : 'bg-[#181818] text-[#888888] hover:text-[#E0E0E0] border border-[#333333]'
              }`}
            >
              Tất Cả ({uniqueAreaNames.length} Khu Vực • {lineItems.length} Tuyến)
            </button>
            {uniqueAreaNames.map(area => {
              const count = lineItems.filter(i => getAreaGroup(i.zoneName) === area).length;
              return (
                <button
                  key={area}
                  onClick={() => setFilterArea(area)}
                  className={`px-2.5 py-1 text-[11px] font-mono transition-colors truncate max-w-[240px] ${
                    filterArea === area
                      ? 'bg-[#00A3FF] text-black font-bold'
                      : 'bg-[#181818] text-[#888888] hover:text-[#E0E0E0] border border-[#333333]'
                  }`}
                  title={area}
                >
                  {area} ({count} Tuyến)
                </button>
              );
            })}
          </div>

          {/* Quick Preset Generator */}
          <div className="flex items-center gap-1.5 text-[11px] text-[#888888]">
            <span className="font-mono text-[#666666]">Mẫu nhanh:</span>
            {AREA_PRESETS.map((preset, pIdx) => (
              <button
                key={pIdx}
                onClick={() => handleCreateNewArea(preset)}
                className="text-[10px] bg-[#141414] hover:bg-[#202020] text-[#AAAAAA] hover:text-[#00A3FF] px-2 py-0.5 border border-[#333333] transition-colors"
                title={`Tạo nhanh khu vực "${preset}"`}
              >
                + {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Area Group Cards List */}
      {displayedAreas.length === 0 ? (
        <div className="bg-[#0D0D0D] border border-[#333333] p-10 text-center space-y-3">
          <Building2 className="w-10 h-10 text-[#555555] mx-auto" />
          <h3 className="text-sm font-bold text-[#CCCCCC] font-sans">Chưa có khu vực nào trong dự án</h3>
          <p className="text-xs text-[#777777] font-sans">
            Bấm vào nút <strong>"+ Thêm Khu Vực Mới"</strong> hoặc chọn một trong các mẫu nhanh ở trên để bắt đầu thiết kế hệ thống Facade.
          </p>
          <button
            onClick={() => setIsAddAreaModalOpen(true)}
            className="px-4 py-2 bg-[#00A3FF] text-black font-bold text-xs uppercase tracking-wider font-mono hover:bg-[#33B5FF] transition-colors"
          >
            + Thêm Khu Vực Đầu Tiên
          </button>
        </div>
      ) : (
        displayedAreas.map((areaName, areaIndex) => {
          const areaLines = areaGroupsMap.get(areaName) || [];
          const firstLine = areaLines[0];
          const areaItem = firstLine ? firstLine.item : null;

          // Resolve active master controller for this Area
          const activeMasterCtrl = controllers.find(c => c.id === areaItem?.controllerId) || firstLine?.controller || controllers.find(c => c.brand === areaItem?.controllerBrand) || controllers[0];
          const masterBrand = activeMasterCtrl?.brand || areaItem?.controllerBrand || 'Pharos Controls';

          // Detect ZXP399 model or Signify/Philips DMX master controller
          const isZXP = Boolean(
            activeMasterCtrl?.model.includes('ZXP399') ||
            activeMasterCtrl?.id.includes('zxp399') ||
            activeMasterCtrl?.brand.toLowerCase().includes('signify') ||
            activeMasterCtrl?.brand.toLowerCase().includes('philips') ||
            masterBrand.toLowerCase().includes('signify') ||
            masterBrand.toLowerCase().includes('philips')
          );

          // Filter controllers by brand for the master dropdown
          const filteredControllersForMaster = controllers.filter(c => {
            if (isZXP) {
              return c.brand.toLowerCase().includes('signify') || c.brand.toLowerCase().includes('philips');
            }
            return c.brand === masterBrand;
          });

          // Sub-Controller 1 & 2 list filtered for this brand
          const subCtrlsByBrand = subControllers.filter(s => {
            if (isZXP) {
              return s.brand.toLowerCase().includes('signify') || 
                     s.brand.toLowerCase().includes('philips') || 
                     s.model.includes('ZXP399');
            }
            return s.brand.toLowerCase().includes(masterBrand.toLowerCase()) ||
                   masterBrand.toLowerCase().includes(s.brand.toLowerCase());
          });

          // Resolve active sub-controller / remote interface device for this Area
          const rawSubId = firstLine?.item?.subControllerId;
          const activeSubId = rawSubId && rawSubId !== 'none'
            ? rawSubId
            : (rawSubId === 'none' ? 'none' : (subCtrlsByBrand[0]?.id || subControllers[0]?.id));
          const isSub1Active = Boolean(activeSubId && activeSubId !== 'none' && subCtrlsByBrand.some(s => s.id === activeSubId));
          const currentSub = isSub1Active ? (subCtrlsByBrand.find(s => s.id === activeSubId) || null) : null;
          const currentSubQty = firstLine?.item?.subControllerQuantity || 1;

          // BMS Support & Protocol Selection for the Area Master Controller
          const isBMSSupported = isControllerBmsSupported(activeMasterCtrl);
          const hasBMS = isBMSSupported;
          const isSubControllerSupported = hasBMS || isZXP;
          const areaBmsProtocol: BMSProtocol = firstLine?.item?.bmsRequired || 'BACnet IP';
          const isNativeBmsSupported = areaBmsProtocol === 'None' || (activeMasterCtrl?.bmsSupport && activeMasterCtrl.bmsSupport.includes(areaBmsProtocol));

          let resolvedBmsCable = 'Không yêu cầu (Standalone)';
          if (areaBmsProtocol === 'BACnet IP' || areaBmsProtocol === 'Modbus TCP' || areaBmsProtocol === 'Ethernet/IP' || areaBmsProtocol === 'MQTT' || areaBmsProtocol === 'Rest API' || areaBmsProtocol === 'Interact Cloud') {
            resolvedBmsCable = 'Cáp Cat6/Cat6A SFTP (RJ45)';
          } else if (areaBmsProtocol === 'BACnet MSTP' || areaBmsProtocol === 'Modbus RTU' || areaBmsProtocol === 'DyNet') {
            resolvedBmsCable = 'Cáp RS485 Shielded 2-Pair (Belden 9841)';
          } else if (areaBmsProtocol === 'KNX') {
            resolvedBmsCable = 'Cáp KNX Bus 2x2x0.8mm²';
          } else if (areaBmsProtocol === 'Bluetooth Mesh') {
            resolvedBmsCable = 'Không dây (Wireless BLE Mesh)';
          }

          // Sub-Controller 2 resolution
          const activeSub2Id = firstLine?.item?.subController2Id;
          const currentSub2 = (activeSub2Id && subCtrlsByBrand.some(s => s.id === activeSub2Id))
            ? subCtrlsByBrand.find(s => s.id === activeSub2Id)
            : null;
          const currentSub2Qty = firstLine?.item?.subController2Quantity || 1;
          const isSub2Active = Boolean(activeSub2Id && currentSub2);

          // Calculate aggregate area metrics
          const totalAreaLines = areaLines.length;
          const totalAreaFixtures = areaLines.reduce((sum, r) => sum + r.item.fixtureQuantity, 0);
          const totalAreaWattage = areaLines.reduce((sum, r) => sum + r.totalWattage, 0);
          const totalAreaAddresses = areaLines.reduce((sum, r) => sum + r.totalAddresses, 0);
          const totalAreaUniverses = areaLines.reduce((sum, r) => sum + r.universesOrLinesNeeded, 0);

          // Universe Capacities (Cộng dồn Master + Sub-Controller Nodes)
          const masterCapacityUniverses = activeMasterCtrl?.portsCount || 1;
          const sub1CapacityUniverses = (isSubControllerSupported && isSub1Active && currentSub) ? ((currentSub.portsCount || 0) * currentSubQty) : 0;
          const sub2CapacityUniverses = (isSubControllerSupported && isSub2Active && currentSub2) ? ((currentSub2.portsCount || 0) * currentSub2Qty) : 0;
          const totalSubCapacityUniverses = sub1CapacityUniverses + sub2CapacityUniverses;
          const totalCombinedCapacityUniverses = masterCapacityUniverses + totalSubCapacityUniverses;

          const capacityPercent = Math.min(100, Math.round((totalAreaUniverses / totalCombinedCapacityUniverses) * 100));

          return (
            <div
              key={areaName}
              className="bg-[#0A0A0A] border-2 border-[#2A2A2A] hover:border-[#383838] transition-colors shadow-2xl overflow-hidden"
            >
              {/* AREA HEADER BAR: Master Controller & Area Summary */}
              <div className="bg-[#121212] p-4 border-b border-[#2A2A2A] space-y-3">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  {/* Area Title & Edit */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-[#00A3FF]/15 text-[#00A3FF] border border-[#00A3FF]/40 font-mono font-bold text-[11px] uppercase">
                        KHU VỰC 0{areaIndex + 1}
                      </span>
                      <span className="text-xs text-[#888888] font-mono">
                        ({totalAreaLines} Tuyến Đèn • {totalAreaFixtures} Đèn • {(totalAreaWattage / 1000).toFixed(2)} kW)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-amber-400 shrink-0" />
                      <input
                        type="text"
                        defaultValue={areaName}
                        onBlur={e => handleRenameArea(areaName, e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            handleRenameArea(areaName, e.currentTarget.value);
                            e.currentTarget.blur();
                          }
                        }}
                        className="bg-transparent text-lg font-bold text-[#F2F2F2] border-b border-transparent hover:border-[#444444] focus:border-[#00A3FF] focus:bg-[#181818] px-1 py-0.5 focus:outline-none w-full max-w-xl transition-colors font-sans"
                        title="Nhấp vào để đổi tên khu vực (Bấm Enter hoặc nhấp ra ngoài để lưu)"
                      />
                      <button
                        onClick={() => setEditingAreaName({ oldName: areaName, currentName: areaName })}
                        className="p-1 text-[#888888] hover:text-[#00A3FF] transition-colors"
                        title="Đổi tên khu vực"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Area Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleAddLineToArea(areaName)}
                      className="flex items-center gap-1 bg-[#00A3FF]/20 hover:bg-[#00A3FF] text-[#00A3FF] hover:text-black border border-[#00A3FF]/40 px-3 py-1.5 text-xs font-mono font-bold uppercase transition-colors"
                      title={`Thêm 1 tuyến đèn mới vào khu vực ${areaName}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Tuyến Đèn</span>
                    </button>

                    <button
                      onClick={() => handleDuplicateArea(areaName)}
                      className="p-1.5 bg-[#1C1C1C] hover:bg-[#282828] text-[#CCCCCC] hover:text-[#00A3FF] border border-[#333333] transition-colors"
                      title={`Nhân bản toàn bộ Khu Vực ${areaName}`}
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setAreaToDelete({ name: areaName, linesCount: totalAreaLines, powerKW: totalAreaWattage / 1000 })}
                      className="p-1.5 bg-[#1C1C1C] hover:bg-red-950/80 text-[#CCCCCC] hover:text-red-400 border border-[#333333] transition-colors"
                      title={`Xóa Khu Vực ${areaName}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* CENTRAL MASTER CONTROLLER SELECTION & BMS HUB */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 pt-3 border-t border-[#1F1F1F]">
                  {/* 1. Master Controller & Auxiliary / Remote I/O Interface Selection Box (Col 1-5) */}
                  <div className="lg:col-span-5 bg-[#0D0D0D] p-3 border border-[#262626] space-y-2.5">
                    {/* 1.1 Master Controller Header & Selectors */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between border-b border-[#222222] pb-1.5">
                        <span className="text-[10px] font-mono uppercase text-amber-400 font-bold flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-amber-400" />
                          1. Bộ Điều Khiển Trung Tâm (Master Server Room PC)
                        </span>
                        <span className="text-[9px] font-mono text-[#888888]">
                          Master Controller ({totalAreaLines} tuyến)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs font-mono">
                        {/* Controller Brand Dropdown */}
                        <div className="sm:col-span-4 flex flex-col gap-1">
                          <span className="text-[9px] text-[#888888] uppercase font-sans">Hãng Điều Khiển:</span>
                          <select
                            value={masterBrand}
                            onChange={e => {
                              const newBrand = e.target.value;
                              const brandCtrls = controllers.filter(c => c.brand === newBrand);
                              const newCtrlId = brandCtrls.length > 0 ? brandCtrls[0].id : '';
                              handleUpdateAreaMasterController(areaName, newBrand, newCtrlId);
                            }}
                            className="bg-[#161616] text-[#00A3FF] text-xs px-2 py-1.5 border border-[#333333] font-bold focus:outline-none focus:border-[#00A3FF]"
                          >
                            {controllerBrands.map(b => (
                              <option key={b} value={b} className="bg-[#141414] text-[#E0E0E0]">{b}</option>
                            ))}
                          </select>
                        </div>

                        {/* Controller Model Dropdown */}
                        <div className="sm:col-span-8 flex flex-col gap-1">
                          <span className="text-[9px] text-[#888888] uppercase font-sans">Model Master Controller:</span>
                          <select
                            value={activeMasterCtrl?.id || ''}
                            onChange={e => {
                              const selectedCtrl = controllers.find(c => c.id === e.target.value);
                              const brand = selectedCtrl ? selectedCtrl.brand : masterBrand;
                              handleUpdateAreaMasterController(areaName, brand, e.target.value);
                            }}
                            className="bg-[#161616] text-amber-400 text-xs px-2 py-1.5 border border-[#333333] font-bold focus:outline-none focus:border-amber-400"
                          >
                            {filteredControllersForMaster.map(c => (
                              <option key={c.id} value={c.id} className="bg-[#141414] text-[#E0E0E0]">
                                {c.model} ({c.portsCount} Ports/Univ • {c.protocol})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Master Specs Bar */}
                      <div className="pt-1 flex flex-wrap items-center justify-between gap-1 text-[10px] font-mono text-[#888888] bg-[#141414] px-2 py-1 border border-[#1E1E1E]">
                        <span>Chuẩn lắp: <strong className="text-[#F2F2F2]">{activeMasterCtrl?.rackUnit || '1U Rackmount'}</strong></span>
                        <span>Nguồn: <strong className="text-[#F2F2F2]">{activeMasterCtrl?.voltageInput}</strong></span>
                        {activeMasterCtrl?.product12NC && (
                          <span>12NC: <strong className="text-amber-400">{activeMasterCtrl.product12NC}</strong></span>
                        )}
                      </div>
                    </div>

                    {/* 1.2 Auxiliary / Remote Interface Device Selection (Pharos RIO 84, RIO 80, EDN, DDNG485, Keypads, ZXP399 Sub-Controllers...) */}
                    {(() => {
                      const isSubAllowed = hasBMS || isZXP;

                      // Sub-Controller 1 & 2 strictly inherit master controller's brand
                      const subCtrlsByBrand = subControllers.filter(s => {
                        if (isZXP) {
                          return s.brand.toLowerCase().includes('signify') || 
                                 s.brand.toLowerCase().includes('philips') || 
                                 s.model.includes('ZXP399');
                        }
                        return s.brand.toLowerCase().includes(masterBrand.toLowerCase()) ||
                               masterBrand.toLowerCase().includes(s.brand.toLowerCase());
                      });

                      // Sub-Controller 1 resolution
                      const rawSubId = firstLine?.item?.subControllerId;
                      const activeSubId = rawSubId && rawSubId !== 'none'
                        ? rawSubId
                        : (rawSubId === 'none' ? 'none' : (subCtrlsByBrand[0]?.id || ''));
                      const isSub1Active = Boolean(activeSubId && activeSubId !== 'none' && subCtrlsByBrand.some(s => s.id === activeSubId));
                      const currentSub = isSub1Active ? (subCtrlsByBrand.find(s => s.id === activeSubId) || null) : null;
                      const currentSubQty = firstLine?.item?.subControllerQuantity || 1;

                      // Sub-Controller 2 resolution (Thiết Bị Phụ Trợ 2)
                      const activeSub2Id = firstLine?.item?.subController2Id;
                      const currentSub2 = (activeSub2Id && subCtrlsByBrand.some(s => s.id === activeSub2Id))
                        ? subCtrlsByBrand.find(s => s.id === activeSub2Id)
                        : null;
                      const currentSub2Qty = firstLine?.item?.subController2Quantity || 1;
                      const isSub2Active = Boolean(activeSub2Id && currentSub2);

                      if (!isSubAllowed) {
                        return (
                          <div className="pt-2 border-t border-[#222222] space-y-2 bg-[#0F0F0F] p-3 border border-[#1E1E1E]">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono uppercase text-[#777777] font-bold flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5 text-amber-500" />
                                2. Thiết Bị Phụ Trợ / Giao Tiếp I/O (Bị Khóa - Standalone)
                              </span>
                              <span className="text-[9px] font-mono text-amber-400 bg-amber-950/40 px-1.5 py-0.5 border border-amber-800/40 flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" />
                                Không hỗ trợ kết nối BMS
                              </span>
                            </div>

                            <div className="bg-[#141414] border border-[#252525] p-2.5 text-center space-y-1">
                              <p className="text-xs text-amber-300 font-mono font-medium">
                                Bộ điều khiển <strong className="text-white">"{activeMasterCtrl?.model}"</strong> là dòng hoạt động độc lập (Standalone / Tích hợp sẵn), không hỗ trợ ghép nối BMS qua thiết bị giao tiếp trung gian.
                              </p>
                              <p className="text-[10px] text-[#888888] font-sans">
                                Mục chọn thiết bị giao tiếp phụ trợ được tự động khóa để đảm bảo độ chính xác của dự toán BOQ.
                              </p>
                            </div>
                          </div>
                        );
                      }

                      if (subCtrlsByBrand.length === 0) {
                        return (
                          <div className="pt-2 border-t border-[#222222] space-y-2 bg-[#0F0F0F] p-3 border border-[#1E1E1E]">
                            <div className="text-[10px] font-mono uppercase text-[#888888] font-bold">
                              2. Thiết Bị Hỗ Trợ Giao Tiếp (Hãng {masterBrand})
                            </div>
                            <div className="bg-[#141414] border border-[#222222] p-2 text-xs text-[#888888] font-mono">
                              Hãng {masterBrand} không có thiết bị giao tiếp trung gian riêng (Controller điều khiển trực tiếp).
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div className="pt-2 border-t border-[#222222] space-y-3 bg-[#0F0F0F] p-2.5 border border-[#1E1E1E]">
                          {/* --- SUB-CONTROLLER 1 (Primary Communication & Interface Device) --- */}
                          {isSub1Active ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono uppercase text-purple-400 font-bold flex items-center gap-1.5">
                                  <Network className="w-3.5 h-3.5 text-purple-400" />
                                  2. Thiết Bị Hỗ Trợ Giao Tiếp 1 (BMS / Màn Hình / Bàn Phím / Remote I/O / Mạng)
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateAreaSubController(areaName, undefined, undefined, undefined, true)}
                                    className="text-[10px] font-mono text-red-400 hover:text-red-300 flex items-center gap-1 hover:underline px-1.5 py-0.5 bg-red-950/30 border border-red-800/40"
                                    title="Xóa thiết bị giao tiếp thứ 1 khỏi khu vực này"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Xóa Dòng 1</span>
                                  </button>
                                  <span className="text-[9px] font-mono text-purple-300 bg-purple-950/50 px-1.5 py-0.5 border border-purple-800/40">
                                    VD: ActiveSite / RIO 84 / Màn hình / Keypad
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs font-mono">
                                {/* Sub Controller Model */}
                                <div className="sm:col-span-6 flex flex-col gap-1">
                                  <span className="text-[9px] text-[#888888] uppercase font-sans">
                                    Thiết Bị Giao Tiếp 1 (Hãng {masterBrand}):
                                  </span>
                                  <select
                                    value={activeSubId}
                                    onChange={e => {
                                      handleUpdateAreaSubController(areaName, masterBrand, e.target.value, currentSubQty);
                                    }}
                                    className="bg-[#161616] text-[#F2F2F2] text-xs px-2 py-1.5 border border-[#333333] font-bold focus:outline-none focus:border-purple-400 truncate"
                                    title={currentSub?.name || ''}
                                  >
                                    {subCtrlsByBrand.map(s => (
                                      <option key={s.id} value={s.id} className="bg-[#141414] text-[#E0E0E0]">
                                        {s.model} ({s.portsCount} I/O-Ports • {s.voltageInput}) — {s.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Sub Controller Quantity */}
                                <div className="sm:col-span-2 flex flex-col gap-1">
                                  <span className="text-[9px] text-[#888888] uppercase font-sans">Số Lượng:</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={currentSubQty}
                                    onChange={e => {
                                      const q = Math.max(1, parseInt(e.target.value) || 1);
                                      handleUpdateAreaSubController(areaName, masterBrand, activeSubId, q);
                                    }}
                                    className="bg-[#161616] text-purple-300 text-xs px-2 py-1.5 border border-[#333333] font-bold text-center focus:outline-none focus:border-purple-400"
                                  />
                                </div>

                                {/* Link Mode Selector */}
                                <div className="sm:col-span-4 flex flex-col gap-1">
                                  <span className="text-[9px] text-[#888888] uppercase font-sans">Liên kết Node (Topology):</span>
                                  <select
                                    value={firstLine?.item?.subControllerLinkMode || 'star'}
                                    onChange={e => {
                                      handleUpdateAreaSubControllerLinkMode(areaName, e.target.value as 'star' | 'daisy-chain');
                                    }}
                                    className="bg-[#161616] text-[#00A3FF] text-xs px-2 py-1.5 border border-[#333333] font-bold focus:outline-none focus:border-blue-400"
                                    title="Cách liên kết thiết bị phụ trợ về Master"
                                  >
                                    <option value="star">★ Sao (Ethernet/Cat6)</option>
                                    <option value="daisy-chain">⛓ Tiếp sức (Cáp AWG)</option>
                                  </select>
                                </div>
                              </div>

                              {/* Sub 1 Specs & Description Detail Bar */}
                              {currentSub && (
                                <div className="p-1.5 bg-[#141414] border border-[#222222] space-y-1 text-[10px] font-mono">
                                  <div className="flex flex-wrap items-center justify-between gap-1 text-[#AAAAAA]">
                                    <span>Tên: <strong className="text-[#F2F2F2]">{currentSub.name}</strong></span>
                                    <span className="text-emerald-400 font-bold">
                                      {(currentSub.priceVND / 1000000).toFixed(1)}M VNĐ/Bộ
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap items-center justify-between gap-2 text-[9px] text-[#777777] pt-0.5 border-t border-[#1C1C1C]">
                                    <span>Ports/Kênh: <strong className="text-purple-400">{currentSub.portsCount} Ports</strong></span>
                                    <span>Nguồn: <strong className="text-[#CCCCCC]">{currentSub.voltageInput}</strong></span>
                                    <span className="text-[#888888] truncate max-w-[280px]" title={currentSub.notes}>
                                      {currentSub.notes}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="pt-1 flex items-center justify-start">
                              <button
                                type="button"
                                onClick={() => {
                                  const defaultSub = subCtrlsByBrand[0];
                                  if (defaultSub) {
                                    handleUpdateAreaSubController(areaName, masterBrand, defaultSub.id, 1);
                                  }
                                }}
                                className="flex items-center gap-1.5 text-[10px] font-mono text-purple-300 hover:text-purple-200 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-700/40 px-2.5 py-1 transition-colors"
                                title="Thêm 1 thiết bị giao tiếp thứ 1 (vd: ActiveSite, RIO 84, Gateway BMS, Màn hình...)"
                              >
                                <PlusCircle className="w-3.5 h-3.5 text-purple-400" />
                                <span>+ Thêm Thiết Bị Giao Tiếp 1 (Phần cứng I/O, Remote Node, Gateway)</span>
                              </button>
                            </div>
                          )}

                          {/* --- SUB-CONTROLLER 2 (Secondary Interface / Keypad / Touchscreen / Remote I/O) --- */}
                          {isSub2Active ? (
                            <div className="pt-2 border-t border-dashed border-[#2A2A2A] space-y-2 bg-[#121016] p-2 border border-indigo-900/30">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold flex items-center gap-1.5">
                                  <Radio className="w-3.5 h-3.5 text-indigo-400" />
                                  3. Thiết Bị Hỗ Trợ Giao Tiếp 2 (BMS / Màn Hình / Bàn Phím / Remote I/O / Mạng)
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateAreaSubController2(areaName, undefined, undefined, undefined, true)}
                                  className="text-[10px] font-mono text-red-400 hover:text-red-300 flex items-center gap-1 hover:underline px-1.5 py-0.5 bg-red-950/30 border border-red-800/40"
                                  title="Xóa thiết bị giao tiếp thứ 2 khỏi khu vực này"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Xóa Dòng 2</span>
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs font-mono">
                                {/* Sub Controller 2 Model */}
                                <div className="sm:col-span-10 flex flex-col gap-1">
                                  <span className="text-[9px] text-[#888888] uppercase font-sans">
                                    Thiết Bị Giao Tiếp 2 (Hãng {masterBrand}):
                                  </span>
                                  <select
                                    value={currentSub2?.id || (subCtrlsByBrand[0]?.id || '')}
                                    onChange={e => {
                                      handleUpdateAreaSubController2(areaName, masterBrand, e.target.value, currentSub2Qty);
                                    }}
                                    className="bg-[#161616] text-[#F2F2F2] text-xs px-2 py-1.5 border border-[#333333] font-bold focus:outline-none focus:border-indigo-400 truncate"
                                    title={currentSub2?.name}
                                  >
                                    {subCtrlsByBrand.map(s => (
                                      <option key={s.id} value={s.id} className="bg-[#141414] text-[#E0E0E0]">
                                        {s.model} ({s.portsCount} Ports • {s.voltageInput}) — {s.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Sub Controller 2 Quantity */}
                                <div className="sm:col-span-2 flex flex-col gap-1">
                                  <span className="text-[9px] text-[#888888] uppercase font-sans">Số Lượng:</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={currentSub2Qty}
                                    onChange={e => {
                                      const q = Math.max(1, parseInt(e.target.value) || 1);
                                      handleUpdateAreaSubController2(areaName, masterBrand, currentSub2?.id, q);
                                    }}
                                    className="bg-[#161616] text-indigo-300 text-xs px-2 py-1.5 border border-[#333333] font-bold text-center focus:outline-none focus:border-indigo-400"
                                  />
                                </div>
                              </div>

                              {/* Sub 2 Specs Bar */}
                              {currentSub2 && (
                                <div className="p-1.5 bg-[#141414] border border-[#222222] space-y-1 text-[10px] font-mono">
                                  <div className="flex flex-wrap items-center justify-between gap-1 text-[#AAAAAA]">
                                    <span>Tên: <strong className="text-[#F2F2F2]">{currentSub2.name}</strong></span>
                                    <span className="text-emerald-400 font-bold">
                                      {(currentSub2.priceVND / 1000000).toFixed(1)}M VNĐ/Bộ
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap items-center justify-between gap-2 text-[9px] text-[#777777] pt-0.5 border-t border-[#1C1C1C]">
                                    <span>Ports: <strong className="text-indigo-400">{currentSub2.portsCount} Ports</strong></span>
                                    <span>Nguồn: <strong className="text-[#CCCCCC]">{currentSub2.voltageInput}</strong></span>
                                    <span className="text-[#888888] truncate max-w-[280px]" title={currentSub2.notes}>
                                      {currentSub2.notes}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="pt-1 flex items-center justify-start">
                              <button
                                type="button"
                                onClick={() => {
                                  const defaultSub2 = subCtrlsByBrand.length > 1 ? subCtrlsByBrand[1] : subCtrlsByBrand[0];
                                  if (defaultSub2) {
                                    handleUpdateAreaSubController2(areaName, masterBrand, defaultSub2.id, 1);
                                  }
                                }}
                                className="flex items-center gap-1.5 text-[10px] font-mono text-indigo-300 hover:text-indigo-200 bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-700/40 px-2.5 py-1 transition-colors"
                                title="Thêm 1 thiết bị giao tiếp thứ 2 (vd: Màn hình cảm ứng TPS/Envision, Bàn phím BPS/Antumbra, Sensor hoặc Gateway BMS)"
                              >
                                <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
                                <span>+ Thêm 1 thiết bị giao tiếp 2 (Màn hình / Bàn phím / Remote / Gateway)</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* 2. Area Real-time Capacity Gauge (Col 6-8) */}
                  <div className="lg:col-span-4 bg-[#0D0D0D] p-3 border border-[#262626] flex flex-col justify-between space-y-2">
                    <div className="flex items-center justify-between border-b border-[#222222] pb-1">
                      <span className="text-[10px] font-mono uppercase text-[#00A3FF] font-bold flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-[#00A3FF]" />
                        Dung Lượng Tải Khu Vực ({areaName})
                      </span>
                      <span className={`text-[10px] font-mono font-bold ${
                        totalAreaUniverses > totalCombinedCapacityUniverses ? 'text-red-400' : 'text-emerald-400'
                      }`}>
                        {totalAreaUniverses} / {totalCombinedCapacityUniverses} Universes ({capacityPercent}%)
                      </span>
                    </div>

                    {/* Universe Summation Breakdown Badges */}
                    <div className="flex flex-wrap items-center gap-1 text-[9px] font-mono">
                      <span className="px-1.5 py-0.5 bg-amber-950/40 text-amber-300 border border-amber-800/40 font-bold" title={`Master Controller ${activeMasterCtrl?.model} cung cấp ${masterCapacityUniverses} Universes`}>
                        Master: {masterCapacityUniverses} Univ
                      </span>

                      {sub1CapacityUniverses > 0 && (
                        <span className="px-1.5 py-0.5 bg-purple-950/40 text-purple-300 border border-purple-800/40 font-bold flex items-center gap-0.5" title={`Cộng dồn ${sub1CapacityUniverses} Universes từ ${currentSubQty} bộ ${currentSub?.model} (${currentSub?.portsCount} Ports/bộ)`}>
                          <span>+ {sub1CapacityUniverses} Univ</span>
                          <span className="text-[8px] text-purple-400">({currentSubQty}x {currentSub?.model} • {currentSub?.portsCount}P)</span>
                        </span>
                      )}

                      {sub2CapacityUniverses > 0 && (
                        <span className="px-1.5 py-0.5 bg-indigo-950/40 text-indigo-300 border border-indigo-800/40 font-bold flex items-center gap-0.5" title={`Cộng dồn ${sub2CapacityUniverses} Universes từ ${currentSub2Qty} bộ ${currentSub2?.model}`}>
                          <span>+ {sub2CapacityUniverses} Univ</span>
                          <span className="text-[8px] text-indigo-400">({currentSub2Qty}x {currentSub2?.model})</span>
                        </span>
                      )}

                      <span className="px-1.5 py-0.5 bg-emerald-950/50 text-emerald-300 border border-emerald-800/40 font-bold ml-auto" title={`Tổng dung lượng vũ trụ khả dụng đã cộng dồn: ${totalCombinedCapacityUniverses} Universes`}>
                        = Tổng {totalCombinedCapacityUniverses} Univ
                      </span>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full bg-[#181818] h-2 border border-[#333333] overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            totalAreaUniverses > totalCombinedCapacityUniverses 
                              ? 'bg-red-500' 
                              : capacityPercent > 80 
                                ? 'bg-amber-400' 
                                : 'bg-[#00A3FF]'
                          }`}
                          style={{ width: `${Math.min(100, (totalAreaUniverses / totalCombinedCapacityUniverses) * 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[9px] font-mono text-[#888888]">
                        <span>Tổng Địa Chỉ: <strong className="text-purple-400">{totalAreaAddresses} addrs</strong></span>
                        <span>Tổng Tải: <strong className="text-amber-400">{(totalAreaWattage / 1000).toFixed(2)} kW</strong></span>
                      </div>
                    </div>

                    {/* Capacity Evaluation Message */}
                    <div className="text-[10px] font-sans">
                      {totalAreaUniverses > totalCombinedCapacityUniverses ? (
                        <div className="text-red-400 flex items-start gap-1 font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                          <span>Vượt dung lượng ({totalAreaUniverses} &gt; {totalCombinedCapacityUniverses} Univ). Cần thêm Sub-Controller (EDN/Node) hoặc nâng cấp Master Controller!</span>
                        </div>
                      ) : (
                        <div className="text-emerald-400 flex items-start gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>
                            Đảm bảo điều khiển mượt mà ({totalAreaUniverses}/{totalCombinedCapacityUniverses} Universes).
                            {totalSubCapacityUniverses > 0 ? ` Đã cộng dồn +${totalSubCapacityUniverses} Universes từ ${currentSubQty} bộ ${currentSub?.model}${isSub2Active ? ` và ${currentSub2Qty} bộ ${currentSub2?.model}` : ''}.` : ' Master Controller đáp ứng đầy đủ.'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3. BMS Integration Hub & Cabling Guide (Col 9-12) */}
                  <div className="lg:col-span-3 bg-[#0D0D0D] p-3 border border-[#262626] flex flex-col justify-between space-y-2">
                    <div className="flex items-center justify-between border-b border-[#222222] pb-1.5">
                      <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                        <Network className="w-3.5 h-3.5 text-emerald-400" />
                        3. Giao Thức Kết Nối BMS (Master Hub)
                      </span>
                      <button
                        onClick={() => {
                          const activeSub2Id = firstLine?.item?.subController2Id;
                          const currentSub2 = activeSub2Id ? subControllers.find(s => s.id === activeSub2Id) : null;
                          const currentSub2Qty = firstLine?.item?.subController2Quantity || 1;

                          setActiveBMSModalController({
                            controller: activeMasterCtrl,
                            subController: currentSub,
                            subControllerQuantity: currentSubQty,
                            subController2: currentSub2,
                            subController2Quantity: currentSub2Qty,
                            areaName
                          });
                        }}
                        className="text-[10px] text-[#00A3FF] hover:underline font-mono flex items-center gap-0.5 shrink-0"
                        title="Xem sơ đồ nguyên lý đấu nối BMS chi tiết"
                      >
                        <span>Xem Sơ Đồ</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* BMS Protocol Selector for Entire Area Master Controller */}
                    <div className="space-y-1.5 font-mono text-xs">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-[#888888] uppercase font-sans">
                          Chuẩn Giao Thức BMS Yêu Cầu:
                        </span>
                        <select
                          value={areaBmsProtocol}
                          onChange={e => handleUpdateAreaBmsProtocol(areaName, e.target.value as BMSProtocol)}
                          className="bg-[#161616] text-emerald-400 text-xs px-2 py-1.5 border border-[#333333] font-bold focus:outline-none focus:border-emerald-400"
                        >
                          <option value="None" className="bg-[#141414] text-[#E0E0E0]">None (Standalone - Chạy Độc Lập)</option>
                          <option value="BACnet IP" className="bg-[#141414] text-[#E0E0E0]">BACnet IP (Chuẩn Server Phòng BMS)</option>
                          <option value="BACnet MSTP" className="bg-[#141414] text-[#E0E0E0]">BACnet MS/TP (RS-485 Serial)</option>
                          <option value="Modbus TCP" className="bg-[#141414] text-[#E0E0E0]">Modbus TCP (Mạng LAN Ethernet)</option>
                          <option value="Modbus RTU" className="bg-[#141414] text-[#E0E0E0]">Modbus RTU (RS-485 2-Wire)</option>
                          <option value="KNX" className="bg-[#141414] text-[#E0E0E0]">KNX (Building Automation Bus)</option>
                          <option value="Ethernet/IP" className="bg-[#141414] text-[#E0E0E0]">Ethernet/IP</option>
                          <option value="MQTT" className="bg-[#141414] text-[#E0E0E0]">MQTT (Smart Cloud Platform)</option>
                          <option value="Rest API" className="bg-[#141414] text-[#E0E0E0]">Rest API (Web Service)</option>
                        </select>
                      </div>

                      {/* Native Support vs Gateway Status Badge */}
                      <div className="p-1.5 bg-[#141414] border border-[#222222] space-y-1 text-[10px]">
                        <div className="flex items-center justify-between">
                          <span className="text-[#888888]">Tương Thích:</span>
                          {areaBmsProtocol === 'None' ? (
                            <span className="text-[#888888] font-semibold">Độc lập (Local)</span>
                          ) : isNativeBmsSupported ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                              <span>✓ Tích hợp sẵn</span>
                            </span>
                          ) : (
                            <span className="text-amber-400 font-bold flex items-center gap-0.5" title="Tự động bóc tách thêm 1 bộ BMS Gateway vào BOQ">
                              <span>⚠️ Cần BMS Gateway</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-0.5 border-t border-[#1F1F1F]">
                          <span className="text-[#888888]">Cáp BMS:</span>
                          <span className="font-bold text-[#00A3FF] truncate max-w-[150px]" title={resolvedBmsCable}>
                            {resolvedBmsCable}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const activeSub2Id = firstLine?.item?.subController2Id;
                        const currentSub2 = activeSub2Id ? subControllers.find(s => s.id === activeSub2Id) : null;
                        const currentSub2Qty = firstLine?.item?.subController2Quantity || 1;

                        setActiveBMSModalController({
                          controller: activeMasterCtrl,
                          subController: currentSub,
                          subControllerQuantity: currentSubQty,
                          subController2: currentSub2,
                          subController2Quantity: currentSub2Qty,
                          areaName
                        });
                      }}
                      className="w-full bg-[#181818] hover:bg-[#222222] text-[#CCCCCC] hover:text-white py-1 px-2 border border-[#333333] text-[10px] font-mono flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Cable className="w-3 h-3 text-[#00A3FF]" />
                      <span>Chi Tiết Đấu Nối Cáp BMS</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* SUB-LINES SPREADSHEET TABLE FOR THIS AREA */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#161616] text-[#888888] text-[9px] uppercase font-mono font-bold tracking-wider border-b border-[#2A2A2A] select-none">
                      <th className="p-2.5 w-8 text-center">#</th>
                      <th className="p-2.5 min-w-[200px]">Tên Tuyến Đèn Trong Khu Vực</th>
                      <th className="p-2.5 min-w-[260px]">Hãng & Mã Đèn + Tùy Chọn Kỹ Thuật (Luminaires)</th>
                      <th className="p-2.5 w-16 text-center">Số Lượng</th>
                      <th className="p-2.5 min-w-[200px]">Thiết Bị ĐK Phụ / Tủ Tầng (Sub-Node / Splitter)</th>
                      <th className="p-2.5 min-w-[220px]">Độ Dài Dây & Khoảng Cách Tuyến (m)</th>
                      <th className="p-2.5 min-w-[180px] bg-[#0E0E0E] text-[#00A3FF]">Tải Tuyến Đèn</th>
                      <th className="p-2.5 min-w-[200px] bg-[#0E0E0E] text-purple-400">Trộn Nguồn & Amplifiers</th>
                      <th className="p-2.5 min-w-[170px] bg-[#0E0E0E] text-[#CCCCCC]">Health Check</th>
                      <th className="p-2.5 w-14 text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#1F1F1F] text-[#E0E0E0]">
                    {areaLines.map((res, lineIdx) => {
                      const item = res.item;
                      const filteredLuminairesForRow = luminaires.filter(l => l.brand === item.luminaireBrand);

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-[#131313] transition-colors group"
                        >
                          {/* STT */}
                          <td className="p-2.5 text-center font-mono text-[#555555] font-semibold">
                            {lineIdx + 1}
                          </td>

                          {/* 1. Sub-line Name */}
                          <td className="p-2.5 space-y-1 font-sans">
                            <input
                              type="text"
                              value={item.zoneName}
                              onChange={e => onUpdateLineItem({ ...item, zoneName: e.target.value })}
                              className="w-full bg-[#141414] text-[#F2F2F2] text-xs px-2 py-1.5 border border-[#333333] focus:outline-none focus:border-[#00A3FF] font-medium"
                              placeholder="Nhập tên tuyến đèn..."
                            />
                            <div className="text-[9px] text-[#777777] font-mono flex items-center gap-1">
                              <span>Thuộc Master:</span>
                              <strong className="text-amber-400">{activeMasterCtrl?.model}</strong>
                            </div>
                          </td>

                          {/* 2. Luminaire Brand, Model & Technical Variants */}
                          <td className="p-2.5 space-y-1.5 font-mono">
                            {/* Brand & Model Selectors */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                              <select
                                value={item.luminaireBrand}
                                onChange={e => {
                                  const newBrand = e.target.value;
                                  const newLums = luminaires.filter(l => l.brand === newBrand);
                                  const newLumId = newLums.length > 0 ? newLums[0].id : '';
                                  onUpdateLineItem({
                                    ...item,
                                    luminaireBrand: newBrand,
                                    luminaireId: newLumId
                                  });
                                }}
                                className="bg-[#141414] text-amber-400 text-[11px] px-1.5 py-1 border border-[#333333] font-bold focus:outline-none"
                              >
                                {luminaireBrands.map(b => (
                                  <option key={b} value={b} className="bg-[#141414] text-[#E0E0E0]">{b}</option>
                                ))}
                              </select>

                              <select
                                value={item.luminaireId}
                                onChange={e => onUpdateLineItem({ ...item, luminaireId: e.target.value })}
                                className="bg-[#141414] text-[#00A3FF] text-[11px] px-1.5 py-1 border border-[#333333] font-bold focus:outline-none"
                              >
                                {filteredLuminairesForRow.map(l => (
                                  <option key={l.id} value={l.id} className="bg-[#141414] text-[#E0E0E0]">
                                    {l.model} ({l.wattage}W)
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Technical Variants (Wattage, Beam Angle, CCT, AC/DC Voltage) */}
                            {(() => {
                              const currentFixture = res.fixture || luminaires[0];
                              const wattagesList = currentFixture.availableWattages || [6, 12, 18, 24, 30, 36, 45, 50, 60, 74, 100, 120, 150, 200, 300];
                              const beamAnglesList = currentFixture.availableBeamAngles || ['5°', '8°', '10°', '12°', '15°', '20°', '25°', '30°', '45°', '60°', '10°x60°', '15°x40°', 'Asymmetric', '120° Diffuse'];
                              const colorTempsList = currentFixture.availableColorTemps || ['2700K', '3000K', '4000K', '5000K', '6500K', 'Tunable White', 'RGB', 'RGBW', 'RGBA', 'IntelliHue'];
                              const voltagesList = currentFixture.availableVoltages || ['220V AC', '100-277V AC Powercore', '24V DC', '48V DC'];

                              const selectedWatt = item.selectedWattage !== undefined ? item.selectedWattage : currentFixture.wattage;
                              const selectedBeam = item.selectedBeamAngle || currentFixture.beamAngle || beamAnglesList[0];
                              const selectedColor = item.selectedColorTemp || currentFixture.colorTemp || colorTempsList[0];
                              const selectedVolt = item.selectedVoltage || currentFixture.voltage || voltagesList[0];

                              const isStrip = isLedStrip(currentFixture);

                              return (
                                <div className="p-1.5 bg-[#0D0D0D] border border-[#222222] rounded-none space-y-1 text-[9px]">
                                  <div className="font-mono text-amber-400 font-bold flex items-center justify-between">
                                    <span>Mã Đặt Hàng Chính Xác:</span>
                                    <span className="text-[#888888] font-normal truncate max-w-[130px]" title={res.exactModelCode}>
                                      {res.exactModelCode}
                                    </span>
                                  </div>

                                  <div className={`grid ${isStrip ? 'grid-cols-3' : 'grid-cols-4'} gap-1 font-mono`}>
                                    {/* Wattage */}
                                    <select
                                      value={selectedWatt}
                                      onChange={e => onUpdateLineItem({ ...item, selectedWattage: parseFloat(e.target.value) || selectedWatt })}
                                      className="bg-[#181818] text-amber-300 text-[9px] px-1 py-0.5 border border-[#333333] font-bold focus:outline-none"
                                      title="Công suất (W)"
                                    >
                                      {wattagesList.includes(currentFixture.wattage) ? null : (
                                        <option value={currentFixture.wattage}>{currentFixture.wattage}W</option>
                                      )}
                                      {wattagesList.map(w => (
                                        <option key={w} value={w}>{w}W</option>
                                      ))}
                                    </select>

                                    {/* Beam Angle */}
                                    {!isStrip && (
                                      <select
                                        value={selectedBeam}
                                        onChange={e => onUpdateLineItem({ ...item, selectedBeamAngle: e.target.value })}
                                        className="bg-[#181818] text-[#00A3FF] text-[9px] px-1 py-0.5 border border-[#333333] font-bold focus:outline-none"
                                        title="Góc chiếu"
                                      >
                                        {beamAnglesList.map(b => (
                                          <option key={b} value={b}>{b}</option>
                                        ))}
                                      </select>
                                    )}

                                    {/* CCT */}
                                    <select
                                      value={selectedColor}
                                      onChange={e => onUpdateLineItem({ ...item, selectedColorTemp: e.target.value })}
                                      className="bg-[#181818] text-emerald-300 text-[9px] px-1 py-0.5 border border-[#333333] font-bold focus:outline-none truncate"
                                      title="Màu sắc / CCT"
                                    >
                                      {colorTempsList.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                      ))}
                                    </select>

                                    {/* Voltage */}
                                    <select
                                      value={selectedVolt}
                                      onChange={e => onUpdateLineItem({ ...item, selectedVoltage: e.target.value })}
                                      className="bg-[#181818] text-purple-300 text-[9px] px-1 py-0.5 border border-[#333333] font-bold focus:outline-none"
                                      title="Điện áp"
                                    >
                                      {voltagesList.map(v => (
                                        <option key={v} value={v}>{v}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              );
                            })()}
                          </td>

                          {/* 3. Fixture Quantity */}
                          <td className="p-2.5 text-center">
                            <div className="space-y-1">
                              <input
                                type="number"
                                min={1}
                                value={item.fixtureQuantity}
                                onChange={e => {
                                  const q = Math.max(1, parseInt(e.target.value) || 1);
                                  const totalCable = item.controllerToFirstFixtureDistance + Math.max(0, q - 1) * item.interFixtureDistance;
                                  onUpdateLineItem({
                                    ...item,
                                    fixtureQuantity: q,
                                    totalCableLengthMeters: totalCable
                                  });
                                }}
                                className="w-14 bg-[#141414] text-center font-mono font-bold text-amber-400 text-xs py-1.5 border border-[#333333] focus:outline-none focus:border-amber-400"
                              />
                              <div className="text-[9px] font-sans font-bold text-[#888888] tracking-wider select-none uppercase">
                                {isLedStrip(res.fixture) ? 'Mét (m)' : 'Cái/Bộ'}
                              </div>
                            </div>
                          </td>

                          {/* 4. Sub-Controller / Auxiliary Device / Signal Routing */}
                          <td className="p-2.5 space-y-1.5 font-mono">
                            {!isSubControllerSupported ? (
                              <div className="p-1.5 bg-[#141414] border border-[#222222] text-[10px] text-[#777777] flex items-center gap-1.5" title="Bộ điều khiển Master hoạt động độc lập (Standalone) - Không dùng thiết bị giao tiếp phụ trợ">
                                <Lock className="w-3 h-3 text-amber-500 shrink-0" />
                                <span className="text-amber-400 font-bold">Không dùng</span>
                                <span className="text-[#666666] text-[9px]">(Standalone)</span>
                              </div>
                            ) : (() => {
                              const subCtrlsForBrand = subControllers.filter(s => {
                                if (isZXP) {
                                  return s.brand.toLowerCase().includes('signify') || 
                                         s.brand.toLowerCase().includes('philips') || 
                                         s.model.includes('ZXP399');
                                }
                                return s.brand.toLowerCase().includes(masterBrand.toLowerCase()) ||
                                       masterBrand.toLowerCase().includes(s.brand.toLowerCase());
                              });
                              const availableSubCtrls = subCtrlsForBrand.length > 0 ? subCtrlsForBrand : subControllers;
                              const currentSubId = item.subControllerId || (availableSubCtrls[0] ? availableSubCtrls[0].id : '');
                              const currentParent = item.parentConnection || (item.subControllerId && item.subControllerId !== 'none' ? 'sub1' : 'master');

                              return (
                                <div className="space-y-1.5">
                                  {/* Parent Connection Router */}
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-[8px] text-[#888888] uppercase font-sans">Điểm Kết Nối (Route):</span>
                                    <select
                                      value={currentParent}
                                      onChange={e => {
                                        const newParent = e.target.value as 'master' | 'sub1' | 'sub2';
                                        onUpdateLineItem({
                                          ...item,
                                          parentConnection: newParent,
                                        });
                                      }}
                                      className="w-full bg-[#181818] text-[#00A3FF] text-[10px] px-1.5 py-1 border border-[#333333] font-bold focus:outline-none focus:border-blue-500"
                                      title="Chọn đường truyền dẫn tín hiệu chính"
                                    >
                                      <option value="master" className="bg-[#141414] text-[#E0E0E0]">➔ Master Port (Trực tiếp)</option>
                                      <option value="sub1" className="bg-[#141414] text-[#E0E0E0]">➔ Sub-Controller 1 / Sub-Node</option>
                                      <option value="sub2" className="bg-[#141414] text-[#E0E0E0]">➔ Sub-Controller 2 / Interface</option>
                                    </select>
                                  </div>

                                  {/* Sub-Controller Selector */}
                                  {currentParent === 'sub1' ? (
                                    <div className="space-y-1 bg-purple-950/20 p-1.5 border border-purple-900/40">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[8px] text-purple-300 uppercase font-sans font-bold">Sub-Node / Sub-Ctrl 1:</span>
                                        {isZXP && <span className="text-[8px] text-amber-400 font-bold bg-amber-950/60 px-1 border border-amber-800/40">ZXP399</span>}
                                      </div>
                                      <select
                                        value={currentSubId}
                                        onChange={e => {
                                          const selectedSub = subControllers.find(s => s.id === e.target.value);
                                          onUpdateLineItem({
                                            ...item,
                                            subControllerId: e.target.value,
                                            subControllerBrand: selectedSub ? selectedSub.brand : (e.target.value === 'none' ? undefined : masterBrand)
                                          });
                                        }}
                                        className="w-full bg-[#141414] text-purple-300 text-[10px] px-1.5 py-1 border border-[#333333] font-bold focus:outline-none focus:border-purple-400 truncate"
                                        title="Chọn thiết bị phụ trợ hoặc sub-node"
                                      >
                                        <option value="none" className="bg-[#141414] text-[#A0A0A0]">None (Không dùng)</option>
                                        {availableSubCtrls.map(s => (
                                          <option key={s.id} value={s.id} className="bg-[#141414] text-[#E0E0E0]">
                                            {s.model} ({s.portsCount} Ports)
                                          </option>
                                        ))}
                                      </select>

                                      <div className="flex items-center justify-between text-[9px] text-[#888888] pt-0.5 border-t border-purple-900/30">
                                        {currentSubId === 'none' ? (
                                          <span className="text-[#888888] italic">Không dùng sub-node</span>
                                        ) : (
                                          <>
                                            <span>Yêu cầu: <strong className="text-purple-300">{res.subControllersNeededCount}x</strong></span>
                                            <span className="text-purple-400 font-bold">{res.subController?.portsCount || 1} Ports/bộ</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  ) : currentParent === 'sub2' ? (
                                    <div className="space-y-1 bg-indigo-950/20 p-1.5 border border-indigo-900/40 text-[10px] text-indigo-300">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[8px] text-indigo-300 uppercase font-sans font-bold">Sub-Controller 2:</span>
                                      </div>
                                      <select
                                        value={item.subController2Id || (subCtrlsByBrand[1]?.id || subCtrlsByBrand[0]?.id || '')}
                                        onChange={e => {
                                          const selectedSub2 = subControllers.find(s => s.id === e.target.value);
                                          onUpdateLineItem({
                                            ...item,
                                            subController2Id: e.target.value,
                                            subController2Brand: selectedSub2 ? selectedSub2.brand : masterBrand
                                          });
                                        }}
                                        className="w-full bg-[#141414] text-indigo-300 text-[10px] px-1.5 py-1 border border-[#333333] font-bold focus:outline-none focus:border-indigo-400 truncate"
                                        title="Chọn thiết bị giao tiếp 2"
                                      >
                                        {availableSubCtrls.map(s => (
                                          <option key={s.id} value={s.id} className="bg-[#141414] text-[#E0E0E0]">
                                            {s.model} ({s.portsCount} Ports)
                                          </option>
                                        ))}
                                      </select>
                                      <div className="text-[9px] text-indigo-400 flex items-center justify-between pt-0.5 border-t border-indigo-900/30">
                                        <span>Giao diện mở rộng</span>
                                        <span>{currentSub2Qty}x bộ</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-[9px] text-[#888888] italic px-1 py-1 bg-[#141414] border border-[#222222] flex items-center justify-between">
                                      <span>Cắm trực tiếp Master Hub</span>
                                      <span className="text-amber-400 font-bold">{activeMasterCtrl?.model}</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </td>

                          {/* 5. Cable Lengths & Distances */}
                          <td className="p-2.5 space-y-1 font-mono text-[10px]">
                            {/* Pitch between fixtures */}
                            <div className="flex items-center justify-between text-[#AAAAAA]">
                              <span>KC 2 đèn:</span>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min={0}
                                  step={0.5}
                                  value={item.interFixtureDistance}
                                  onChange={e => {
                                    const dist2 = Math.max(0, parseFloat(e.target.value) || 0);
                                    const total = item.controllerToFirstFixtureDistance + Math.max(0, item.fixtureQuantity - 1) * dist2;
                                    onUpdateLineItem({
                                      ...item,
                                      interFixtureDistance: dist2,
                                      totalCableLengthMeters: total
                                    });
                                  }}
                                  className="w-12 bg-[#141414] text-right font-mono font-semibold text-amber-300 px-1 py-0.5 border border-[#333333] focus:outline-none"
                                />
                                <span>m</span>
                              </div>
                            </div>

                            {/* Distance Ctrl to 1st */}
                            <div className="flex items-center justify-between text-[#AAAAAA]">
                              <span>Tủ ĐK ➔ Đèn 1:</span>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min={0}
                                  value={item.controllerToFirstFixtureDistance}
                                  onChange={e => {
                                    const dist1 = Math.max(0, parseFloat(e.target.value) || 0);
                                    const total = dist1 + Math.max(0, item.fixtureQuantity - 1) * item.interFixtureDistance;
                                    onUpdateLineItem({
                                      ...item,
                                      controllerToFirstFixtureDistance: dist1,
                                      totalCableLengthMeters: total
                                    });
                                  }}
                                  className="w-12 bg-[#141414] text-right font-mono font-semibold text-[#E0E0E0] px-1 py-0.5 border border-[#333333] focus:outline-none"
                                />
                                <span>m</span>
                              </div>
                            </div>

                            {/* Total Cable Length */}
                            <div className="flex items-center justify-between font-bold text-amber-400 pt-0.5 border-t border-[#222222]">
                              <span>Tổng cáp:</span>
                              <span className="text-amber-400 bg-[#161616] px-1.5 py-0.2 border border-amber-500/30">
                                {item.totalCableLengthMeters} m
                              </span>
                            </div>
                          </td>

                          {/* 6. Auto-Calculated Load Column */}
                          <td className="p-2.5 bg-[#0D0D0D] border-x border-[#222222] space-y-1 font-mono text-[10px]">
                            <div className="flex items-center justify-between text-[#CCCCCC]">
                              <span>Công Suất:</span>
                              <span className="text-amber-400 font-bold">{res.totalWattage} W</span>
                            </div>
                            <div className="flex items-center justify-between text-[#CCCCCC]">
                              <span>Địa Chỉ DMX:</span>
                              <div className="text-right">
                                <span className="text-purple-400 font-bold">{res.totalAddresses} addrs</span>
                                {res.effectiveAddressesConsumed !== undefined && (
                                  <div className="text-[8px] text-[#777777] font-sans">
                                    ({res.effectiveAddressesConsumed} {isLedStrip(res.fixture) ? 'addrs/m' : 'addrs/đèn'})
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-[#CCCCCC]">
                              <span>Số Universe:</span>
                              <span className="text-[#00A3FF] font-bold">{res.universesOrLinesNeeded} Univ</span>
                            </div>
                          </td>

                          {/* 8. Power/Signal Injectors & Amplifiers */}
                          <td className="p-2.5 bg-[#0D0D0D] border-r border-[#222222] space-y-1 font-mono text-[10px]">
                            {res.specialInjectorsNeededCount > 0 && (
                              <div className="p-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 leading-tight">
                                <span className="font-bold">{res.specialInjectorsNeededCount}x {res.injectorModelName}</span>
                              </div>
                            )}

                            {res.repeatersNeededCount > 0 ? (
                              <div className="p-1 bg-purple-500/10 border border-purple-500/30 text-purple-300 leading-tight">
                                <span className="font-bold">
                                  {res.repeatersNeededCount}x {
                                    res.fixture?.protocol === 'DMX512/RDM'
                                      ? (res.controller?.brand?.includes('Pharos') ? 'Pharos DMX Repeater' : 'DMX Repeater')
                                      : 'DALI Repeater'
                                  }
                                </span>
                              </div>
                            ) : (
                              <div className="text-[9px] text-emerald-400 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                <span>Tín hiệu an toàn (&lt;100m)</span>
                              </div>
                            )}
                          </td>

                          {/* 9. Health Check & Diagnostics */}
                          <td className="p-2.5 bg-[#0D0D0D] text-[10px] space-y-1 font-sans">
                            {res.warnings.length === 0 ? (
                              <div className="flex items-center gap-1 text-emerald-400 font-medium">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>Đạt chuẩn hãng</span>
                              </div>
                            ) : (
                              res.warnings.map((warn, wIdx) => (
                                <div
                                  key={wIdx}
                                  className="p-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-1 leading-tight text-[9px]"
                                >
                                  <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                                  <span>{warn}</span>
                                </div>
                              ))
                            )}
                          </td>

                          {/* 10. Actions */}
                          <td className="p-2.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => onDuplicateLineItem(item.id)}
                                className="p-1 bg-[#181818] hover:bg-[#252525] text-[#CCCCCC] hover:text-[#00A3FF] border border-[#333333] transition-colors"
                                title="Nhân bản tuyến đèn này"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => onDeleteLineItem(item.id)}
                                className="p-1 bg-[#181818] hover:bg-red-950/80 text-[#CCCCCC] hover:text-red-400 border border-[#333333] transition-colors"
                                title="Xóa tuyến đèn này"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Area Bottom Quick Add Line Bar */}
              <div className="bg-[#111111] px-4 py-2.5 border-t border-[#222222] flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleAddLineToArea(areaName)}
                  className="flex items-center gap-1.5 text-xs text-[#00A3FF] hover:text-[#33B5FF] font-mono font-bold px-2 py-1 bg-[#161616] hover:bg-[#202020] border border-[#333333] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Thêm Tuyến Đèn Mới Vào Khu Vực "{areaName}"</span>
                </button>

                <span className="text-[10px] text-[#777777] font-mono">
                  Master Controller: <strong className="text-white">{activeMasterCtrl?.model}</strong> • {totalAreaLines} Tuyến Đèn Đang Quản Lý
                </span>
              </div>
            </div>
          );
        })
      )}

      {/* Global Add Area Footer Action */}
      <div className="flex items-center justify-center pt-2">
        <button
          onClick={() => setIsAddAreaModalOpen(true)}
          className="flex items-center gap-2 bg-[#141414] hover:bg-[#1E1E1E] text-[#00A3FF] border-2 border-dashed border-[#333333] hover:border-[#00A3FF] px-8 py-3.5 font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>+ Thêm Khu Vực Chiếu Sáng Mới (Facade Zone / Khối Công Trình)</span>
        </button>
      </div>

      {/* BMS Connection Details Modal */}
      {activeBMSModalController && (
        <BMSConnectionModal
          controller={activeBMSModalController.controller}
          subController={activeBMSModalController.subController}
          subControllerQuantity={activeBMSModalController.subControllerQuantity}
          subController2={activeBMSModalController.subController2}
          subController2Quantity={activeBMSModalController.subController2Quantity}
          areaName={activeBMSModalController.areaName}
          onClose={() => setActiveBMSModalController(null)}
        />
      )}

      {/* Add Area Modal */}
      <AddAreaModal
        isOpen={isAddAreaModalOpen}
        onClose={() => setIsAddAreaModalOpen(false)}
        controllers={controllers}
        luminaires={luminaires}
        subControllers={subControllers}
        onAddArea={handleAddAreaFromModal}
        existingAreaCount={uniqueAreaNames.length}
      />

      {/* Area Delete Confirmation Dialog Modal */}
      {areaToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121212] border-2 border-red-500/80 p-6 max-w-md w-full space-y-4 shadow-2xl font-sans">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h4 className="text-base font-bold">Xác Nhận Xóa Toàn Bộ Khu Vực?</h4>
            </div>
            <p className="text-xs text-[#CCCCCC] leading-relaxed">
              Bạn có chắc chắn muốn xóa toàn bộ <strong>"{areaToDelete.name}"</strong>?
              <br />
              Khu vực này gồm <strong className="text-amber-400">{areaToDelete.linesCount} tuyến đèn</strong> với tổng công suất <strong className="text-amber-400">{areaToDelete.powerKW.toFixed(2)} kW</strong>.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#262626]">
              <button
                type="button"
                onClick={() => setAreaToDelete(null)}
                className="px-4 py-2 bg-[#1F1F1F] hover:bg-[#2A2A2A] text-[#CCCCCC] text-xs font-mono uppercase border border-[#333333]"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDeleteArea(areaToDelete.name)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold uppercase"
              >
                Xóa Khu Vực Này
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Area Rename Dialog Modal */}
      {editingAreaName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121212] border-2 border-[#00A3FF] p-6 max-w-md w-full space-y-4 shadow-2xl font-sans">
            <div className="flex items-center gap-3 text-[#00A3FF]">
              <Edit3 className="w-5 h-5 shrink-0" />
              <h4 className="text-base font-bold text-white">Đổi Tên Khu Vực</h4>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-[#AAAAAA] font-mono">Tên Khu Vực Mới:</label>
              <input
                type="text"
                autoFocus
                value={editingAreaName.currentName}
                onChange={e => setEditingAreaName({ ...editingAreaName, currentName: e.target.value })}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleRenameArea(editingAreaName.oldName, editingAreaName.currentName);
                  }
                }}
                className="w-full bg-[#181818] text-[#F2F2F2] p-2.5 border border-[#333333] focus:outline-none focus:border-[#00A3FF] text-sm font-medium"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#262626]">
              <button
                type="button"
                onClick={() => setEditingAreaName(null)}
                className="px-4 py-2 bg-[#1F1F1F] hover:bg-[#2A2A2A] text-[#CCCCCC] text-xs font-mono uppercase border border-[#333333]"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={() => handleRenameArea(editingAreaName.oldName, editingAreaName.currentName)}
                className="px-4 py-2 bg-[#00A3FF] hover:bg-[#33B5FF] text-black text-xs font-mono font-bold uppercase"
              >
                Lưu Tên Mới
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
