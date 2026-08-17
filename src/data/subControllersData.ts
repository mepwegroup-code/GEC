import { SubControllerDevice } from '../types';

export const INITIAL_SUB_CONTROLLERS: SubControllerDevice[] = [
  // =========================================================================
  // --- 1. PHAROS CONTROLS: GIAO TIẾP BMS, MÀN HÌNH, BÀN PHÍM, REMOTE I/O & MẠNG ---
  // =========================================================================
  {
    id: 'sub-pharos-rio84',
    brand: 'Pharos Controls',
    model: 'Pharos RIO 84 (Remote I/O)',
    name: 'Bộ Giao Tiếp Remote I/O 8 Inputs + 4 Relay Outputs DIN Rail (BMS & PCCC Link)',
    portsCount: 12,
    maxAddressesPerPort: 1,
    voltageInput: 'PoE (IEEE 802.3af) / 9-48V DC',
    priceVND: 24500000,
    notes: 'Giao tiếp Remote I/O cho Pharos LPC/TPC: 8 ngõ vào số/analog (Dry Contact, 0-10V, 4-20mA) + 4 ngõ ra tiếp điểm Relay rơ-le cách ly 48V/2A kết nối BMS & PCCC.'
  },
  {
    id: 'sub-pharos-rio80',
    brand: 'Pharos Controls',
    model: 'Pharos RIO 80 (Remote Inputs)',
    name: 'Bộ Giao Tiếp Remote Input 8-Port DIN Rail Interface (Dry Contact & Sensors)',
    portsCount: 8,
    maxAddressesPerPort: 1,
    voltageInput: 'PoE (IEEE 802.3af) / 9-48V DC',
    priceVND: 19500000,
    notes: 'Giao tiếp 8 cổng ngõ vào số / tương tự cho hệ thống Pharos (Dry Contact, cảm biến, BMS trigger từ xa qua Ethernet).'
  },
  {
    id: 'sub-pharos-rio44',
    brand: 'Pharos Controls',
    model: 'Pharos RIO 44 (Remote I/O)',
    name: 'Bộ Giao Tiếp Remote Input/Output 4 Inputs + 4 Relay Outputs',
    portsCount: 8,
    maxAddressesPerPort: 1,
    voltageInput: 'PoE (IEEE 802.3af) / 9-48V DC',
    priceVND: 21500000,
    notes: 'Mở rộng 4 cổng Inputs + 4 cổng Relay Outputs điều khiển tiếp điểm & cảm biến qua mạng Ethernet eDMX.'
  },
  {
    id: 'sub-pharos-rio08',
    brand: 'Pharos Controls',
    model: 'Pharos RIO 08 (Remote Relays)',
    name: 'Bộ Giao Tiếp Remote Output 8-Port Relay Interface (Liên Động Tủ Điện)',
    portsCount: 8,
    maxAddressesPerPort: 1,
    voltageInput: 'PoE (802.3af)',
    priceVND: 18500000,
    notes: 'Bộ mở rộng 8 cổng ra rơ-le cách ly (Relay Outputs) cho Pharos System điều khiển contactor, rèm, liên động tủ điện & BMS.'
  },
  {
    id: 'sub-pharos-rio-a',
    brand: 'Pharos Controls',
    model: 'Pharos RIO A (Audio / SMPTE)',
    name: 'Bộ Giao Tiếp Âm Thanh & Timecode Remote Interface (Stereo / SMPTE / MIDI)',
    portsCount: 4,
    maxAddressesPerPort: 1,
    voltageInput: 'PoE (802.3af) / 9-48V DC',
    priceVND: 26500000,
    notes: 'Giao tiếp âm thanh Stereo Linear Audio In, SMPTE Linear Timecode (LTC) & MIDI In/Out cho show ánh sáng nhạc nước / nhạc nền đồng bộ.'
  },
  {
    id: 'sub-pharos-rio-d',
    brand: 'Pharos Controls',
    model: 'Pharos RIO D (DALI Interface)',
    name: 'Bộ Giao Tiếp DALI Remote DALI Interface 1-Bus Master',
    portsCount: 1,
    maxAddressesPerPort: 64,
    voltageInput: 'PoE (802.3af) / Tích hợp DALI Bus Power',
    priceVND: 23000000,
    notes: 'Giao tiếp điều khiển tuyến DALI 1-Bus (64 ballasts) tích hợp nguồn bus cấp cho hệ thống Pharos.'
  },
  {
    id: 'sub-pharos-tps',
    brand: 'Pharos Controls',
    model: 'Pharos TPS 5 (Touchscreen)',
    name: 'Màn Hình Cảm Ứng Điều Khiển Gắn Tường Touch Panel Station 5-Inch PoE',
    portsCount: 1,
    maxAddressesPerPort: 1,
    voltageInput: 'PoE (802.3af)',
    priceVND: 38500000,
    notes: 'Màn hình cảm ứng điện dung 5" gắn tường tùy biến giao diện điều khiển kịch bản chiếu sáng qua mạng Ethernet.'
  },
  {
    id: 'sub-pharos-bps',
    brand: 'Pharos Controls',
    model: 'Pharos BPS (Wall Keypad)',
    name: 'Bàn Phím Điều Khiển Cảm Ứng Gắn Tường Button Panel Station 8-Phím RGB LED',
    portsCount: 1,
    maxAddressesPerPort: 8,
    voltageInput: 'PoE (802.3af)',
    priceVND: 16500000,
    notes: 'Bàn phím gắn tường 8 phím có đèn nền RGB chỉ thị trạng thái kết nối mạng eDMX/Ethernet đến Master Controller.'
  },
  {
    id: 'sub-pharos-edn10',
    brand: 'Pharos Controls',
    model: 'Pharos EDN 10 (Network Node)',
    name: 'Bộ Giao Tiếp Phân Phối DMX/eDMX Ethernet Data Node 10-Port DIN Rail',
    portsCount: 10,
    maxAddressesPerPort: 512,
    voltageInput: 'PoE / 9-48V DC',
    priceVND: 48000000,
    notes: 'Bộ giao tiếp phân phối tín hiệu DMX512/RDM 10 cổng độc lập qua mạng Ethernet cho Pharos Controllers (LPC/TPC).'
  },
  {
    id: 'sub-pharos-edn20',
    brand: 'Pharos Controls',
    model: 'Pharos EDN 20 (Network Node)',
    name: 'Bộ Giao Tiếp Phân Phối DMX/eDMX Ethernet Data Node 20-Port Rackmount',
    portsCount: 20,
    maxAddressesPerPort: 512,
    voltageInput: '100-240V AC 1U Rack',
    priceVND: 115000000,
    notes: 'Bộ giao tiếp chia/phân phối eDMX 20 cổng DMX512 RDM cho công trình quy mô lớn.'
  },

  // =========================================================================
  // --- 2. COLOR KINETICS (SIGNIFY): GIAO TIẾP BMS, MÀN HÌNH, BÀN PHÍM & NETWORK ---
  // =========================================================================
  {
    id: 'sub-ck-activesite-gateway',
    brand: 'Philips / Signify',
    model: 'ActiveSite Gateway (BMS & Cloud Gateway)',
    name: 'Cổng Giao Tiếp Đám Mây & Kết Nối BMS Tòa Nhà Color Kinetics ActiveSite Gateway',
    portsCount: 2,
    maxAddressesPerPort: 8192,
    voltageInput: '100-240V AC / PoE',
    priceVND: 54000000,
    notes: 'Cổng giao tiếp BMS chuyên dụng cho Color Kinetics: hỗ trợ BACnet IP, Modbus TCP, Rest API, SNMP và giám sát đám mây ActiveSite Cloud 24/7.'
  },
  {
    id: 'sub-ck-antumbra-keypad',
    brand: 'Philips / Signify',
    model: 'Antumbra Ethernet Keypad (Wall Keypad)',
    name: 'Bàn Phím Điều Khiển Gắn Tường Antumbra Ethernet Keypad 6-Phím Cho Color Kinetics',
    portsCount: 1,
    maxAddressesPerPort: 6,
    voltageInput: 'PoE (IEEE 802.3af)',
    priceVND: 18500000,
    notes: 'Bàn phím gắn tường cao cấp kết nối trực tiếp qua mạng Ethernet PoE để gọi kịch bản chiếu sáng cho bộ điều khiển Color Kinetics iPlayer 4 / Video System Manager.'
  },
  {
    id: 'sub-ck-colordial-pro',
    brand: 'Philips / Signify',
    model: 'ColorDial Pro (Touch Controller)',
    name: 'Bộ Giao Diện Điều Khiển Cảm Ứng Gắn Tường ColorDial Pro (Wall-Mount Controller)',
    portsCount: 1,
    maxAddressesPerPort: 512,
    voltageInput: '12-24V DC / PoE',
    priceVND: 22000000,
    notes: 'Giao diện cảm ứng xoay và chạm gắn tường điều khiển trực tiếp màu sắc, cường độ sáng và hiệu ứng động cho hệ thống Color Kinetics.'
  },
  {
    id: 'sub-ck-multi-protocol-node',
    brand: 'Philips / Signify',
    model: 'Multi-Protocol Ethernet Node',
    name: 'Bộ Giao Tiếp Mạng Đa Giao Thức Ethernet / KiNET / DMX Interface Node',
    portsCount: 4,
    maxAddressesPerPort: 512,
    voltageInput: 'PoE / 24V DC',
    priceVND: 28500000,
    notes: 'Bộ chuyển đổi mạng giao tiếp KiNET, sACN, Art-Net sang 4 cổng DMX512/RDM độc lập tích hợp cách ly quang.'
  },

  // =========================================================================
  // --- 3. SIGNIFY DYNALITE: GIAO TIẾP BMS, MÀN HÌNH, BÀN PHÍM CẢM ỨNG & REMOTE I/O ---
  // =========================================================================
  {
    id: 'sub-dynalite-ddng485',
    brand: 'Signify Dynalite',
    model: 'DDNG485 (Network Gateway & Bridge)',
    name: 'Bộ Giao Tiếp Mạng & Cổng Chuyển Đổi DyNet / DMX / Modbus RTU DDNG485',
    portsCount: 2,
    maxAddressesPerPort: 512,
    voltageInput: '12-24V DC / DyNet Bus',
    priceVND: 9500000,
    notes: 'Cổng giao tiếp mạng DyNet/DMX/Modbus RTU: cách ly quang & liên thông dữ liệu giữa các phân vùng điều khiển và BMS tòa nhà.'
  },
  {
    id: 'sub-dynalite-pdeb',
    brand: 'Signify Dynalite',
    model: 'PDEB (BACnet IP & Ethernet Gateway)',
    name: 'Cổng Giao Tiếp Mạng Ethernet & Tích Hợp BMS BACnet IP Philips Dynalite PDEB',
    portsCount: 1,
    maxAddressesPerPort: 4096,
    voltageInput: 'PoE (802.3af) / 12-24V DC',
    priceVND: 29500000,
    notes: 'Cổng Ethernet Gateway tốc độ cao tích hợp giao thức BACnet IP Server / Modbus TCP cho phép BMS tòa nhà điều khiển toàn bộ mạng Dynalite.'
  },
  {
    id: 'sub-dynalite-envision-7',
    brand: 'Signify Dynalite',
    model: 'EnvisionTouch 7" (Touchscreen)',
    name: 'Màn Hình Cảm Ứng Gắn Tường EnvisionTouch 7-Inch PoE (Giao Diện BMS & Lighting)',
    portsCount: 1,
    maxAddressesPerPort: 1,
    voltageInput: 'PoE (IEEE 802.3af)',
    priceVND: 36500000,
    notes: 'Màn hình cảm ứng 7" gắn tường chuẩn đồ họa cao cấp hiển thị kịch bản ánh sáng, trạng thái khu vực và tích hợp giao diện điều khiển BMS.'
  },
  {
    id: 'sub-dynalite-envision-10',
    brand: 'Signify Dynalite',
    model: 'EnvisionTouch 10" (Touchscreen)',
    name: 'Màn Hình Cảm Ứng Gắn Tường EnvisionTouch 10-Inch PoE Trung Tâm Điều Khiển',
    portsCount: 1,
    maxAddressesPerPort: 1,
    voltageInput: 'PoE (IEEE 802.3af)',
    priceVND: 52000000,
    notes: 'Màn hình cảm ứng trung tâm 10" gắn sảnh/phòng điều khiển quản lý toàn bộ hệ thống chiếu sáng và liên động BMS.'
  },
  {
    id: 'sub-dynalite-antumbra-touch',
    brand: 'Signify Dynalite',
    model: 'Antumbra Touch (Glass Keypad)',
    name: 'Bàn Phím Cảm Ứng Mặt Kính Gắn Tường Antumbra Touch (Cảm Ứng Tiệm Cận)',
    portsCount: 1,
    maxAddressesPerPort: 6,
    voltageInput: '12-24V DC DyNet Bus',
    priceVND: 14500000,
    notes: 'Bàn phím cảm ứng mặt kính sang trọng với cảm biến tiệm cận (proximity sensor), đèn nền hiệu ứng và đo nhiệt độ môi trường.'
  },
  {
    id: 'sub-dynalite-antumbra-button',
    brand: 'Signify Dynalite',
    model: 'Antumbra Button (Wall Keypad)',
    name: 'Bàn Phím Điều Khiển Gắn Tường Antumbra Button 6-Phím Có Đèn Nền RGB',
    portsCount: 1,
    maxAddressesPerPort: 6,
    voltageInput: '12-24V DC DyNet Bus',
    priceVND: 11800000,
    notes: 'Bàn phím bấm cơ học phản hồi xúc giác cao cấp Antumbra 6 nút cấu hình đa kịch bản chiếu sáng qua DyNet.'
  },
  {
    id: 'sub-dynalite-dacc',
    brand: 'Signify Dynalite',
    model: 'DACC Contact Closure (Remote I/O)',
    name: 'Bộ Giao Tiếp Tiếp Điểm Khô 8-Channel Contact Closure Interface (Báo Cháy PCCC)',
    portsCount: 8,
    maxAddressesPerPort: 1,
    voltageInput: '12-24V DC DyNet Bus',
    priceVND: 14500000,
    notes: 'Bộ nhận tín hiệu ngõ vào tiếp điểm khô (Dry contact input) 8 kênh kết nối cảm biến, nút bấm, tủ báo cháy PCCC & BMS.'
  },
  {
    id: 'sub-dynalite-dmpi',
    brand: 'Signify Dynalite',
    model: 'DMPI Multi-Protocol Interface',
    name: 'Bộ Giao Tiếp Đa Giao Thức Multi-Protocol Interface DyNet/DMX/BACnet',
    portsCount: 4,
    maxAddressesPerPort: 512,
    voltageInput: '12-24V DC DyNet Bus',
    priceVND: 21500000,
    notes: 'Bộ chuyển đổi giao diện liên thông giữa mạng DyNet, DMX512 và hệ thống BMS tòa nhà.'
  },
  {
    id: 'sub-dynalite-dus804c',
    brand: 'Signify Dynalite',
    model: 'DUS804C Multifunction Sensor',
    name: 'Bộ Cảm Biến & Giao Tiếp Remote PIR + Ánh Sáng Mạng DyNet',
    portsCount: 1,
    maxAddressesPerPort: 1,
    voltageInput: '12-24V DC DyNet Bus',
    priceVND: 6200000,
    notes: 'Cảm biến chuyển động PIR và cảm biến quang trở gắn trần giao tiếp trực tiếp mạng DyNet.'
  },
  {
    id: 'sub-dynalite-dry-input',
    brand: 'Signify Dynalite',
    model: 'DIRAC-Dry-4 Contact Module',
    name: 'Bộ Giao Tiếp Nút Nhấn Tiếp Điểm Khô 4-Kênh Gắn Âm Tường',
    portsCount: 4,
    maxAddressesPerPort: 1,
    voltageInput: 'DyNet Bus Powered',
    priceVND: 3800000,
    notes: 'Module nhỏ gọn gắn sau mặt nạ công tắc cơ truyền thống để giao tiếp vào mạng Dynalite.'
  },

  // =========================================================================
  // --- 4. PHILIPS / SIGNIFY: GIAO TIẾP MẠNG ARTNET/RDM, SUBNODES & PROGRAMMER ---
  // =========================================================================
  {
    id: 'sub-philips-zxp399-sub16-rdm',
    brand: 'Philips / Signify',
    model: 'ZXP399 Sub-Controller 16-Port DMX/RDM',
    name: 'Bộ Giao Tiếp Mạng & Phân Phối Tín Hiệu Tủ Tầng ZXP399 16-Port DMX/RDM (Art-Net Node)',
    product12NC: '911401756652',
    rackUnit: '1U Rackmount / Wall Box',
    portsCount: 16,
    maxAddressesPerPort: 512,
    voltageInput: '12V DC',
    priceVND: 31500000,
    notes: 'Bộ giao tiếp nhận Art-Net từ Master Controller qua cổng RJ45 và phân phối ra 16 đường DMX512/RDM hai chiều độc lập (8,192 kênh).'
  },
  {
    id: 'sub-philips-zxp399-sub8-rdm',
    brand: 'Philips / Signify',
    model: 'ZXP399 Sub-Controller 8-Port DMX/RDM',
    name: 'Bộ Giao Tiếp Mạng & Phân Phối Tín Hiệu Tủ Tầng ZXP399 8-Port DMX/RDM (Art-Net Node)',
    product12NC: '911401756672',
    rackUnit: 'DIN-Rail / Wall Box',
    portsCount: 8,
    maxAddressesPerPort: 512,
    voltageInput: '12V DC',
    priceVND: 22500000,
    notes: '8 Cổng DMX/RDM độc lập chuyển đổi từ mạng Ethernet Art-Net. Cho phép chẩn đoán và đồng bộ địa chỉ DMX từ xa.'
  },
  {
    id: 'sub-signify-zxp399-addresser',
    brand: 'Philips / Signify',
    model: 'Uni DMX ZXP399 Addresser / Programmer',
    name: 'Thiết Bị Cầm Tay Nạp Địa Chỉ DMX/RDM & Kiểm Tra Tuyến Đèn ZXP399',
    product12NC: '911401756602',
    rackUnit: 'Handheld Diagnostic Tool',
    portsCount: 1,
    maxAddressesPerPort: 512,
    voltageInput: 'Rechargeable Battery / USB-C',
    priceVND: 12800000,
    notes: 'Thiết bị cầm tay chuyên dụng dùng để cài đặt địa chỉ DMX/RDM, test đèn & chẩn đoán tín hiệu công trình từ xa.'
  },

  // =========================================================================
  // --- 5. HELVAR: GIAO TIẾP BMS, MÀN HÌNH CẢM ỨNG, BÀN PHÍM & GATEWAY ---
  // =========================================================================
  {
    id: 'sub-helvar-505-gateway',
    brand: 'Helvar',
    model: 'Helvar 505 BACnet Gateway',
    name: 'Cổng Giao Tiếp Mạng Tích Hợp BMS BACnet IP Helvar 505 Gateway',
    portsCount: 1,
    maxAddressesPerPort: 4096,
    voltageInput: '100-240V AC / DIN Rail',
    priceVND: 32000000,
    notes: 'Cổng giao tiếp BACnet IP Server kết nối trực tiếp hệ thống Helvar Router với hệ thống BMS tòa nhà.'
  },
  {
    id: 'sub-helvar-924-touch',
    brand: 'Helvar',
    model: 'Helvar 924 TouchPanel 7"',
    name: 'Màn Hình Cảm Ứng Gắn Tường Helvar 924 TouchPanel 7-Inch DALI-2',
    portsCount: 1,
    maxAddressesPerPort: 1,
    voltageInput: 'PoE / 24V DC',
    priceVND: 34500000,
    notes: 'Màn hình cảm ứng 7" gắn tường chuẩn DALI-2 giao diện đồ họa trực quan điều khiển chiếu sáng phân khu.'
  },
  {
    id: 'sub-helvar-135xx',
    brand: 'Helvar',
    model: 'Helvar 135xx Modular Keypad',
    name: 'Bàn Phím Điều Khiển Gắn Tường Modular DALI Keypad Station 8 Phím',
    portsCount: 1,
    maxAddressesPerPort: 8,
    voltageInput: 'DALI Bus Powered',
    priceVND: 5600000,
    notes: 'Bàn phím điều khiển remote gắn tường kết nối trực tiếp vào tuyến bus DALI.'
  },
  {
    id: 'sub-helvar-444',
    brand: 'Helvar',
    model: '444 Mini Input Unit (Remote I/O)',
    name: 'Bộ Giao Tiếp Ngõ Vào Tiếp Điểm Khô 4-Kênh Mini Input Unit',
    portsCount: 4,
    maxAddressesPerPort: 1,
    voltageInput: 'DALI Bus Powered',
    priceVND: 4200000,
    notes: 'Bộ giao tiếp 4 kênh tiếp điểm khô kết nối cảm biến và nút nhấn điều khiển trực tiếp qua bus DALI.'
  },
  {
    id: 'sub-helvar-434',
    brand: 'Helvar',
    model: '434 EnOcean Gateway',
    name: 'Bộ Giao Tiếp Không Dây EnOcean DALI Gateway Interface',
    portsCount: 1,
    maxAddressesPerPort: 20,
    voltageInput: 'DALI Bus Powered',
    priceVND: 8900000,
    notes: 'Bộ giao tiếp thu sóng công tắc & cảm biến không dây không pin EnOcean vào bus DALI Helvar.'
  },

  // =========================================================================
  // --- 6. LUTRON: GIAO TIẾP BMS, MÀN HÌNH, BÀN PHÍM PALLADIOM & SEETOUCH ---
  // =========================================================================
  {
    id: 'sub-lutron-qse-ci-nwk',
    brand: 'Lutron',
    model: 'QSE-CI-NWK-E (BMS & Network Gateway)',
    name: 'Cổng Giao Tiếp Mạng Ethernet & Tích Hợp BMS Lutron QSE-CI-NWK-E',
    portsCount: 1,
    maxAddressesPerPort: 512,
    voltageInput: '24-36V DC QS Link',
    priceVND: 28000000,
    notes: 'Cổng giao tiếp mạng IP / BACnet / Telnet kết nối hệ thống Lutron Quantum / HomeWorks với BMS tòa nhà.'
  },
  {
    id: 'sub-lutron-qse-ci-dmx',
    brand: 'Lutron',
    model: 'QSE-CI-DMX Control Interface',
    name: 'Bộ Giao Tiếp Điều Khiển Tuyến DMX512 Hai Chiều Lutron QS Link',
    portsCount: 1,
    maxAddressesPerPort: 512,
    voltageInput: '24-36V DC QS Link',
    priceVND: 23500000,
    notes: 'Bộ giao tiếp liên kết hệ thống Lutron QS với bộ điều khiển DMX sân khấu/kiến trúc.'
  },
  {
    id: 'sub-lutron-seetouch',
    brand: 'Lutron',
    model: 'seeTouch QS Keypad (Wall Keypad)',
    name: 'Bàn Phím Điều Khiển Remote Gắn Tường seeTouch QS 7 Phím Có Đèn Nền',
    portsCount: 1,
    maxAddressesPerPort: 7,
    voltageInput: '24-36V DC QS Link',
    priceVND: 9200000,
    notes: 'Bàn phím điều khiển từ xa gắn tường chất lượng cao kết nối mạng QS Bus.'
  },
  {
    id: 'sub-lutron-palladiom',
    brand: 'Lutron',
    model: 'Palladiom Keypad (Luxury Keypad)',
    name: 'Bàn Phím Gắn Tường Sang Trọng Lutron Palladiom Kim Loại Phay 4-Nút',
    portsCount: 1,
    maxAddressesPerPort: 4,
    voltageInput: '24V DC QS Link',
    priceVND: 18500000,
    notes: 'Bàn phím cao cấp Palladiom phím kim loại có đèn nền dynamic backlight cho dự án khách sạn/biệt thự siêu sang.'
  },

  // =========================================================================
  // --- 7. NICOLAUDIE: GIAO TIẾP TIẾP ĐIỂM KHÔ & BÀN PHÍM CẢM ỨNG GẮN TƯỜNG ---
  // =========================================================================
  {
    id: 'sub-nicolaudie-rj2dry',
    brand: 'Nicolaudie',
    model: 'RJ2DRY Dry Contact Interface',
    name: 'Bộ Giao Tiếp 8 Cổng Tiếp Điểm Khô Dry Contact Remote Trigger (BMS Link)',
    portsCount: 8,
    maxAddressesPerPort: 1,
    voltageInput: '5V DC USB / RJ45 Port',
    priceVND: 3500000,
    notes: 'Module giao tiếp nhận tín hiệu kích hoạt cảnh chiếu sáng từ xa qua tiếp điểm rơ-le BMS & PCCC.'
  },
  {
    id: 'sub-nicolaudie-stick-touch',
    brand: 'Nicolaudie',
    model: 'STICK-DE3 Touch Panel (Touchscreen)',
    name: 'Màn Hình Cảm Ứng Gắn Tường Kính Cường Lực Nicolaudie STICK-DE3 DMX',
    portsCount: 2,
    maxAddressesPerPort: 512,
    voltageInput: '6-7V DC / PoE',
    priceVND: 26000000,
    notes: 'Màn hình cảm ứng gắn tường mặt kính hiển thị đồ họa màu, kết nối mạng Ethernet / Wi-Fi kích hoạt kịch bản.'
  },

  // =========================================================================
  // --- 8. LTECH: GIAO TIẾP MẠNG ART-NET / DMX & BÀN PHÍM CẢM ỨNG MESH ---
  // =========================================================================
  {
    id: 'sub-ltech-artnet-8',
    brand: 'LTECH',
    model: 'LTECH ArtNet-DMX-8 (Network Node)',
    name: 'Bộ Giao Tiếp Mạng ArtNet / sACN Sang 8 Cổng DMX512/RDM Cách Ly Quang',
    portsCount: 8,
    maxAddressesPerPort: 512,
    voltageInput: '100-240V AC 1U Rack',
    priceVND: 16500000,
    notes: 'Node mạng chuyển đổi giao thức ArtNet/sACN sang 8 đường DMX512 độc lập có màn hình OLED cấu hình.'
  },
  {
    id: 'sub-ltech-touch-panel',
    brand: 'LTECH',
    model: 'LTECH EX8S Touch Keypad',
    name: 'Bàn Phím Cảm Ứng Mặt Kính Gắn Tường LTECH Touch Panel DMX512 / Wireless',
    portsCount: 1,
    maxAddressesPerPort: 4,
    voltageInput: '100-240V AC / 12-24V DC',
    priceVND: 2800000,
    notes: 'Bàn phím cảm ứng gắn tường sang trọng phát tín hiệu DMX512 và sóng không dây RF 2.4GHz.'
  },
  {
    id: 'sub-ltech-lt-84a',
    brand: 'LTECH',
    model: 'LTECH LT-84A',
    name: 'Bộ Chuyển Đổi Giao Thức Đa Năng DMX/DALI sang 0-10V/1-10V (4 Kênh)',
    portsCount: 4,
    maxAddressesPerPort: 4,
    voltageInput: '100-240V AC / 277V AC',
    priceVND: 4500000,
    notes: 'Bộ chuyển đổi tín hiệu cao cấp LTECH LT-84A: Chuyển đổi linh hoạt từ DMX512/RDM hoặc DALI sang 4 kênh tín hiệu dimming 0-10V/1-10V. Tích hợp Relay ngắt nguồn AC chịu tải 10A triệt tiêu dòng rò và tiết kiệm năng lượng.'
  },
  {
    id: 'sub-ltech-lt-834',
    brand: 'LTECH',
    model: 'LTECH LT-834',
    name: 'Bộ Điều Khiển Dimming Triac Đa Năng DMX/DALI/Push DIM',
    portsCount: 1,
    maxAddressesPerPort: 1,
    voltageInput: '100-240V AC',
    priceVND: 4200000,
    notes: 'Bộ chuyển đổi tín hiệu cao cấp LT-834: Nhận tín hiệu điều khiển DMX/RDM, DALI hoặc nút nhấn cơ để chuyển sang ngõ ra Triac phase-cut chịu tải max 5A (tối đa 500W). Lý tưởng cho nâng cấp hệ đèn truyền thống hoặc Driver Triac.'
  },
  {
    id: 'sub-ltech-d5a',
    brand: 'LTECH',
    model: 'LTECH D5A DMX/RDM Decoder',
    name: 'Bộ Giải Mã Tín Hiệu DMX/RDM sang Điện Áp Không Đổi CV PWM',
    portsCount: 5,
    maxAddressesPerPort: 5,
    voltageInput: '12-48V DC',
    priceVND: 2500000,
    notes: 'Bộ giải mã DMX/RDM Constant Voltage chuyên nghiệp, cấu hình linh hoạt (3x8A, 4x6A, 5x5A, tổng tải 25A). Hỗ trợ đổi địa chỉ từ xa qua RDM, tần số PWM điều chỉnh chống nhấp nháy camera.'
  },
  {
    id: 'sub-ltech-lt-924',
    brand: 'LTECH',
    model: 'LTECH LT-924-RDM Decoder',
    name: 'Bộ Giải Mã DMX512/RDM Constant Voltage 24 Kênh CV',
    portsCount: 24,
    maxAddressesPerPort: 24,
    voltageInput: '12-24V DC',
    priceVND: 6800000,
    notes: 'Bộ giải mã DMX512 chuyên sâu 24 cổng ra CV, chịu tải 3A mỗi kênh (tổng dòng 72A). Phù hợp cho tủ điều khiển LED dây, LED thanh trang trí mặt tiền phức tạp với mật độ kênh cao.'
  },
  {
    id: 'sub-ltech-dali-25',
    brand: 'LTECH',
    model: 'LTECH DALI-25-150-900-E1A1',
    name: 'Driver LED Dimming DALI-2 Constant Current 25W CC',
    portsCount: 1,
    maxAddressesPerPort: 1,
    voltageInput: '220-240V AC',
    priceVND: 145000,
    notes: 'Bộ nguồn và điều khiển LED dòng không đổi DALI-2 (CC 150-900mA cấu hình linh hoạt bằng DIP switch). Hỗ trợ dimming siêu mịn đến 0.01% không nhấp nháy, chuẩn IEC62386.'
  },
  {
    id: 'sub-ltech-dali-cc',
    brand: 'LTECH',
    model: 'LTECH LT-401-CC DALI Decoder',
    name: 'Bộ Giải Mã Tín Hiệu DALI sang Dòng Không Đổi CC PWM',
    portsCount: 1,
    maxAddressesPerPort: 1,
    voltageInput: '12-48V DC',
    priceVND: 1850000,
    notes: 'Bộ giải mã tín hiệu DALI sang dòng không đổi (Constant Current CC 350mA/700mA/1050mA tùy chọn bằng DIP switch). Thích hợp điều khiển các đèn Spotlight, Downlight công suất nhỏ qua tuyến bus DALI.'
  },

  // =========================================================================
  // --- 9. E:CUE (TRAXON TECHNOLOGIES / OSRAM): GIAO TIẾP MẠNG, MÀN HÌNH & KEYPAD ---
  // =========================================================================
  {
    id: 'sub-ecue-enode-8',
    brand: 'e:cue (Traxon Technologies)',
    model: 'e:cue e:node (8-Port DMX Node)',
    name: 'Bộ Phân Phối Tín Hiệu e:net / Art-Net Sang 8 Cổng DMX512/RDM e:cue e:node',
    portsCount: 8,
    maxAddressesPerPort: 512,
    voltageInput: 'PoE / 100-240V AC 1U Rack',
    priceVND: 42000000,
    notes: 'Node mạng phân phối 8 tuyến DMX512/RDM cách ly quang cho hệ thống điều khiển e:cue SYMPHOLIGHT.'
  },
  {
    id: 'sub-ecue-glass-touch-t6',
    brand: 'e:cue (Traxon Technologies)',
    model: 'e:cue Glass Touch T6 Keypad',
    name: 'Bàn Phím Kính Cảm Ứng Gắn Tường e:cue Glass Touch T6 (6 Phím + Fader Bar)',
    portsCount: 1,
    maxAddressesPerPort: 6,
    voltageInput: '24V DC (e:bus) / PoE',
    priceVND: 18500000,
    notes: 'Bàn phím gắn tường mặt kính nguyên khối sang trọng với thanh trượt fader cảm ứng chỉnh độ sáng và đổi kịch bản.'
  },
  {
    id: 'sub-ecue-action-pad-10',
    brand: 'e:cue (Traxon Technologies)',
    model: 'e:cue Action Pad 10" Touch Terminal',
    name: 'Màn Hình Cảm Ứng Gắn Tường Điều Khiển Chiếu Sáng e:cue Action Pad 10-Inch PoE',
    portsCount: 1,
    maxAddressesPerPort: 1,
    voltageInput: 'PoE (802.3af)',
    priceVND: 49000000,
    notes: 'Màn hình cảm ứng 10 inch hiển thị đồ họa trực quan 3D kịch bản chiếu sáng kết nối mạng e:net.'
  },
  {
    id: 'sub-ecue-ebus-dry-contact',
    brand: 'e:cue (Traxon Technologies)',
    model: 'e:cue e:bus Dry Contact & Relay Interface 8/4',
    name: 'Module Giao Tiếp 8 Tiếp Điểm Khô + 4 Rơ-le e:bus e:cue DIN-Rail (BMS & PCCC Link)',
    portsCount: 12,
    maxAddressesPerPort: 1,
    voltageInput: '24V DC (e:bus)',
    priceVND: 19500000,
    notes: 'Giao tiếp nhận tín hiệu báo cháy PCCC và liên động BMS kích hoạt kịch bản an toàn qua mạng e:bus.'
  },

  // =========================================================================
  // --- 10. MADRIX: GIAO TIẾP CẢM BIẾN, TIẾP ĐIỂM & SPI PIXEL DRIVER ---
  // =========================================================================
  {
    id: 'sub-madrix-orion',
    brand: 'MADRIX',
    model: 'MADRIX ORION (Remote I/O & Sensors)',
    name: 'Bộ Giao Tiếp 8 Cổng Tương Tự / Số MADRIX ORION DIN-Rail (Sensors & BMS Link)',
    portsCount: 8,
    maxAddressesPerPort: 1,
    voltageInput: 'PoE (802.3af) / USB',
    priceVND: 22000000,
    notes: 'Nhận tín hiệu từ cảm biến quang, cảm biến chuyển động, tiếp điểm khô PCCC và BMS để điều khiển tự động hiệu ứng MADRIX.'
  },
  {
    id: 'sub-madrix-nebula',
    brand: 'MADRIX',
    model: 'MADRIX NEBULA (Direct SPI Driver Node)',
    name: 'Bộ Điều Khiển Trực Tiếp SPI LED Pixel MADRIX NEBULA 8 Universes DIN-Rail',
    portsCount: 2,
    maxAddressesPerPort: 2048,
    voltageInput: '5-24V DC / PoE',
    priceVND: 26500000,
    notes: 'Điều khiển trực tiếp dải LED IC (WS2812, UCS2904, SK6812...) lên tới 8 Universes qua giao thức SPI.'
  },

  // =========================================================================
  // --- 11. NICOLAUDIE: GIAO TIẾP TIẾP ĐIỂM KHÔ & MỞ RỘNG ---
  // =========================================================================
  {
    id: 'sub-nicolaudie-rj2dry-8',
    brand: 'Nicolaudie',
    model: 'Nicolaudie RJ2DRY (Dry Contact 8-Port)',
    name: 'Module Giao Tiếp 8 Cổng Tiếp Điểm Khô Nicolaudie RJ2DRY (PCCC & BMS Trigger)',
    portsCount: 8,
    maxAddressesPerPort: 1,
    voltageInput: '5V DC từ Controller',
    priceVND: 4200000,
    notes: 'Chuyển đổi 8 tiếp điểm khô NO/NC từ BMS hoặc tủ báo cháy PCCC thành lệnh gọi cảnh chiếu sáng DINA / STICK.'
  },

  // =========================================================================
  // --- 12. LUTRON: GIAO DIỆN BMS CONTACT & KEYPAD PALLADIOM ---
  // =========================================================================
  {
    id: 'sub-lutron-qse-io',
    brand: 'Lutron',
    model: 'Lutron QSE-IO (Contact Closure Interface)',
    name: 'Module Giao Tiếp Tiếp Điểm Khô 8 Inputs + 5 Relay Outputs Lutron QSE-IO',
    portsCount: 13,
    maxAddressesPerPort: 1,
    voltageInput: '24-36V DC QS Link',
    priceVND: 23500000,
    notes: 'Module tích hợp 8 ngõ vào tiếp điểm khô và 5 ngõ ra rơ-le liên động BMS, báo cháy và rèm tự động.'
  },
  {
    id: 'sub-lutron-palladiom-keypad',
    brand: 'Lutron',
    model: 'Lutron Palladiom Keypad (Wall Station)',
    name: 'Bàn Phím Gắn Tường Sang Trọng Kim Loại Nguyên Khối Lutron Palladiom QS',
    portsCount: 1,
    maxAddressesPerPort: 4,
    voltageInput: '24V DC QS Link',
    priceVND: 21000000,
    notes: 'Bàn phím gắn tường chuẩn kiến trúc siêu cao cấp hoàn thiện kim loại (Brass / Satin Nickel / Black).'
  },

  // =========================================================================
  // --- 13. CRESTRON: MÀN HÌNH CẢM ỨNG & RELAY MODULE ---
  // =========================================================================
  {
    id: 'sub-crestron-tsw-770',
    brand: 'Crestron',
    model: 'Crestron TSW-770 7" Touch Screen',
    name: 'Màn Hình Cảm Ứng Gắn Tường Crestron TSW-770 7-Inch PoE (BMS & Lighting GUI)',
    portsCount: 1,
    maxAddressesPerPort: 1,
    voltageInput: 'PoE (802.3af)',
    priceVND: 38500000,
    notes: 'Màn hình cảm ứng 7" độ phân giải cao tùy biến giao diện đồ họa điều khiển đèn, nhiệt độ và BMS.'
  },
  {
    id: 'sub-crestron-din-8sw8',
    brand: 'Crestron',
    model: 'Crestron DIN-8SW8 Relay Module',
    name: 'Module Đóng Cắt Rơ-le 8 Kênh 10A DIN-Rail Crestron DIN-8SW8 (Tải Chiếu Sáng)',
    portsCount: 8,
    maxAddressesPerPort: 1,
    voltageInput: '100-240V AC / Cresnet',
    priceVND: 28000000,
    notes: '8 Rơ-le độc lập 10A đóng ngắt nguồn đèn và quạt thông qua mạng Cresnet liên kết bộ điều khiển DMX.'
  },

  // =========================================================================
  // --- 14. ADFWEB / INTESIS: MODULE PHỤ TRỢ GATEWAY BMS ---
  // =========================================================================
  {
    id: 'sub-adfweb-dmx-bacnet',
    brand: 'ADFWeb / Intesis',
    model: 'ADFWeb HD67718-IP (BACnet to DMX Gateway)',
    name: 'Bộ Cổng Chuyển Đổi Giao Thức BMS BACnet IP Sang DMX512 IN ADFWeb HD67718-IP',
    portsCount: 1,
    maxAddressesPerPort: 512,
    voltageInput: '12-35V DC / 24V AC DIN-Rail',
    priceVND: 19500000,
    notes: 'Bộ Gateway hãng thứ 3 chuyển đổi giao thức BACnet IP từ BMS tòa nhà thành tín hiệu DMX IN cắm vào ZXP399 Master Controller.'
  },
  {
    id: 'sub-adfweb-dmx-modbus',
    brand: 'ADFWeb / Intesis',
    model: 'ADFWeb HD67719-IP (Modbus to DMX Gateway)',
    name: 'Bộ Cổng Chuyển Đổi Giao Thức BMS Modbus TCP/RTU Sang DMX512 IN ADFWeb HD67719-IP',
    portsCount: 1,
    maxAddressesPerPort: 512,
    voltageInput: '12-35V DC / 24V AC DIN-Rail',
    priceVND: 18500000,
    notes: 'Bộ Gateway hãng thứ 3 chuyển đổi giao thức Modbus TCP/RTU thành tín hiệu DMX IN cắm vào ZXP399 Master Controller.'
  },
  {
    id: 'sub-intesis-dmx-bacnet',
    brand: 'ADFWeb / Intesis',
    model: 'Intesis INBACDMX020 (BACnet to DMX)',
    name: 'Bộ Cổng Chuyển Đổi Giao Thức BACnet IP Sang DMX512 Intesis INBACDMX',
    portsCount: 1,
    maxAddressesPerPort: 512,
    voltageInput: '9-36V DC / 24V AC DIN-Rail',
    priceVND: 22500000,
    notes: 'Gateway chuyên dụng xuất xứ HMS Networks, chuyển đổi BACnet IP sang DMX IN cho bộ điều khiển ZXP399.'
  },
  {
    id: 'sub-intesis-bacnet-exp',
    brand: 'ADFWeb / Intesis',
    model: 'Intesis BACnet/IP Expansion Coupler',
    name: 'Module Ghép Nối Mở Rộng Điểm BMS BACnet IP cho Gateway DMX Intesis',
    portsCount: 2,
    maxAddressesPerPort: 512,
    voltageInput: '24V DC',
    priceVND: 9800000,
    notes: 'Mở rộng bảng ánh xạ địa chỉ DMX sang BACnet Objects cho hệ thống SCADA trung tâm.'
  }
];
