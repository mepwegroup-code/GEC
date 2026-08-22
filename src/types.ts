/**
 * Types & Interfaces for Lighting Control & Luminaire Spreadsheet Application
 */

export type ProtocolType = 'DALI' | 'DALI-2' | 'DALI DT8' | '1-10V' | 'DMX512/RDM' | 'Phase-Cut' | 'Zigbee' | 'Bluetooth Mesh' | 'Non-Dim' | 'SPI';

export type DimType = 'Single Color (Mono)' | 'Tunable White (TW)' | 'RGB' | 'RGBW' | 'RGBA' | 'IntelliHue (White + RGB)' | 'Phase Dim' | 'Non-Dim';

export type BMSProtocol = 'BACnet IP' | 'BACnet MSTP' | 'Modbus RTU' | 'Modbus TCP' | 'KNX' | 'Ethernet/IP' | 'Bluetooth Mesh' | 'DyNet' | 'MQTT' | 'Rest API' | 'Interact Cloud' | 'None';

// Sheet 1: Controller Device Interface
export interface ControllerDevice {
  id: string;
  brand: string;                   // Hãng điều khiển (Signify Dynalite, Helvar, Pharos, Lutron, etc.)
  model: string;                   // Mã thiết bị
  name: string;                    // Tên & Chức năng
  protocol: ProtocolType;          // Giao thức chính
  bmsSupport: BMSProtocol[];       // Hỗ trợ BMS
  maxAddressesPerPort: number;     // Số địa chỉ / kênh tối đa trên 1 line/port
  portsCount: number;              // Số port / universe trên 1 bộ điều khiển
  maxDaisyChainDevices: number;    // Tối đa số thiết bị nối tiếp trên 1 line trước khi cần Repeater
  maxCableDistanceMeters: number;  // Khoảng cách dây tối đa (mét) không cần Repeater
  voltageInput: string;            // Điện áp cấp (220V AC, 24V DC, PoE...)
  priceVND: number;                // Đơn giá tham khảo VNĐ
  notes: string;                   // Ghi chú & Đặc tính kỹ thuật
  
  // BMS & Topology Specification Details
  product12NC?: string;            // Mã 12NC chuẩn của Signify / Philips (VD: 911401756612)
  rackUnit?: string;               // Chuẩn lắp đặt (1U Rackmount, DIN-Rail 6M, Industrial PC Tower)
  bmsIntegrationType?: 'Native IP' | 'RS485 Serial' | 'External Gateway' | 'Dry Contact / Relay'; // Phân loại kết nối BMS
  bmsCableType?: string;           // Chuẩn cáp truyền thông BMS (Cáp Cat6 SFTP RJ45, Belden RS485 9841, KNX 2x2x0.8...)
  bmsConnectionGuide?: string;     // Hướng dẫn chi tiết cách kết nối vật lý và sơ đồ giao tiếp BMS
}

// Sub-Controller / Auxiliary Control Device Interface (EDN 10, Line Repeater, DALI Gateway Sub-Node)
export interface SubControllerDevice {
  id: string;
  brand: string;                   // Hãng thiết bị điều khiển phụ
  model: string;                   // Mã thiết bị (VD: EDN 10, DDNG485, Helvar 435, ZXP399 Sub-Controller)
  name: string;                    // Tên & Chức năng
  portsCount: number;              // Số cổng/universe
  maxAddressesPerPort: number;     // Số địa chỉ tối đa / port
  voltageInput: string;            // Điện áp cấp
  priceVND: number;                // Đơn giá VNĐ
  notes: string;                   // Ghi chú kỹ thuật
  product12NC?: string;            // Mã 12NC (VD: 911401756642)
  rackUnit?: string;               // Chuẩn vỏ (1U Rack, 2U Rack, IP66 Box)
}

// Sheet 2: Luminaire / Fixture Interface
export interface LuminaireFixture {
  id: string;
  brand: string;                   // Hãng đèn (ColorKinetics, ERCO, iGuzzini, OSRAM, Targetti, etc.)
  model: string;                   // Mã đèn
  name: string;                    // Tên & Loại đèn
  protocol: ProtocolType;          // Chuẩn điều khiển yêu cầu
  dimType: DimType;                // Kiểu dim
  addressesConsumed: number;       // Số địa chỉ tiêu thụ trên 1 đèn (Mono=1, TW=2, RGB=3, RGBW=4)
  wattage: number;                 // Công suất (W)
  voltage: string;                 // Điện áp cấp (220V AC Powercore, 24V DC, 48V, CC Driver...)
  requiresSpecialInjector: boolean;// Cần phụ kiện bộ trộn nguồn/tín hiệu riêng (VD: Color Kinetics Data Enabler)
  injectorModelRequired?: string;  // Tên bộ trộn nguồn/data yêu cầu (VD: Data Enabler Pro, sPDS-480ca)
  maxFixturesPerInjector?: number; // Số đèn tối đa trên 1 bộ trộn (VD: 32 đèn)
  maxWattagePerInjector?: number;  // Công suất tối đa trên 1 bộ trộn (VD: 320W)
  maxInterFixtureDistanceMeters: number; // Khoảng cách tối đa từ đèn đến đèn (m)
  maxControllerToLastFixtureMeters: number; // Khoảng cách tối đa từ bộ điều khiển đến đèn cuối (m)
  repeaterThresholdDistanceMeters: number;  // Khoảng cách kích hoạt cần Repeater (m)
  priceVND: number;                // Đơn giá tham khảo VNĐ
  notes: string;                   // Ghi chú phụ kiện & Lắp đặt

  // Extra Detailed Technical Specs
  ipRating?: string;               // Cấp bảo vệ (IP20, IP65, IP67, IP68)
  cri?: string;                    // Chỉ số hoàn màu (CRI>80, CRI>90, Ra>95)
  beamAngle?: string;              // Góc chiếu (8°, 15°, 30°, 10x60°, 120°)
  luminousFluxLm?: number;         // Quang thông (Lumens)
  colorTemp?: string;              // Nhiệt độ màu / Màu sắc (2700K, 3000K, 4000K, RGBW, Tunable White)
  housingMaterial?: string;        // Chất liệu vỏ (Nhôm đúc áp lực, Kính cường lực 10mm)

  // Option lists for variants (Công suất, Góc chiếu, CCT, Điện áp AC/DC)
  availableWattages?: number[];    // Danh sách công suất có thể chọn (W)
  availableBeamAngles?: string[];  // Danh sách góc chiếu có thể chọn (8°, 15°, 30°, 10°x60°,...)
  availableColorTemps?: string[];  // Danh sách CCT / Màu sắc (2700K, 3000K, 4000K, TW, RGBW,...)
  availableVoltages?: string[];    // Danh sách loại điện áp (220V AC, 100-277V AC, 24V DC, 48V DC,...)
}

// Sheet 3: Calculation Line Item
export interface DesignLineItem {
  id: string;
  zoneName: string;                // Tên khu vực / Tuyến đèn (VD: Facade Mặt Tiền Tầng 1)
  luminaireBrand: string;          // Hãng đèn đã chọn
  luminaireId: string;             // ID Đèn chọn từ Sheet 2
  fixtureQuantity: number;         // Số lượng đèn (cái)
  controllerBrand?: string;         // Hãng điều khiển đã chọn
  controllerId?: string;            // ID Bộ điều khiển chọn từ Sheet 1
  subControllerBrand?: string;     // Hãng thiết bị điều khiển phụ 1 (Pharos, Signify Dynalite, Helvar)
  subControllerId?: string;        // ID Thiết bị điều khiển phụ 1 (VD: RIO 84, DDNG485)
  subControllerQuantity?: number;  // Số lượng thiết bị phụ 1 (nếu chỉnh tay)
  subControllerAutoQty?: boolean;  // Chế độ tự động tính số lượng Sub-Node theo tải tuyến (mặc định: true)
  subController2Brand?: string;    // Hãng thiết bị điều khiển phụ 2 (VD: Pharos, Dynalite)
  subController2Id?: string;       // ID Thiết bị điều khiển phụ 2 (VD: BPS Keypad, RIO 80, DACC)
  subController2Quantity?: number; // Số lượng thiết bị phụ 2
  bmsRequired: BMSProtocol;        // Yêu cầu kết nối BMS
  
  // Selected Variant Parameters for Exact Ordering Code (Mã Chính Xác)
  selectedWattage?: number;        // Công suất đã chọn (W)
  selectedBeamAngle?: string;      // Góc chiếu đã chọn
  selectedColorTemp?: string;      // Nhiệt độ màu / CCT đã chọn
  selectedVoltage?: string;        // Loại điện áp AC / DC đã chọn

  // Distances & Cable Specs
  controllerToFirstFixtureDistance: number; // Khoảng cách từ bộ điều khiển tới đèn đầu tiên (m)
  interFixtureDistance: number;    // Khoảng cách trung bình giữa 2 đèn (m)
  totalCableLengthMeters: number;  // Tổng chiều dài dây tuyến (m)

  // Topology Tree Routing configuration
  parentConnection?: 'master' | 'sub1' | 'sub2'; // Điểm kết nối (trực tiếp Master, qua Sub-Controller 1, hoặc Sub-Controller 2)
  subControllerLinkMode?: 'star' | 'daisy-chain'; // Kiểu liên kết giữa các Sub-Controllers (Sao/Ethernet hoặc Nối tiếp/AWG Bus)

  // Phase Assignment & Supply System
  assignedPhase?: 'L1' | 'L2' | 'L3' | '3P' | 'DC'; // Phân pha cấp nguồn (Pha A/L1, Pha B/L2, Pha C/L3, hoặc 3 Pha 380V, DC)
  supplyPhaseType?: SupplyPhaseType;                 // Loại hệ thống điện áp cấp (1P_220V, 3P_380V, DC_24V...)
  controlType?: 'onoff' | 'smart';
}

// Auto-Calculated Result for Line Item
export interface CalculatedLineResult {
  item: DesignLineItem;
  fixture?: LuminaireFixture;
  controller?: ControllerDevice;
  subController?: SubControllerDevice;
  subController2?: SubControllerDevice;
  
  // Applied variant specifics
  effectiveWattage: number;        // Công suất thực tế tính toán (W)
  effectiveVoltage: string;        // Điện áp thực tế tính toán
  effectiveBeamAngle: string;      // Góc chiếu thực tế
  effectiveColorTemp: string;      // CCT / Dải màu thực tế
  exactModelCode: string;          // Mã sản phẩm chính xác kèm thông số tùy chọn
  effectiveAddressesConsumed?: number;// Số địa chỉ tiêu thụ thực tế của 1 đèn sau khi nhận diện CCT

  // Calculation details
  totalWattage: number;             // Tổng công suất (W)
  totalAddresses: number;           // Tổng số địa chỉ / kênh tiêu thụ
  universesOrLinesNeeded: number;   // Số đường line / universe cần dùng
  controllersNeededCount: number;   // Số bộ điều khiển chính cần dùng
  subControllersNeededCount: number;// Số thiết bị điều khiển phụ 1 cần dùng
  autoSubControllersCount: number;  // Số lượng Sub-Node tính tự động theo tải/universe/taps
  isSubControllerAuto: boolean;     // Trạng thái tuyến đang dùng chế độ tính Auto
  subControllers2NeededCount: number;// Số thiết bị điều khiển phụ 2 cần dùng
  
  // Repeaters & Amplifiers
  repeatersNeededCount: number;     // Số bộ kích tín hiệu / Repeater / DMX Splitter
  repeaterReason: string;           // Lý do cần Repeater (khoảng cách > 100m / > 32 taps)
  
  // Special Power/Data Injectors (Color Kinetics Data Enablers / DMX Power Supplies)
  specialInjectorsNeededCount: number;
  injectorModelName: string;
  
  // Auxiliary items
  bmsGatewaysNeededCount: number;   // Số bộ chuyển đổi BMS
  bmsGatewayModelName: string;
  protocolConvertersNeededCount: number; // Số bộ chuyển đổi giao thức
  protocolConverterModelName: string;
  daliBusPowerSuppliesCount: number;// Số nguồn bus DALI (240mA)
  
  // System Health Warnings
  warnings: string[];
}

// Bill of Quantities Item
export interface BOQItem {
  id: string;
  category: 'Controller' | 'Sub-Controller' | 'Luminaire' | 'Power/Data Injector' | 'Signal Repeater / Amp' | 'BMS Gateway' | 'Protocol Converter' | 'Accessory';
  brand: string;
  model: string;
  name: string;
  quantity: number;
  unit: string;
  unitPriceVND: number;
  totalPriceVND: number;
  notes: string;
}

// Project Preset
export interface ProjectPreset {
  id: string;
  name: string;
  description: string;
  items: DesignLineItem[];
}

// Full Lighting Project Interface
export interface LightingProject {
  id: string;
  name: string;
  code?: string;                // Mã dự án (VD: PRJ-2026-001)
  clientName?: string;          // Chủ đầu tư / Khách hàng
  location?: string;            // Địa điểm công trình
  description?: string;         // Mô tả / Phạm vi thiết kế
  createdAt: string;            // Ngày tạo
  updatedAt: string;            // Ngày cập nhật gần nhất
  lineItems: DesignLineItem[];  // Danh sách các tuyến đèn
}

// Sheet 5: AI & QA/QC Cross-Check Types
export interface RuleCheckIssue {
  id: string;
  lineId?: string;
  zoneName?: string;
  severity: 'error' | 'warning' | 'info' | 'success';
  category: 'Protocol' | 'Capacity & Addressing' | 'Cable & Distance' | 'Power & Injector' | 'BMS Integration' | 'Topology';
  title: string;
  description: string;
  recommendation: string;
}

export interface AIAuditResult {
  systemHealthScore: number;
  executiveSummary: string;
  boqDiscrepancies: Array<{
    item: string;
    status: 'PASSED' | 'WARNING' | 'ERROR' | 'VERIFIED';
    details: string;
  }>;
  signalAndPowerRisks: Array<{
    riskArea: string;
    level: 'Low' | 'Medium' | 'High' | 'Critical';
    mitigation: string;
  }>;
  optimizationSuggestions: Array<{
    title: string;
    savingsEst: string;
    description: string;
  }>;
  commissioningSteps: string[];
}

export interface UploadedDrawingFile {
  name: string;
  size: number;
  type: string;
  dataUrl: string; // base64 or preview url
  lastModified?: number;
  previewUrl?: string;
  textContent?: string;
}

export interface UploadedBOQFile {
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
  textContent?: string;
  parsedRows?: Array<Record<string, any>>;
  headers?: string[];
}

export interface ThreeWayDiscrepancyItem {
  id: string;
  item: string;
  category: string;
  drawingQuantity: string | number;
  boqQuantity: string | number;
  configQuantity: string | number;
  unit: string;
  status: 'MATCH' | 'DISCREPANCY' | 'MISSING_IN_BOQ' | 'MISSING_IN_DRAWING' | 'CONFIG_MISMATCH';
  notes: string;
  actionRequired: string;
}

export interface DrawingSchematicAnalysis {
  detectedPanels: string[];
  detectedProtocols: string[];
  detectedLoopsOrUniverses: number;
  wiringTopology: 'Daisy-Chain' | 'Star Topology' | 'Tree' | 'Mixed/Unclear';
  terminationFound: boolean;
  repeatersFound: number;
  injectorsFound: number;
  bmsGatewayFound: boolean;
  identifiedFixtures: Array<{ name: string; estimatedQty: number; protocol: string }>;
  schematicErrors: string[];
}

export interface DrawingBOQAuditReport {
  timestamp: string;
  overallScore: number; // 0-100
  auditStatus: 'PASSED' | 'WARNING' | 'CRITICAL_ERRORS';
  executiveSummary: string;
  schematicAnalysis: DrawingSchematicAnalysis;
  threeWayDiscrepancies: ThreeWayDiscrepancyItem[];
  criticalWiringRisks: Array<{
    title: string;
    severity: 'High' | 'Medium' | 'Critical';
    location: string;
    description: string;
    fix: string;
  }>;
  valueEngineering: Array<{
    title: string;
    potentialSavings: string;
    impact: string;
    recommendation: string;
  }>;
  commissioningChecklist: string[];
}

// Sheet: Voltage Drop Calculation per TCVN 7114 / TCVN 7447 / IEC 60364 / IEC 61439
export type SupplyPhaseType = '1P_220V' | '3P_380V' | 'DC_24V' | 'DC_48V' | 'DC_12V';

export interface VoltageDropLineResult {
  lineId: string;
  zoneName: string;
  luminaireModel: string;
  fixtureQuantity: number;
  unitWattage: number;
  totalWattageW: number;
  voltageSupply: number;
  phaseType: SupplyPhaseType;
  assignedPhase: 'L1' | 'L2' | 'L3' | '3P' | 'DC'; // Pha phân bổ
  powerFactorCosPhi: number;
  loadCurrentA: number;
  cableLengthMeters: number;
  conductorMaterial: 'Cu' | 'Al';
  insulationType: 'PVC' | 'XLPE';
  installationMethod: 'Conduit' | 'CableTray' | 'DirectBuried' | 'Air';
  ambientTempC: number;
  allowableDropPercent: number; // e.g. 3.0% or 5.0%

  // Calculation results
  calculatedMinCrossSectionMm2: number;
  selectedStandardSizeMm2: number;
  selectedCableCode: string;
  actualVoltageDropV: number;
  actualVoltageDropPercent: number;
  currentCarryingCapacityIz: number;
  isDropCompliant: boolean;
  isCurrentCompliant: boolean;
  isOverallCompliant: boolean;
  recommendedMCB: string;
  safetyMarginPercent: number;
  standardReference: string;
}

export interface PhaseDistributionSummary {
  pL1Watts: number;
  pL2Watts: number;
  pL3Watts: number;
  pDCWatts: number;
  currentL1A: number;
  currentL2A: number;
  currentL3A: number;
  unbalancePercent: number;
  isUnbalanceAcceptable: boolean; // < 15% per TCVN
  linesPerPhase: {
    L1: number;
    L2: number;
    L3: number;
    '3P': number;
    DC: number;
  };
}

export interface VoltageDropProjectSummary {
  totalLinesCount: number;
  compliantLinesCount: number;
  nonCompliantLinesCount: number;
  totalLoadKW: number;
  totalCurrentA: number;
  totalCableLengthM: number;
  maxVoltageDropPercent: number;
  avgVoltageDropPercent: number;
  phaseDistribution: PhaseDistributionSummary;
  cableSizeBreakdown: Array<{
    sizeMm2: number;
    cableType: string;
    totalLengthMeters: number;
    linesCount: number;
    percentage: number;
  }>;
}


