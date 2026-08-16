// Sample Schematic SVG & Sample BOQ Generator for immediate testing

export const SAMPLE_SCHEMATIC_NAME = 'SD-MEP-E-501-SingleLine-Lighting-Control.svg';

export const SAMPLE_SCHEMATIC_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="100%" height="100%">
  <defs>
    <style>
      .bg { fill: #0B0F19; }
      .grid { stroke: #1E293B; stroke-width: 1; stroke-dasharray: 4,4; }
      .title-block { fill: #0F172A; stroke: #334155; stroke-width: 2; }
      .title-text { fill: #38BDF8; font-family: 'JetBrains Mono', monospace; font-size: 16px; font-weight: bold; }
      .sub-text { fill: #94A3B8; font-family: sans-serif; font-size: 11px; }
      .tag { fill: #1E293B; stroke: #475569; stroke-width: 1; }
      .tag-text { fill: #F1F5F9; font-family: monospace; font-size: 10px; }
      .wire-dmx { stroke: #38BDF8; stroke-width: 2.5; fill: none; }
      .wire-dali { stroke: #F59E0B; stroke-width: 2.5; fill: none; }
      .wire-power { stroke: #EF4444; stroke-width: 2; fill: none; }
      .wire-eth { stroke: #10B981; stroke-width: 2; stroke-dasharray: 6,4; fill: none; }
      .panel-box { fill: #1E1B4B; stroke: #6366F1; stroke-width: 2; rx: 6; }
      .fixture-box { fill: #18181B; stroke: #71717A; stroke-width: 1.5; rx: 4; }
      .legend-box { fill: #090D16; stroke: #334155; stroke-width: 1.5; rx: 4; }
    </style>
  </defs>

  <!-- Background -->
  <rect width="1200" height="800" class="bg" />
  
  <!-- Grid Lines -->
  <line x1="0" y1="200" x2="1200" y2="200" class="grid" />
  <line x1="0" y1="400" x2="1200" y2="400" class="grid" />
  <line x1="0" y1="600" x2="1200" y2="600" class="grid" />
  <line x1="300" y1="0" x2="300" y2="800" class="grid" />
  <line x1="600" y1="0" x2="600" y2="800" class="grid" />
  <line x1="900" y1="0" x2="900" y2="800" class="grid" />

  <!-- Drawing Border & Title Block -->
  <rect x="20" y="20" width="1160" height="760" fill="none" stroke="#334155" stroke-width="2" />
  <rect x="780" y="660" width="380" height="100" class="title-block" />
  <text x="800" y="690" class="title-text">SƠ ĐỒ NGUYÊN LÝ ĐIỀU KHIỂN CHIẾU SÁNG</text>
  <text x="800" y="710" class="sub-text">BẢN VẼ: SD-MEP-E-501 (TỦ TRUNG TÂM LCP-01 & TỦ PHỤ SLCP)</text>
  <text x="800" y="728" class="sub-text">GIAO THỨC: DMX512-A / DALI-2 DT8 / BMS BACNET IP</text>
  <text x="800" y="746" class="sub-text">TỶ LỆ: NTS | NGÀY: 2026-08-14 | KỸ SƯ: MEP WE GROUP</text>

  <!-- BMS Central Server Header -->
  <rect x="60" y="50" width="260" height="70" class="panel-box" fill="#064E3B" stroke="#10B981" />
  <text x="80" y="80" fill="#34D399" font-family="monospace" font-size="14px" font-weight="bold">BMS SERVER (BACnet/IP)</text>
  <text x="80" y="100" fill="#A7F3D0" font-family="sans-serif" font-size="11px">Building Management System</text>

  <!-- Main Controller Panel LCP-01 -->
  <rect x="60" y="180" width="280" height="240" class="panel-box" />
  <text x="80" y="210" fill="#818CF8" font-family="monospace" font-size="15px" font-weight="bold">TỦ ĐIỀU KHIỂN TRUNG TÂM (LCP-01)</text>
  <text x="80" y="230" fill="#C7D2FE" font-family="sans-serif" font-size="11px">Phòng Kỹ Thuật Điện Tầng Hầm (B1)</text>
  
  <!-- Components inside LCP-01 -->
  <rect x="80" y="245" width="240" height="40" class="tag" />
  <text x="95" y="270" class="tag-text">MASTER: Pharos LPC 2 / Signify ZXP399</text>

  <rect x="80" y="295" width="240" height="40" class="tag" />
  <text x="95" y="320" class="tag-text">DALI GATEWAY: Helvar 910 Router (2 Loops)</text>

  <rect x="80" y="345" width="240" height="40" class="tag" />
  <text x="95" y="370" class="tag-text">SWITCH: Cisco Industrial 8-Port Gigabit</text>

  <!-- Ethernet link from BMS to LCP-01 -->
  <path d="M 190 120 L 190 180" class="wire-eth" />
  <text x="200" y="155" fill="#34D399" font-family="monospace" font-size="10px">RJ45 CAT6 STP (BACnet/IP)</text>

  <!-- LINE 1: DMX512 Facade Loop -->
  <path d="M 320 265 L 450 265 L 450 120 L 520 120" class="wire-dmx" />
  <text x="350" y="255" fill="#38BDF8" font-family="monospace" font-size="11px">DMX Line #1 (Belden 9841)</text>

  <!-- DMX Splitter / Repeater -->
  <rect x="520" y="90" width="160" height="60" fill="#1E293B" stroke="#38BDF8" stroke-width="2" rx="4" />
  <text x="535" y="115" fill="#38BDF8" font-family="monospace" font-size="12px" font-weight="bold">OPTO-SPLITTER</text>
  <text x="535" y="135" fill="#94A3B8" font-family="sans-serif" font-size="10px">DMX Isolator 4-Way</text>

  <!-- Daisy Chain Fixtures on DMX Line -->
  <path d="M 680 120 L 740 120" class="wire-dmx" />
  
  <!-- Fixture 1 -->
  <rect x="740" y="95" width="90" height="50" class="fixture-box" stroke="#38BDF8" />
  <text x="750" y="118" fill="#F1F5F9" font-family="monospace" font-size="10px">LUM-01 (1)</text>
  <text x="750" y="134" fill="#38BDF8" font-family="sans-serif" font-size="9px">Addr: 001-004</text>

  <path d="M 830 120 L 870 120" class="wire-dmx" />

  <!-- Fixture 2 -->
  <rect x="870" y="95" width="90" height="50" class="fixture-box" stroke="#38BDF8" />
  <text x="880" y="118" fill="#F1F5F9" font-family="monospace" font-size="10px">LUM-01 (2)</text>
  <text x="880" y="134" fill="#38BDF8" font-family="sans-serif" font-size="9px">Addr: 005-008</text>

  <path d="M 960 120 L 1000 120" class="wire-dmx" />
  <text x="965" y="112" fill="#64748B" font-family="monospace" font-size="11px">...</text>

  <!-- Fixture N + Terminator -->
  <rect x="1010" y="95" width="90" height="50" class="fixture-box" stroke="#38BDF8" />
  <text x="1020" y="118" fill="#F1F5F9" font-family="monospace" font-size="10px">LUM-01 (32)</text>
  <text x="1020" y="134" fill="#38BDF8" font-family="sans-serif" font-size="9px">Addr: 125-128</text>

  <!-- Terminator 120-Ohm -->
  <rect x="1110" y="105" width="50" height="30" fill="#991B1B" stroke="#F87171" stroke-width="1.5" rx="3" />
  <text x="1116" y="124" fill="#FEF2F2" font-family="monospace" font-size="9px" font-weight="bold">120Ω</text>

  <!-- LINE 2: ColorKinetics with Power/Data Enabler Injector -->
  <path d="M 320 280 L 450 280 L 450 310 L 520 310" class="wire-dmx" />
  <rect x="520" y="280" width="180" height="65" fill="#311042" stroke="#C084FC" stroke-width="2" rx="4" />
  <text x="535" y="305" fill="#E879F9" font-family="monospace" font-size="12px" font-weight="bold">DATA ENABLER PRO</text>
  <text x="535" y="325" fill="#D8B4FE" font-family="sans-serif" font-size="10px">Power + DMX Combined Injector</text>

  <path d="M 700 312 L 760 312" stroke="#C084FC" stroke-width="3" fill="none" />
  <text x="705" y="304" fill="#E879F9" font-family="monospace" font-size="9px">Power+Data Leader</text>

  <rect x="760" y="290" width="100" height="45" class="fixture-box" stroke="#C084FC" />
  <text x="770" y="312" fill="#F1F5F9" font-family="monospace" font-size="10px">ColorReach (1)</text>
  <text x="770" y="326" fill="#C084FC" font-family="sans-serif" font-size="9px">300W RGBW</text>

  <path d="M 860 312 L 900 312" stroke="#C084FC" stroke-width="3" fill="none" />
  <rect x="900" y="290" width="100" height="45" class="fixture-box" stroke="#C084FC" />
  <text x="910" y="312" fill="#F1F5F9" font-family="monospace" font-size="10px">ColorReach (2)</text>
  <text x="910" y="326" fill="#C084FC" font-family="sans-serif" font-size="9px">300W RGBW</text>

  <!-- LINE 3: DALI-2 Loop Interior -->
  <path d="M 320 315 L 450 315 L 450 490 L 520 490" class="wire-dali" />
  <text x="350" y="480" fill="#F59E0B" font-family="monospace" font-size="11px">DALI-2 Loop 1 (2x1.5mm2)</text>

  <rect x="520" y="465" width="160" height="55" fill="#451A03" stroke="#F59E0B" stroke-width="2" rx="4" />
  <text x="535" y="490" fill="#FBBF24" font-family="monospace" font-size="12px" font-weight="bold">DALI POWER SUPPLY</text>
  <text x="535" y="508" fill="#FDE68A" font-family="sans-serif" font-size="10px">250mA Bus Power Unit</text>

  <path d="M 680 490 L 740 490" class="wire-dali" />
  
  <rect x="740" y="470" width="90" height="45" class="fixture-box" stroke="#F59E0B" />
  <text x="750" y="492" fill="#F1F5F9" font-family="monospace" font-size="10px">DALI LED-01</text>
  <text x="750" y="506" fill="#F59E0B" font-family="sans-serif" font-size="9px">A00 (Short Addr)</text>

  <path d="M 830 490 L 870 490" class="wire-dali" />

  <rect x="870" y="470" width="90" height="45" class="fixture-box" stroke="#F59E0B" />
  <text x="880" y="492" fill="#F1F5F9" font-family="monospace" font-size="10px">DALI LED-02</text>
  <text x="880" y="506" fill="#F59E0B" font-family="sans-serif" font-size="9px">A01 (Short Addr)</text>

  <path d="M 960 490 L 1000 490" class="wire-dali" />
  <text x="965" y="485" fill="#64748B" font-family="monospace" font-size="11px">...</text>

  <rect x="1010" y="470" width="90" height="45" class="fixture-box" stroke="#F59E0B" />
  <text x="1020" y="492" fill="#F1F5F9" font-family="monospace" font-size="10px">DALI SENSOR</text>
  <text x="1020" y="506" fill="#F59E0B" font-family="sans-serif" font-size="9px">PIR + Lux (A63)</text>

  <!-- Legend Box -->
  <rect x="60" y="570" width="650" height="180" class="legend-box" />
  <text x="80" y="595" fill="#38BDF8" font-family="monospace" font-size="13px" font-weight="bold">BẢNG KÝ HIỆU & GIAO THỨC ĐIỀU KHIỂN (LEGEND & SPECIFICATIONS)</text>
  
  <line x1="80" y1="620" x2="130" y2="620" class="wire-dmx" />
  <text x="140" y="624" fill="#E2E8F0" font-family="sans-serif" font-size="11px">Tuyến DMX512-A / RDM: Cáp xoắn đôi chống nhiễu Belden 9841 (120Ω), Daisy-Chain Max 32 Thiết Bị.</text>

  <line x1="80" y1="650" x2="130" y2="650" class="wire-dali" />
  <text x="140" y="654" fill="#E2E8F0" font-family="sans-serif" font-size="11px">Vòng Loop DALI-2 DT8: Cáp 2x1.5mm2 Cu/PVC/PVC, Tối Đa 64 Địa Chỉ, Sụt Áp &lt; 2V Bus.</text>

  <line x1="80" y1="680" x2="130" y2="680" stroke="#C084FC" stroke-width="3" />
  <text x="140" y="684" fill="#E2E8F0" font-family="sans-serif" font-size="11px">Tuyến Nguồn + Data Trộn (Power/Data Enabler): Cáp 4-Core (Power+Data) cho đèn Facade RGBW.</text>

  <line x1="80" y1="710" x2="130" y2="710" class="wire-eth" />
  <text x="140" y="714" fill="#E2E8F0" font-family="sans-serif" font-size="11px">Đường Trục Mạng Ethernet / BMS: Cáp CAT6 FTP/STP RJ45, Hỗ Trợ BACnet/IP, Art-Net, sACN E1.31.</text>

  <rect x="80" y="725" width="20" height="15" fill="#991B1B" stroke="#F87171" rx="2" />
  <text x="110" y="737" fill="#F87171" font-family="sans-serif" font-size="11px">120-Ohm Terminator Bắt Buộc Tại Đèn Cuối Cùng Của Tuyến DMX.</text>
</svg>`;

export const SAMPLE_BOQ_NAME = 'BOQ-BOM-DuToan-ThietBi-ChieuSang-2026.csv';

export const SAMPLE_BOQ_CSV = `STT,Mã Hiệu Vật Tư,Tên Thiết Bị & Quy Cách Kỹ Thuật,Hãng Sản Xuất,Số Lượng,Đơn Vị,Đơn Giá (VNĐ),Thành Tiền (VNĐ),Ghi Chú Kỹ Thuật
1,CTRL-DMX-01,Bộ điều khiển trung tâm Master DMX512/RDM & Art-Net 2 Universe,Pharos Architectural Controls / Signify,1,Bộ,85000000,85000000,Lắp tại tủ LCP-01 hỗ trợ BACnet IP
2,CTRL-DALI-02,Bộ Router điều khiển chiếu sáng DALI-2 Multi-Master 2 Loops,Helvar / Dynalite,1,Bộ,42000000,42000000,Chuẩn IEC 62386 max 128 địa chỉ
3,DMX-SPLIT-04,Bộ chia và khuếch đại tín hiệu DMX Opto-Splitter 4 cổng cách ly quang học,Swisson / LTECH,2,Bộ,12500000,25000000,Có bảo vệ chống sốc điện 1kV
4,DATA-ENABLER-01,Bộ trộn nguồn và tín hiệu Data Enabler Pro 100-277V AC 320W,ColorKinetics,2,Bộ,28000000,56000000,Dành cho đèn Linear Facade RGBW
5,LUM-FACADE-01,Đèn LED thanh hắt mặt tiền Linear Outdoor DMX512 RGBW 50W IP67,Signify,32,Bộ,6800000,217600000,Dài 1000mm góc chiếu 15x40 độ
6,LUM-REACH-02,Đèn rọi điểm công suất cao ColorReach Powercore gen5 RGBW 300W IP66,ColorKinetics,4,Bộ,34500000,138000000,Góc chiếu 23 độ ngoài trời
7,LUM-DOWN-03,Đèn âm trần DALI-2 Tunable White DT8 2700K-6500K 25W CRI>90,ERCO / iGuzzini,48,Bộ,3200000,153600000,Góc chiếu 36 độ chống chói UGR<19
8,ACC-TERM-120,Điện trở kết thúc cuối tuyến DMX Terminator 120-Ohm 1/4W,OEM / Amphenol,4,Cái,150000,600000,Bắt buộc tại điểm cuối mỗi đường DMX
9,CBL-DMX-9841,Cáp tín hiệu DMX xoắn đôi chống nhiễu 1-Pair 24AWG 120-Ohm,Belden / Alantek,350,Mét,28000,9800000,Chuẩn RS485 ít suy hao
10,CBL-DALI-2X15,Cáp nguồn & tín hiệu DALI 2x1.5mm2 Cu/PVC/PVC,Cadivi / LS Vina,280,Mét,18500,5180000,Đi luồn ống chống cháy
11,SW-IND-08P,Switch mạng công nghiệp 8 cổng Gigabit DIN-Rail,Cisco / Moxa,1,Bộ,16000000,16000000,Cấp nguồn 24V DC tủ LCP-01
`;
