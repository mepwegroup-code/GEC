import React, { useState } from 'react';
import { ControllerDevice, SubControllerDevice } from '../types';
import {
  X,
  Network,
  Cable,
  Server,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Radio,
  BookOpen,
  Building2,
  Boxes,
  Zap,
  CheckCircle,
  ExternalLink,
  Layers
} from 'lucide-react';
import { formatVND } from '../utils/calculator';

interface BMSConnectionModalProps {
  controller: ControllerDevice | null;
  subController?: SubControllerDevice | null;
  subControllerQuantity?: number;
  subController2?: SubControllerDevice | null;
  subController2Quantity?: number;
  areaName: string;
  onClose: () => void;
}

export const BMSConnectionModal: React.FC<BMSConnectionModalProps> = ({
  controller,
  subController,
  subControllerQuantity = 1,
  subController2,
  subController2Quantity = 1,
  areaName,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'topology' | 'guide'>('topology');

  if (!controller) return null;

  const hasBMS = controller.bmsSupport && controller.bmsSupport.length > 0 && !controller.bmsSupport.every(b => b === 'None');
  const bmsList = controller.bmsSupport && controller.bmsSupport.length > 0 ? controller.bmsSupport : ['None'];
  const cableType = controller.bmsCableType || (hasBMS ? 'Cáp Cat6/Cat6A SFTP (RJ45 Gigabit Ethernet)' : 'Không yêu cầu cáp BMS riêng');
  const connGuide = controller.bmsConnectionGuide || (hasBMS 
    ? 'Kết nối cổng Ethernet LAN2 của bộ điều khiển trung tâm vào hệ thống mạng BMS tòa nhà. Khởi chạy BACnet IP / Modbus TCP Server và gán IP tĩnh để BMS SCADA giám sát & kích hoạt kịch bản.'
    : 'Bộ điều khiển hoạt động độc lập (Standalone) hoặc chỉ nhận tín hiệu kích hoạt tiếp điểm khô (Dry Contact / Relay).');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0D0D0D] border-2 border-[#00A3FF] w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl rounded-none text-left font-sans">
        {/* Modal Header */}
        <div className="bg-[#141414] p-4 border-b border-[#333333] flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#00A3FF]/10 border border-[#00A3FF]/40 text-[#00A3FF]">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#00A3FF] font-bold">
                BMS & SCADA Integration Topology Architecture • {areaName}
              </div>
              <h3 className="text-base font-bold text-[#F2F2F2] font-sans">
                Tích Hợp Hệ Thống BMS Tòa Nhà & Điều Khiển Chiếu Sáng DMX / Art-Net / sACN
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher Tabs */}
            <div className="hidden sm:flex items-center bg-[#181818] p-1 border border-[#333333]">
              <button
                onClick={() => setActiveTab('topology')}
                className={`px-3 py-1 text-xs font-mono font-bold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'topology'
                    ? 'bg-[#00A3FF] text-black'
                    : 'text-[#888888] hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Sơ Đồ Khu Vực</span>
              </button>
              <button
                onClick={() => setActiveTab('guide')}
                className={`px-3 py-1 text-xs font-mono font-bold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'guide'
                    ? 'bg-amber-400 text-black'
                    : 'text-[#888888] hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Cẩm Nang Toàn Ngành (Pharos, e:cue, Lutron...)</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 bg-[#1F1F1F] hover:bg-[#333333] text-[#888888] hover:text-white transition-colors"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="sm:hidden flex border-b border-[#333333] bg-[#161616]">
          <button
            onClick={() => setActiveTab('topology')}
            className={`flex-1 py-2 text-xs font-mono font-bold text-center border-b-2 ${
              activeTab === 'topology' ? 'border-[#00A3FF] text-[#00A3FF]' : 'border-transparent text-[#888888]'
            }`}
          >
            Sơ Đồ Khu Vực
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex-1 py-2 text-xs font-mono font-bold text-center border-b-2 ${
              activeTab === 'guide' ? 'border-amber-400 text-amber-400' : 'border-transparent text-[#888888]'
            }`}
          >
            Cẩm Nang Toàn Ngành
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 space-y-5 text-xs overflow-y-auto flex-1">
          {activeTab === 'topology' ? (
            <>
              {/* Quick Specs Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Master Controller */}
                <div className="bg-[#141414] p-3.5 border border-[#2A2A2A] space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-amber-400 font-bold flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-amber-400" />
                    1. Master Controller
                  </span>
                  <div className="font-bold text-[#F2F2F2] font-mono text-sm">
                    {controller.model}
                  </div>
                  <div className="text-[10px] text-[#888888] font-mono">
                    Hãng: <span className="text-white">{controller.brand}</span> • Cổng: <span className="text-purple-400">{controller.portsCount} Ports</span>
                  </div>
                  <p className="text-[10px] text-emerald-400 font-mono">
                    {hasBMS ? '✓ Hỗ trợ kết nối trực tiếp BMS' : 'Chạy độc lập / Tiếp điểm rơ-le'}
                  </p>
                </div>

                {/* Sub-Controller / Remote Interface Device 1 */}
                <div className="bg-[#141414] p-3.5 border border-purple-800/40 bg-purple-950/10 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-purple-400 font-bold flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5 text-purple-400" />
                    2. Thiết Bị Giao Tiếp & Remote I/O 1
                  </span>
                  {subController ? (
                    <>
                      <div className="font-bold text-[#F2F2F2] font-mono text-sm flex items-center justify-between">
                        <span>{subController.model}</span>
                        <span className="text-xs bg-purple-900/60 text-purple-200 px-1.5 py-0.2 border border-purple-600/50">
                          x{subControllerQuantity} Bộ
                        </span>
                      </div>
                      <div className="text-[10px] text-[#AAAAAA] font-mono truncate" title={subController.name}>
                        {subController.name}
                      </div>
                      <div className="text-[10px] text-purple-300 font-mono">
                        Nguồn: {subController.voltageInput} • {subController.portsCount} Ports I/O
                      </div>
                    </>
                  ) : (
                    <div className="text-[#777777] font-mono py-1 text-[11px]">
                      {hasBMS 
                        ? 'Chưa cấu hình thiết bị phụ trợ riêng (Dùng cổng I/O trực tiếp)' 
                        : 'Bộ điều khiển hoạt động độc lập (Standalone), không dùng thiết bị giao tiếp BMS.'}
                    </div>
                  )}
                </div>

                {/* Sub-Controller 2 or Protocols */}
                {subController2 ? (
                  <div className="bg-[#141414] p-3.5 border border-indigo-800/40 bg-indigo-950/10 space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold flex items-center gap-1">
                      <Radio className="w-3.5 h-3.5 text-indigo-400" />
                      3. Thiết Bị Phụ Trợ 2 (Mở Rộng / Keypad)
                    </span>
                    <div className="font-bold text-[#F2F2F2] font-mono text-sm flex items-center justify-between">
                      <span>{subController2.model}</span>
                      <span className="text-xs bg-indigo-900/60 text-indigo-200 px-1.5 py-0.2 border border-indigo-600/50">
                        x{subController2Quantity} Bộ
                      </span>
                    </div>
                    <div className="text-[10px] text-[#AAAAAA] font-mono truncate" title={subController2.name}>
                      {subController2.name}
                    </div>
                    <div className="text-[10px] text-indigo-300 font-mono">
                      Nguồn: {subController2.voltageInput} • {subController2.portsCount} Ports
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#141414] p-3.5 border border-[#2A2A2A] space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-[#00A3FF] font-bold flex items-center gap-1">
                      <Cable className="w-3.5 h-3.5 text-[#00A3FF]" />
                      3. Chuẩn Giao Thức & Cáp BMS
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {bmsList.map((proto, pIdx) => (
                        <span
                          key={pIdx}
                          className="px-2 py-0.5 bg-[#00A3FF]/15 text-[#00A3FF] border border-[#00A3FF]/40 font-mono font-bold text-[10px]"
                        >
                          {proto}
                        </span>
                      ))}
                    </div>
                    <div className="text-[10px] font-mono text-emerald-400 font-bold truncate" title={cableType}>
                      {cableType}
                    </div>
                  </div>
                )}
              </div>

              {/* Section 1: FULL SCHEMATIC & TOPOLOGY FLOWCHART */}
              <div className="bg-[#111111] p-4 border border-[#2A2A2A] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#00A3FF] font-mono font-bold text-xs">
                    <Server className="w-4 h-4 text-[#00A3FF]" />
                    <span>SƠ ĐỒ NGUYÊN LÝ KẾT NỐI TỔNG THỂ (BMS - MASTER - REMOTE I/O - LUMINAIRES)</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#888888]">Architecture Topology Standard</span>
                </div>

                {/* Visual Topology Diagram Blocks */}
                <div className="p-3 bg-[#0A0A0A] border border-[#222222] overflow-x-auto">
                  <div className="flex items-center justify-between min-w-[760px] text-center text-[10px] font-mono py-3 gap-2">
                    {/* Node 1: BMS Server */}
                    <div className="bg-[#161616] border border-emerald-500/50 p-2.5 flex-1 flex flex-col items-center shadow-lg">
                      <span className="text-emerald-400 text-[9px] uppercase font-bold">Hệ Thống BMS Trung Tâm</span>
                      <span className="font-bold text-[#F2F2F2] mt-1 text-xs">BMS / SCADA Server</span>
                      <span className="text-[9px] text-[#888888] mt-0.5">BACnet IP / Modbus TCP</span>
                      <span className="text-[8px] bg-emerald-950/60 text-emerald-300 px-1 py-0.5 mt-1 border border-emerald-800/50">
                        Phòng Điều Hành BMS
                      </span>
                    </div>

                    {controller.brand?.includes('Pharos') ? (
                      <>
                        {/* Arrow 1: BMS to RIO 84 */}
                        <div className="flex flex-col items-center shrink-0 px-1">
                          <ArrowRight className="w-4 h-4 text-purple-400 animate-pulse" />
                          <span className="text-[8px] text-purple-400 font-bold">Tiếp điểm/RS232</span>
                        </div>

                        {/* Node 2: Pharos RIO 84 */}
                        <div className="bg-[#161616] border border-purple-500/50 p-2.5 flex-1 flex flex-col items-center shadow-lg">
                          <span className="text-purple-400 text-[9px] uppercase font-bold">Giao Tiếp Đầu Vào</span>
                          <span className="font-bold text-[#F2F2F2] mt-1 text-xs">Pharos RIO 84</span>
                          <span className="text-[9px] text-purple-300 mt-0.5">8 Inputs / 4 Relays</span>
                          <span className="text-[8px] bg-purple-950/60 text-purple-300 px-1 py-0.5 mt-1 border border-purple-800/50">
                            Tủ Giao Tiếp RIO
                          </span>
                        </div>

                        {/* Arrow 2: RIO 84 to Master LPC */}
                        <div className="flex flex-col items-center shrink-0 px-1">
                          <ArrowRight className="w-4 h-4 text-emerald-400 animate-pulse" />
                          <span className="text-[8px] text-emerald-400 font-bold">LAN RJ45 (PoE)</span>
                        </div>

                        {/* Node 3: Pharos LPC (Master Controller) */}
                        <div className="bg-[#181818] border-2 border-amber-400 p-2.5 flex-1 flex flex-col items-center shadow-lg">
                          <span className="text-amber-400 text-[9px] uppercase font-bold">Master Controller</span>
                          <span className="font-bold text-[#F2F2F2] mt-1 text-xs">{controller.model}</span>
                          <span className="text-[9px] text-amber-300 mt-0.5">{controller.brand}</span>
                          <span className="text-[8px] bg-amber-950/60 text-amber-300 px-1 py-0.5 mt-1 border border-amber-700/50 font-bold">
                            Cổng LAN eDMX
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Arrow 1: BMS to Switch */}
                        <div className="flex flex-col items-center shrink-0 px-1">
                          <ArrowRight className="w-4 h-4 text-emerald-400 animate-pulse" />
                          <span className="text-[8px] text-emerald-400 font-bold">Cat6 SFTP</span>
                        </div>

                        {/* Node 2: Core Network Switch */}
                        <div className="bg-[#161616] border border-[#00A3FF]/50 p-2.5 flex-1 flex flex-col items-center shadow-lg">
                          <span className="text-[#00A3FF] text-[9px] uppercase font-bold">Hạ Tầng Mạng Tòa Nhà</span>
                          <span className="font-bold text-[#F2F2F2] mt-1 text-xs">Switch Core Gigabit</span>
                          <span className="text-[9px] text-[#888888] mt-0.5">VLAN BMS Riêng Biệt</span>
                          <span className="text-[8px] bg-blue-950/60 text-blue-300 px-1 py-0.5 mt-1 border border-blue-800/50">
                            Phòng Server / Tủ RACK
                          </span>
                        </div>

                        {/* Arrow 2: Switch to Master */}
                        <div className="flex flex-col items-center shrink-0 px-1">
                          <ArrowRight className="w-4 h-4 text-[#00A3FF] animate-pulse" />
                          <span className="text-[8px] text-[#00A3FF] font-bold">LAN2 (IP Tĩnh)</span>
                        </div>

                        {/* Node 3: Master Controller */}
                        <div className="bg-[#181818] border-2 border-amber-400 p-2.5 flex-1 flex flex-col items-center shadow-lg">
                          <span className="text-amber-400 text-[9px] uppercase font-bold">Master Controller</span>
                          <span className="font-bold text-[#F2F2F2] mt-1 text-xs">{controller.model}</span>
                          <span className="text-[9px] text-amber-300 mt-0.5">{controller.brand}</span>
                          <span className="text-[8px] bg-amber-950/60 text-amber-300 px-1 py-0.5 mt-1 border border-amber-700/50 font-bold">
                            Cổng LAN1 eDMX
                          </span>
                        </div>
                      </>
                    )}

                    {/* Arrow 3: Master to Sub/Remote */}
                    <div className="flex flex-col items-center shrink-0 px-1">
                      <ArrowRight className="w-4 h-4 text-purple-400 animate-pulse" />
                      <span className="text-[8px] text-purple-400 font-bold">eDMX / PoE / RS485</span>
                    </div>

                    {/* Node 4: Auxiliary / Remote Interface (RIO / Sub) */}
                    <div className="bg-[#181818] border-2 border-purple-500 p-2.5 flex-1 flex flex-col items-center shadow-lg">
                      <span className="text-purple-400 text-[9px] uppercase font-bold">Thiết Bị Giao Tiếp & Remote I/O</span>
                      <span className="font-bold text-[#F2F2F2] mt-1 text-xs">
                        {subController ? subController.model : 'Remote I/O Interface'}
                      </span>
                      <span className="text-[9px] text-purple-300 mt-0.5">
                        {subController ? `${subController.portsCount} Ports • ${subController.voltageInput}` : '8 Inputs / 4 Relays'}
                      </span>
                      <span className="text-[8px] bg-purple-950/60 text-purple-300 px-1 py-0.5 mt-1 border border-purple-700/50 font-bold">
                        Tủ Điều Khiển Khu Vực
                      </span>
                    </div>

                    {/* Arrow 4: Sub to Fixtures */}
                    <div className="flex flex-col items-center shrink-0 px-1">
                      <ArrowRight className="w-4 h-4 text-cyan-400 animate-pulse" />
                      <span className="text-[8px] text-cyan-400 font-bold">DMX / RDM / Relay</span>
                    </div>

                    {/* Node 5: Facade Luminaires & Relay Panels */}
                    <div className="bg-[#161616] border border-cyan-500/50 p-2.5 flex-1 flex flex-col items-center shadow-lg">
                      <span className="text-cyan-400 text-[9px] uppercase font-bold">Tuyến Đèn & Thiết Bị Tải</span>
                      <span className="font-bold text-[#F2F2F2] mt-1 text-xs">Đèn Chiếu Sáng Facade</span>
                      <span className="text-[9px] text-[#888888] mt-0.5">DMX512 / RDM / Contactor</span>
                      <span className="text-[8px] bg-cyan-950/60 text-cyan-300 px-1 py-0.5 mt-1 border border-cyan-800/50 font-bold">
                        Mặt Đứng Kiến Trúc
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sub-Controller & Interface Function Details */}
                {subController && (
                  <div className="p-3 bg-[#161616] border border-purple-700/30 rounded-none space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-purple-300 flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-purple-400" />
                        Chức Năng Chi Tiết Của Thiết Bị Giao Tiếp {subController.model}:
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">
                        Đơn Giá: {formatVND(subController.priceVND)} / Bộ
                      </span>
                    </div>
                    <p className="text-[11px] text-[#CCCCCC] leading-relaxed font-sans">
                      {subController.notes}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[10px] font-mono text-[#AAAAAA]">
                      <div className="bg-[#1C1C1C] p-2 border border-[#2A2A2A]">
                        <span className="text-[#888888] block text-[9px]">Giao Tiếp Mạng / Bus:</span>
                        <strong className="text-white">PoE (802.3af) / Ethernet eDMX / DyNet</strong>
                      </div>
                      <div className="bg-[#1C1C1C] p-2 border border-[#2A2A2A]">
                        <span className="text-[#888888] block text-[9px]">Số Cổng & Tải Ngõ Ra:</span>
                        <strong className="text-purple-300">{subController.portsCount} Ports I/O (Relay 48V/2A)</strong>
                      </div>
                      <div className="bg-[#1C1C1C] p-2 border border-[#2A2A2A]">
                        <span className="text-[#888888] block text-[9px]">Tiêu Chuẩn Lắp Đặt:</span>
                        <strong className="text-white">DIN Rail 35mm / Wall Box</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: Detailed Cabling & Signal Pinout Matrix */}
              <div className="bg-[#111111] p-4 border border-[#2A2A2A] space-y-2.5">
                <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-xs">
                  <Cable className="w-4 h-4" />
                  <span>BẢNG ĐẶC TẢ CÁP TRUYỀN THÔNG & ĐIỂM ĐẤU NỐI VẬT LÝ</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] font-mono border border-[#333333]">
                    <thead>
                      <tr className="bg-[#181818] text-[#888888] text-[9px] uppercase font-bold border-b border-[#333333]">
                        <th className="p-2.5">Chặng Kết Nối</th>
                        <th className="p-2.5">Loại Cáp Truyền Dẫn</th>
                        <th className="p-2.5">Cổng Vật Lý / Đầu Nối</th>
                        <th className="p-2.5">Giao Thức / Tín Hiệu</th>
                        <th className="p-2.5">Chức Năng Vận Hành</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#262626]">
                      {/* Row 1: BMS to Master */}
                      <tr className="hover:bg-[#161616]">
                        <td className="p-2.5 font-bold text-emerald-400">BMS Server ➔ Master Controller</td>
                        <td className="p-2.5 text-white">{cableType}</td>
                        <td className="p-2.5 text-[#AAAAAA]">Cổng LAN2 (RJ45 Gigabit)</td>
                        <td className="p-2.5 text-emerald-300 font-bold">{bmsList.join(', ')}</td>
                        <td className="p-2.5 text-[#CCCCCC] font-sans text-[10px]">
                          Truyền lệnh kích hoạt Scene, giám sát dòng tải & đồng bộ thời gian NTP.
                        </td>
                      </tr>

                      {/* Row 2: Master to Remote I/O */}
                      <tr className="hover:bg-[#161616]">
                        <td className="p-2.5 font-bold text-purple-400">
                          Master Controller ➔ {subController ? subController.model : 'Remote I/O (RIO)'}
                        </td>
                        <td className="p-2.5 text-white">Cáp Cat6 SFTP / DyNet Cable</td>
                        <td className="p-2.5 text-[#AAAAAA]">Cổng LAN1 (RJ45 PoE) / Terminal Bus</td>
                        <td className="p-2.5 text-purple-300 font-bold">eDMX / ArtNet / sACN / DyNet</td>
                        <td className="p-2.5 text-[#CCCCCC] font-sans text-[10px]">
                          Truyền luồng dữ liệu điều khiển phân tán và cấp nguồn PoE cho thiết bị remote.
                        </td>
                      </tr>

                      {/* Row 3: Remote I/O to Fire Alarm / Sensors */}
                      <tr className="hover:bg-[#161616]">
                        <td className="p-2.5 font-bold text-amber-400">
                          {subController ? subController.model : 'Remote I/O'} ➔ Tủ Báo Cháy (PCCC) & Cảm Biến
                        </td>
                        <td className="p-2.5 text-white">Cáp tín hiệu xoắn đôi chống nhiễu 2x1.0mm²</td>
                        <td className="p-2.5 text-[#AAAAAA]">Dry Contact Terminals (Inputs)</td>
                        <td className="p-2.5 text-amber-300 font-bold">Dry Contact (NO/NC) / 0-10V</td>
                        <td className="p-2.5 text-[#CCCCCC] font-sans text-[10px]">
                          Nhận tín hiệu báo cháy PCCC để ngắt đèn khẩn cấp hoặc bật sáng trắng 100%.
                        </td>
                      </tr>

                      {/* Row 4: Remote I/O / Sub-Node to Fixtures */}
                      <tr className="hover:bg-[#161616]">
                        <td className="p-2.5 font-bold text-cyan-400">
                          {subController ? subController.model : 'Remote I/O / EDN'} ➔ Tuyến Đèn / Tủ Điện
                        </td>
                        <td className="p-2.5 text-white">Cáp DMX512 chuyên dụng 2x0.5mm² + Bọc Kim 120Ω</td>
                        <td className="p-2.5 text-[#AAAAAA]">XLR-3Pin / Phoenix 3-Pin / Contactor</td>
                        <td className="p-2.5 text-cyan-300 font-bold">DMX512-A / RDM / Tiếp Điểm Relay</td>
                        <td className="p-2.5 text-[#CCCCCC] font-sans text-[10px]">
                          Điều khiển hiệu ứng đổi màu đèn LED và đóng/ngắt nguồn điện tủ chiếu sáng.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 3: Configuration & Integration Rules */}
              <div className="bg-[#111111] p-4 border border-[#2A2A2A] space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>HƯỚNG DẪN CẤU HÌNH & QUY TRÌNH TÍCH HỢP HỆ THỐNG BMS</span>
                </div>
                
                <div className="p-3 bg-[#161616] border border-[#2A2A2A] text-[11px] text-[#CCCCCC] leading-relaxed font-sans space-y-2">
                  <p>
                    <strong>Nguyên Tắc Hoạt Động Cốt Lõi:</strong> {connGuide}
                  </p>
                  <div className="pt-2 border-t border-[#262626] grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-mono text-[#AAAAAA]">
                    <div className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span><strong>Kích Hoạt Kịch Bản:</strong> BMS gửi mã Scene ID qua BACnet IP / Modbus TCP để bật các chế độ ngày thường, cuối tuần, lễ hội.</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span><strong>Liên Động Báo Cháy PCCC:</strong> Thiết bị Remote I/O tiếp nhận tiếp điểm khô từ tủ báo cháy trung tâm tòa nhà, tự động override chuyển toàn bộ đèn sang trạng thái an toàn.</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span><strong>Giám Sát Trạng Thái:</strong> Master Controller và Remote I/O phản hồi dữ liệu Online/Offline, dòng tiêu thụ và trạng thái thiết bị về màn hình SCADA.</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span><strong>Đồng Bộ Lịch Thiên Văn NTP:</strong> Đồng bộ thời gian chuẩn với mạng BMS để tự động bật tắt đèn chính xác theo thời gian mặt trời mọc/lặn từng mùa.</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* ========================================================================= */
            /* TAB 2: INDUSTRY-WIDE DMX / ART-NET / SACN TO BMS INTEGRATION GUIDE       */
            /* ========================================================================= */
            <div className="space-y-6">
              {/* Header Intro Banner */}
              <div className="bg-gradient-to-r from-amber-950/40 via-[#181818] to-cyan-950/40 p-4 border border-amber-500/40">
                <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-xs">
                  <BookOpen className="w-4 h-4" />
                  <span>CẨM NANG TOÀN DIỆN VỀ HỆ THỐNG ĐIỀU KHIỂN DMX / ART-NET & TÍCH HỢP BMS</span>
                </div>
                <p className="text-xs text-[#E0E0E0] mt-1.5 leading-relaxed font-sans">
                  Ngoài <strong>Pharos Architectural Controls</strong> rất phổ biến trong chiếu sáng nghệ thuật kiến trúc, trên thị trường quốc tế hiện nay có nhiều giải pháp điều khiển DMX / Art-Net / sACN được thiết kế sẵn khả năng tích hợp trực tiếp hoặc thông qua Gateway chuyên dụng vào hệ thống quản lý tòa nhà BMS (BACnet, Modbus, KNX, Rest API).
                </p>
              </div>

              {/* Group 1: Architectural & Dynamic Lighting Brands */}
              <div className="bg-[#111111] p-4 border border-purple-800/40 space-y-3">
                <div className="flex items-center gap-2 text-purple-400 font-mono font-bold text-xs">
                  <Zap className="w-4 h-4" />
                  <span>1. CÁC HÃNG CHUYÊN VỀ CHIẾU SÁNG KIẾN TRÚC & SỰ KIỆN (ARCHITECTURAL & DYNAMIC)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* e:cue */}
                  <div className="bg-[#161616] p-3 border border-purple-900/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-[#F2F2F2] text-xs">e:cue (Traxon / Osram)</h4>
                      <span className="text-[9px] bg-purple-950 text-purple-300 px-1.5 py-0.5 border border-purple-800 font-mono">
                        Đức 🇩🇪
                      </span>
                    </div>
                    <p className="text-[11px] text-[#AAAAAA] leading-relaxed">
                      Đối thủ cạnh tranh trực tiếp của Pharos trong phân khúc chiếu sáng mỹ thuật mặt đứng (Facade) và tổ hợp thương mại cao cấp.
                    </p>
                    <div className="space-y-1 text-[10px] font-mono">
                      <div className="text-purple-300">
                        • <strong>Thiết bị DMX tiêu biểu:</strong> Butler S2, Butler PRO DMX/RDM, e:node, máy chủ SYMPHOLIGHT.
                      </div>
                      <div className="text-emerald-400">
                        • <strong>Phương thức kết nối BMS:</strong> Hỗ trợ BACnet/IP, Modbus RTU/TCP, KNX và REST API thông qua phần mềm quản lý hoặc bộ controller cứng.
                      </div>
                    </div>
                  </div>

                  {/* Nicolaudie */}
                  <div className="bg-[#161616] p-3 border border-purple-900/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-[#F2F2F2] text-xs">Nicolaudie Architectural</h4>
                      <span className="text-[9px] bg-purple-950 text-purple-300 px-1.5 py-0.5 border border-purple-800 font-mono">
                        Pháp 🇫🇷
                      </span>
                    </div>
                    <p className="text-[11px] text-[#AAAAAA] leading-relaxed">
                      Rất mạnh ở các dòng bộ điều khiển DMX lắp tủ điện DIN-Rail chuyên dụng cho công trình kiến trúc và màn hình cảm ứng gắn tường.
                    </p>
                    <div className="space-y-1 text-[10px] font-mono">
                      <div className="text-purple-300">
                        • <strong>Thiết bị DMX tiêu biểu:</strong> Dòng DINA Series (DINA-DR1, DINA-DR2, DINA-SA2), STICK-DE3.
                      </div>
                      <div className="text-emerald-400">
                        • <strong>Phương thức kết nối BMS:</strong> Tích hợp sẵn cổng giao tiếp Modbus RTU/TCP, BACnet, tiếp điểm khô (Dry Contacts) và Ethernet/IP API.
                      </div>
                    </div>
                  </div>

                  {/* MADRIX */}
                  <div className="bg-[#161616] p-3 border border-purple-900/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-[#F2F2F2] text-xs">MADRIX</h4>
                      <span className="text-[9px] bg-purple-950 text-purple-300 px-1.5 py-0.5 border border-purple-800 font-mono">
                        Đức 🇩🇪
                      </span>
                    </div>
                    <p className="text-[11px] text-[#AAAAAA] leading-relaxed">
                      Thương hiệu hàng đầu thế giới về điều khiển hiệu ứng LED Pixel quy mô cực lớn (Art-Net / sACN / DMX / SPI).
                    </p>
                    <div className="space-y-1 text-[10px] font-mono">
                      <div className="text-purple-300">
                        • <strong>Thiết bị DMX tiêu biểu:</strong> MADRIX STELLA, MADRIX AURA, MADRIX LUNA, MADRIX ORION/NEBULA.
                      </div>
                      <div className="text-emerald-400">
                        • <strong>Phương thức kết nối BMS:</strong> Cho phép hệ BMS gửi lệnh gọi kịch bản (Scene), Master Dimmer qua HTTP API, OPC UA, hoặc Modbus / Art-Net.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 2: Holistic Building & Lighting Automation Giants */}
              <div className="bg-[#111111] p-4 border border-blue-800/40 space-y-3">
                <div className="flex items-center gap-2 text-[#00A3FF] font-mono font-bold text-xs">
                  <Building2 className="w-4 h-4" />
                  <span>2. CÁC TẬP ĐOÀN ĐIỀU KHIỂN TÒA NHÀ & CHIẾU SÁNG TỔNG THỂ</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Lutron */}
                  <div className="bg-[#161616] p-3 border border-blue-900/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-[#F2F2F2] text-xs">Lutron</h4>
                      <span className="text-[9px] bg-blue-950 text-blue-300 px-1.5 py-0.5 border border-blue-800 font-mono">
                        Mỹ 🇺🇸
                      </span>
                    </div>
                    <p className="text-[11px] text-[#AAAAAA]">
                      Giải pháp quản lý chiếu sáng toàn diện cho các tòa nhà hạng sang, khách sạn và biệt thự cao cấp.
                    </p>
                    <div className="space-y-1 text-[10px] font-mono">
                      <div className="text-blue-300">
                        • <strong>Thiết bị:</strong> Module QSE-CI-DMX, bộ xử lý Athena Processor, Quantum QP3.
                      </div>
                      <div className="text-emerald-400">
                        • <strong>BMS:</strong> Tích hợp sẵn <strong>BACnet/IP Native</strong> giao tiếp 2 chiều (báo lỗi, gọi scene, dimming).
                      </div>
                    </div>
                  </div>

                  {/* Dynalite */}
                  <div className="bg-[#161616] p-3 border border-blue-900/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-[#F2F2F2] text-xs">Philips Dynalite</h4>
                      <span className="text-[9px] bg-blue-950 text-blue-300 px-1.5 py-0.5 border border-blue-800 font-mono">
                        Signify 🇳🇱/🇦🇺
                      </span>
                    </div>
                    <p className="text-[11px] text-[#AAAAAA]">
                      Giải pháp điều khiển chiếu sáng công trình chuyên nghiệp thuộc tập đoàn Signify (Philips).
                    </p>
                    <div className="space-y-1 text-[10px] font-mono">
                      <div className="text-blue-300">
                        • <strong>Thiết bị:</strong> PDE-3, PDEG, DDMC802, DDNG-DMX, DDNG485.
                      </div>
                      <div className="text-emerald-400">
                        • <strong>BMS:</strong> Kết nối qua bộ chuyển đổi Dynalite to BACnet/Modbus Gateway (EnvisionGateway), gọi Scene DMX đã lập trình.
                      </div>
                    </div>
                  </div>

                  {/* Helvar */}
                  <div className="bg-[#161616] p-3 border border-blue-900/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-[#F2F2F2] text-xs">Helvar</h4>
                      <span className="text-[9px] bg-blue-950 text-blue-300 px-1.5 py-0.5 border border-blue-800 font-mono">
                        Phần Lan 🇫🇮
                      </span>
                    </div>
                    <p className="text-[11px] text-[#AAAAAA]">
                      Nổi tiếng với các bộ Router điều khiển DALI và DMX cho các tòa nhà thông minh tại Châu Âu.
                    </p>
                    <div className="space-y-1 text-[10px] font-mono">
                      <div className="text-blue-300">
                        • <strong>Thiết bị:</strong> Dòng Router Imagine 910, 920, 950 Multi-protocol.
                      </div>
                      <div className="text-emerald-400">
                        • <strong>BMS:</strong> Tích hợp trực tiếp chuẩn <strong>BACnet/IP</strong>, nền tảng <strong>Tridium Niagara Framework</strong> hoặc Modbus.
                      </div>
                    </div>
                  </div>

                  {/* Crestron */}
                  <div className="bg-[#161616] p-3 border border-blue-900/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-[#F2F2F2] text-xs">Crestron</h4>
                      <span className="text-[9px] bg-blue-950 text-blue-300 px-1.5 py-0.5 border border-blue-800 font-mono">
                        Mỹ 🇺🇸
                      </span>
                    </div>
                    <p className="text-[11px] text-[#AAAAAA]">
                      Cung cấp hệ thống tự động hóa tòa nhà cao cấp tích hợp âm thanh, hình ảnh và chiếu sáng.
                    </p>
                    <div className="space-y-1 text-[10px] font-mono">
                      <div className="text-blue-300">
                        • <strong>Thiết bị:</strong> Module DIN-1DMX512, bộ xử lý trung tâm Crestron 4-Series (CP4N).
                      </div>
                      <div className="text-emerald-400">
                        • <strong>BMS:</strong> Giao tiếp trực tiếp BMS qua BACnet/IP Native, Modbus TCP/RTU hoặc API hệ thống.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 3: Independent Protocol Gateway Solutions */}
              <div className="bg-[#111111] p-4 border border-emerald-800/40 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs">
                  <Boxes className="w-4 h-4" />
                  <span>3. GIẢI PHÁP SỬ DỤNG GATEWAY ĐỘC LẬP (DÀNH CHO BỘ ĐIỀU KHIỂN DMX THÔNG THƯỜNG)</span>
                </div>

                <div className="p-3 bg-[#161616] border border-[#2A2A2A] space-y-3">
                  <p className="text-[11px] text-[#CCCCCC] leading-relaxed font-sans">
                    Nếu dự án của bạn sử dụng các bộ điều khiển DMX tiêu chuẩn (không có sẵn cổng BMS tích hợp), bạn có thể sử dụng Gateway chuyển đổi giao thức chuyên dụng từ các hãng phần cứng kết nối hàng đầu thế giới như <strong>Intesis (HMS Networks - Tây Ban Nha)</strong> hoặc <strong>ADFWeb (Ý)</strong>:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
                    <div className="bg-[#1C1C1C] p-2.5 border border-emerald-800/50 flex flex-col gap-1">
                      <span className="text-emerald-400 font-bold">DMX ↔ BACnet IP / MS/TP</span>
                      <span className="text-[#AAAAAA] text-[10px]">
                        Intesis INBACDMX0200000 / ADFWeb HD67718-IP. BMS đọc/ghi trực tiếp 512 địa chỉ DMX.
                      </span>
                    </div>

                    <div className="bg-[#1C1C1C] p-2.5 border border-amber-800/50 flex flex-col gap-1">
                      <span className="text-amber-400 font-bold">DMX ↔ Modbus RTU / TCP</span>
                      <span className="text-[#AAAAAA] text-[10px]">
                        Intesis INMBSDM0200000 / ADFWeb HD67717. Chuyển đổi 512 Modbus Holding Registers sang DMX.
                      </span>
                    </div>

                    <div className="bg-[#1C1C1C] p-2.5 border border-blue-800/50 flex flex-col gap-1">
                      <span className="text-blue-400 font-bold">DMX ↔ KNX / SNMP</span>
                      <span className="text-[#AAAAAA] text-[10px]">
                        Intesis INKNXDMX0200000. Tích hợp trực tiếp hệ thống nhà thông minh chuẩn KNX TP.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 4: Master Summary & Brand Comparison Matrix Table */}
              <div className="bg-[#111111] p-4 border border-[#2A2A2A] space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-xs">
                  <CheckCircle className="w-4 h-4" />
                  <span>BẢNG TỔNG HỢP & TIÊU CHÍ LỰA CHỌN THEO QUY MÔ DỰ ÁN</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] font-mono border border-[#333333]">
                    <thead>
                      <tr className="bg-[#181818] text-[#888888] text-[9px] uppercase font-bold border-b border-[#333333]">
                        <th className="p-2.5">Hãng Sản Xuất</th>
                        <th className="p-2.5">Xuất Xứ</th>
                        <th className="p-2.5">Phân Khúc Ứng Dụng Chính</th>
                        <th className="p-2.5">Giao Thức BMS Hỗ Trợ Tốt Nhất</th>
                        <th className="p-2.5">Phương Thức Giao Tiếp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#262626]">
                      <tr className="hover:bg-[#161616]">
                        <td className="p-2.5 font-bold text-amber-400">Pharos Controls</td>
                        <td className="p-2.5 text-white">Anh 🇬🇧</td>
                        <td className="p-2.5 text-[#CCCCCC] font-sans text-[10px]">
                          Chiếu sáng mặt đứng Facade biểu tượng, cầu, tháp, công viên nghệ thuật.
                        </td>
                        <td className="p-2.5 text-emerald-300 font-bold">BACnet/IP, Modbus TCP, Rest API</td>
                        <td className="p-2.5 text-[#AAAAAA]">Dual Ethernet LAN2 + Remote I/O (RIO 84/80/08)</td>
                      </tr>

                      <tr className="hover:bg-[#161616]">
                        <td className="p-2.5 font-bold text-purple-400">e:cue (Traxon / Osram)</td>
                        <td className="p-2.5 text-white">Đức 🇩🇪</td>
                        <td className="p-2.5 text-[#CCCCCC] font-sans text-[10px]">
                          Chiếu sáng kiến trúc mặt đứng (Facade), hiệu ứng nghệ thuật cao cấp.
                        </td>
                        <td className="p-2.5 text-emerald-300 font-bold">BACnet/IP, Modbus, KNX, REST API</td>
                        <td className="p-2.5 text-[#AAAAAA]">SYMPHOLIGHT Server, Butler S2/PRO e:net</td>
                      </tr>

                      <tr className="hover:bg-[#161616]">
                        <td className="p-2.5 font-bold text-purple-400">Nicolaudie</td>
                        <td className="p-2.5 text-white">Pháp 🇫🇷</td>
                        <td className="p-2.5 text-[#CCCCCC] font-sans text-[10px]">
                          Chiếu sáng kiến trúc gắn tủ DIN-Rail, showroom, công trình văn hóa.
                        </td>
                        <td className="p-2.5 text-emerald-300 font-bold">Modbus RTU/TCP, BACnet, Dry Contact</td>
                        <td className="p-2.5 text-[#AAAAAA]">DINA Series Ethernet/IP API, RJ2DRY Relay</td>
                      </tr>

                      <tr className="hover:bg-[#161616]">
                        <td className="p-2.5 font-bold text-purple-400">MADRIX</td>
                        <td className="p-2.5 text-white">Đức 🇩🇪</td>
                        <td className="p-2.5 text-[#CCCCCC] font-sans text-[10px]">
                          Màn hình LED Pixel mặt dựng khổng lồ, trình diễn ánh sáng nhạc nước.
                        </td>
                        <td className="p-2.5 text-emerald-300 font-bold">HTTP API, Art-Net/sACN, OPC UA, Modbus</td>
                        <td className="p-2.5 text-[#AAAAAA]">MADRIX AURA / STELLA Master Recorder</td>
                      </tr>

                      <tr className="hover:bg-[#161616]">
                        <td className="p-2.5 font-bold text-blue-400">Lutron</td>
                        <td className="p-2.5 text-white">Mỹ 🇺🇸</td>
                        <td className="p-2.5 text-[#CCCCCC] font-sans text-[10px]">
                          Khách sạn 5-6 sao, tòa nhà văn phòng hạng A, dinh thự sang trọng.
                        </td>
                        <td className="p-2.5 text-emerald-300 font-bold">BACnet/IP Native, Modbus</td>
                        <td className="p-2.5 text-[#AAAAAA]">Athena / Quantum Processor BACnet Objects</td>
                      </tr>

                      <tr className="hover:bg-[#161616]">
                        <td className="p-2.5 font-bold text-blue-400">Philips Dynalite (Signify)</td>
                        <td className="p-2.5 text-white">Hà Lan / Úc 🇳🇱</td>
                        <td className="p-2.5 text-[#CCCCCC] font-sans text-[10px]">
                          Tòa nhà phức hợp, trung tâm thương mại, cảnh quan sân bay.
                        </td>
                        <td className="p-2.5 text-emerald-300 font-bold">BACnet/IP, Modbus TCP, DyNet</td>
                        <td className="p-2.5 text-[#AAAAAA]">EnvisionGateway, DDNG-DMX, PDE-3</td>
                      </tr>

                      <tr className="hover:bg-[#161616]">
                        <td className="p-2.5 font-bold text-blue-400">Helvar</td>
                        <td className="p-2.5 text-white">Phần Lan 🇫🇮</td>
                        <td className="p-2.5 text-[#CCCCCC] font-sans text-[10px]">
                          Tòa nhà thông minh tiêu chuẩn Châu Âu, bệnh viện, trường học.
                        </td>
                        <td className="p-2.5 text-emerald-300 font-bold">BACnet/IP, Tridium Niagara, Modbus</td>
                        <td className="p-2.5 text-[#AAAAAA]">Imagine 950 Multi-Protocol Router</td>
                      </tr>

                      <tr className="hover:bg-[#161616]">
                        <td className="p-2.5 font-bold text-blue-400">Crestron</td>
                        <td className="p-2.5 text-white">Mỹ 🇺🇸</td>
                        <td className="p-2.5 text-[#CCCCCC] font-sans text-[10px]">
                          Hội nghị truyền hình, tòa nhà điều hành tập đoàn, Smart Building.
                        </td>
                        <td className="p-2.5 text-emerald-300 font-bold">BACnet/IP Native, Modbus, CIP API</td>
                        <td className="p-2.5 text-[#AAAAAA]">CP4N 4-Series Control Subnet + DIN-1DMX512</td>
                      </tr>

                      <tr className="hover:bg-[#161616]">
                        <td className="p-2.5 font-bold text-emerald-400">ADFWeb / Intesis (HMS)</td>
                        <td className="p-2.5 text-white">Tây Ban Nha / Ý 🇪🇸🇮🇹</td>
                        <td className="p-2.5 text-[#CCCCCC] font-sans text-[10px]">
                          Bộ chuyển đổi Gateway linh hoạt cho mọi bộ điều khiển DMX độc lập.
                        </td>
                        <td className="p-2.5 text-emerald-300 font-bold">BACnet, Modbus, KNX, SNMP</td>
                        <td className="p-2.5 text-[#AAAAAA]">Chuyển đổi phần cứng trực tiếp DMX512 ↔ Fieldbus</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#141414] px-5 py-3 border-t border-[#333333] flex items-center justify-between sticky bottom-0 z-10">
          <span className="text-[11px] text-[#888888] font-sans">
            {activeTab === 'topology' ? (
              <>Sơ đồ và thông số kỹ thuật được xác thực theo tiêu chuẩn của hãng <strong>{controller.brand}</strong>.</>
            ) : (
              <>Cẩm nang tổng hợp các giải pháp điều khiển chiếu sáng kiến trúc & tòa nhà tích hợp BMS hàng đầu thế giới.</>
            )}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#00A3FF] hover:bg-[#33B5FF] text-black font-mono font-bold uppercase text-xs transition-colors shadow-md"
          >
            Đóng Cửa Sổ
          </button>
        </div>
      </div>
    </div>
  );
};
