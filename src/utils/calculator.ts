import {
  ControllerDevice,
  SubControllerDevice,
  LuminaireFixture,
  DesignLineItem,
  CalculatedLineResult,
  BOQItem
} from '../types';
import { INITIAL_SUB_CONTROLLERS } from '../data/subControllersData';

export function isControllerBmsSupported(controller?: ControllerDevice | null): boolean {
  if (!controller) return false;
  if (!controller.bmsSupport || !Array.isArray(controller.bmsSupport)) return false;
  if (controller.bmsSupport.length === 0) return false;
  return controller.bmsSupport.some(
    protocol => protocol && typeof protocol === 'string' && protocol.trim().toLowerCase() !== 'none' && protocol.trim() !== ''
  );
}

export function getAddressesConsumedForCCT(cct: string, dimType?: string): number {
  const normalized = cct.toLowerCase().trim();
  
  if (normalized.includes('rgbw') || normalized.includes('rgba') || normalized.includes('intellihue')) {
    return 4;
  }
  if (normalized.includes('rgb')) {
    return 3;
  }
  if (normalized.includes('tunable white') || normalized.includes('tw') || normalized.includes('tunable')) {
    return 2;
  }
  
  const isKValue = /\d{3,4}k/i.test(normalized) || normalized.includes('k') || /^\d+$/.test(normalized);
  if (isKValue || normalized.includes('mono') || normalized.includes('single') || normalized.includes('đơn sắc')) {
    return 1;
  }
  
  if (dimType) {
    const dimTypeNorm = dimType.toLowerCase().trim();
    if (dimTypeNorm.includes('rgbw') || dimTypeNorm.includes('rgba') || dimTypeNorm.includes('intellihue')) return 4;
    if (dimTypeNorm.includes('rgb')) return 3;
    if (dimTypeNorm.includes('tw') || dimTypeNorm.includes('tunable')) return 2;
    if (dimTypeNorm.includes('mono') || dimTypeNorm.includes('single') || dimTypeNorm.includes('phase')) return 1;
  }

  return 1;
}

export function isLedStrip(fixture?: { name?: string; model?: string } | null): boolean {
  if (!fixture) return false;
  const name = (fixture.name || '').toLowerCase();
  const model = (fixture.model || '').toLowerCase();

  // Exclude rigid architectural linear bars / led thanh like UniStrip or UniBar
  if (name.includes('unistrip') || name.includes('unibar') || model.includes('unistrip') || model.includes('unibar')) {
    return false;
  }

  return name.includes('led dây') || 
         name.includes('strip') || 
         name.includes('tape') || 
         name.includes('ribbon') || 
         name.includes('unilinear flex') ||
         name.includes('free form') ||
         model.includes('strip') ||
         model.includes('tape') ||
         model.includes('unilinear flex') ||
         model.includes('bgp388') ||
         (model.includes('ltech') && model.includes('strip'));
}

export function getLedStripAddressesPerMeter(cct: string, dimType?: string): number {
  const normalized = cct.toLowerCase().trim();
  if (normalized.includes('rgbw') || normalized.includes('rgba') || normalized.includes('intellihue')) {
    return 40; // 4 addresses per 100mm = 40 per meter
  }
  if (normalized.includes('rgb')) {
    return 30; // 3 addresses per 100mm = 30 per meter
  }
  if (normalized.includes('tunable white') || normalized.includes('tw') || normalized.includes('tunable')) {
    return 20; // 2 addresses per 100mm = 20 per meter
  }
  return 10; // Mono: 1 address per 100mm = 10 per meter
}

export function calculateLineResult(
  item: DesignLineItem,
  controllers: ControllerDevice[],
  luminaires: LuminaireFixture[],
  subControllersList: SubControllerDevice[] = INITIAL_SUB_CONTROLLERS
): CalculatedLineResult {
  const fixture = luminaires.find(f => f.id === item.luminaireId);
  const controller = controllers.find(c => c.id === item.controllerId);
  const supportsBMS = isControllerBmsSupported(controller);
  const isZXP = Boolean(
    controller?.model.includes('ZXP399') ||
    controller?.id.includes('zxp399') ||
    controller?.brand.toLowerCase().includes('signify') ||
    controller?.brand.toLowerCase().includes('philips') ||
    item.controllerBrand?.toLowerCase().includes('signify') ||
    item.controllerBrand?.toLowerCase().includes('philips')
  );
  const allowSubControllers = supportsBMS || isZXP;

  // Find Sub-Controller 1 & 2 devices
  let subController: SubControllerDevice | undefined = undefined;
  let subController2: SubControllerDevice | undefined = undefined;

  if (allowSubControllers) {
    subController = subControllersList.find(s => s.id === item.subControllerId);
    if (!subController && controller && item.subControllerId !== 'none') {
      // Auto-match subController by brand or ZXP
      subController = subControllersList.find(s => {
        if (isZXP) {
          return s.model.includes('ZXP399') || s.brand.toLowerCase().includes('signify') || s.brand.toLowerCase().includes('philips');
        }
        return s.brand.toLowerCase().includes(controller.brand.toLowerCase()) || controller.brand.toLowerCase().includes(s.brand.toLowerCase());
      });
    }
    subController2 = item.subController2Id && item.subController2Id !== 'none' ? subControllersList.find(s => s.id === item.subController2Id) : undefined;
  }

  const warnings: string[] = [];

  if (!fixture || !controller) {
    return {
      item,
      fixture,
      controller,
      subController,
      subController2,
      effectiveWattage: 0,
      effectiveVoltage: '',
      effectiveBeamAngle: '',
      effectiveColorTemp: '',
      exactModelCode: '',
      effectiveAddressesConsumed: 0,
      totalWattage: 0,
      totalAddresses: 0,
      universesOrLinesNeeded: 0,
      controllersNeededCount: 0,
      subControllersNeededCount: 0,
      autoSubControllersCount: 0,
      isSubControllerAuto: true,
      subControllers2NeededCount: 0,
      repeatersNeededCount: 0,
      repeaterReason: '',
      specialInjectorsNeededCount: 0,
      injectorModelName: 'Không yêu cầu',
      bmsGatewaysNeededCount: 0,
      bmsGatewayModelName: 'Không',
      protocolConvertersNeededCount: 0,
      protocolConverterModelName: 'Không',
      daliBusPowerSuppliesCount: 0,
      warnings: ['Vui lòng chọn Hãng đèn, Mã đèn và Bộ điều khiển phù hợp.']
    };
  }

  // 0. Resolve Effective Variant Specifications
  const effectiveWattage = item.selectedWattage !== undefined && item.selectedWattage > 0 ? item.selectedWattage : fixture.wattage;
  const effectiveVoltage = item.selectedVoltage || fixture.voltage;
  const effectiveBeamAngle = item.selectedBeamAngle || fixture.beamAngle || 'Chỉ định';
  const effectiveColorTemp = item.selectedColorTemp || fixture.colorTemp || fixture.dimType;

  const isStrip = isLedStrip(fixture);

  // Build Exact Specification Ordering Model Code (Mã sản phẩm chính xác)
  const exactModelCode = isStrip
    ? `${fixture.model} [${effectiveWattage}W | ${effectiveColorTemp} | ${effectiveVoltage}]`
    : `${fixture.model} [${effectiveWattage}W | ${effectiveBeamAngle} | ${effectiveColorTemp} | ${effectiveVoltage}]`;

  // Detect if the fixture is a non-pixel model (spot, dot, led bar/thanh)
  const isPixel = 
    fixture.name.toLowerCase().includes('pixel') || 
    fixture.model.toLowerCase().includes('pixel') || 
    fixture.name.toLowerCase().includes('media') || 
    fixture.name.toLowerCase().includes('direct view') || 
    fixture.name.toLowerCase().includes('flex tape') ||
    fixture.model.toLowerCase().includes('flex') ||
    fixture.addressesConsumed > 10;

  const effectiveAddressesConsumed = isStrip
    ? getLedStripAddressesPerMeter(effectiveColorTemp, fixture.dimType)
    : (isPixel 
        ? fixture.addressesConsumed 
        : getAddressesConsumedForCCT(effectiveColorTemp, fixture.dimType));

  // 1. Calculate Wattage & Addresses
  // Wattage is calculated per-meter for LED strips (divide catalog 5m wattage by 5)
  const totalWattage = isStrip
    ? item.fixtureQuantity * (effectiveWattage / 5)
    : item.fixtureQuantity * effectiveWattage;

  const totalAddresses = item.fixtureQuantity * effectiveAddressesConsumed;

  // 2. Calculate Lines / Universes & Controller count
  const maxAddrPerPort = controller.maxAddressesPerPort || 64;
  const universesOrLinesNeeded = Math.ceil(totalAddresses / maxAddrPerPort);
  const portsCount = controller.portsCount || 1;
  const controllersNeededCount = Math.ceil(universesOrLinesNeeded / portsCount);

  // 2.1 Calculate Sub-Controllers Needed (If BMS supported or ZXP399 and subController is present)
  let subControllersNeededCount = 0;
  let autoSubControllersCount = 0;
  const isSubControllerAuto = item.subControllerAutoQty !== false; // Mặc định là True (Tự động tính)

  const activeParent = item.parentConnection || (
    item.subControllerId && item.subControllerId !== 'none' ? 'sub1' : 
    (item.subController2Id && item.subController2Id && item.subController2Id !== 'none' ? 'sub2' : 'master')
  );

  if (allowSubControllers && subController && item.subControllerId && item.subControllerId !== 'none' && activeParent === 'sub1') {
    const subPorts = subController.portsCount || 1;
    const byUniv = Math.ceil(universesOrLinesNeeded / subPorts);
    const byFixtures = Math.ceil(item.fixtureQuantity / (subPorts * 32));
    autoSubControllersCount = item.fixtureQuantity > 0 ? Math.max(1, byUniv, byFixtures) : 0;

    if (isSubControllerAuto) {
      subControllersNeededCount = autoSubControllersCount;
    } else {
      subControllersNeededCount = (item.subControllerQuantity !== undefined && item.subControllerQuantity > 0)
        ? item.subControllerQuantity
        : autoSubControllersCount;
    }
  }

  // 2.2 Calculate Secondary Sub-Controllers 2 Needed (If BMS supported or ZXP399)
  let subControllers2NeededCount = 0;
  if (allowSubControllers && subController2 && item.subController2Id && item.subController2Id !== 'none' && activeParent === 'sub2') {
    if (item.subController2Quantity !== undefined && item.subController2Quantity > 0) {
      subControllers2NeededCount = item.subController2Quantity;
    } else {
      subControllers2NeededCount = 1;
    }
  }

  // 3. Distance & Cable Length Calculation
  // Total distance = controllerToFirstFixtureDistance + (quantity - 1) * interFixtureDistance
  const calculatedCableLength = item.controllerToFirstFixtureDistance + Math.max(0, item.fixtureQuantity - 1) * item.interFixtureDistance;
  const effectiveDistance = Math.max(item.totalCableLengthMeters, calculatedCableLength);

  // 4. Repeaters & Amplifiers Calculation
  let repeatersNeededCount = 0;
  let repeaterReason = '';

  const isDMX = fixture.protocol === 'DMX512/RDM' || controller.protocol === 'DMX512/RDM';
  const isDALI = fixture.protocol.includes('DALI') || controller.protocol.includes('DALI');
  const is110V = fixture.protocol === '1-10V' || controller.protocol === '1-10V';

  if (isDMX) {
    const distLimit = 100; // DMX standard 100m segment limit without splitter/isolator
    const tapLimit = 32;   // Max 32 fixtures in daisy chain

    const countByDist = Math.ceil(effectiveDistance / distLimit) - 1;
    const countByTaps = Math.ceil(item.fixtureQuantity / tapLimit) - 1;

    repeatersNeededCount = Math.max(0, countByDist, countByTaps);

    if (repeatersNeededCount > 0) {
      repeaterReason = `Đoạn dây DMX dài ${effectiveDistance.toFixed(1)}m (>100m) hoặc số đèn ${item.fixtureQuantity} cái (>32 đèn/line) -> Tự động thêm ${repeatersNeededCount} DMX Opto-Splitter / Repeater.`;
      warnings.push(`Cảnh báo khoảng cách DMX: ${repeaterReason}`);
    }
  } else if (isDALI) {
    const distLimit = 300; // DALI standard 300m cable limit @ 1.5mm²
    const addrLimit = 64;

    const countByDist = Math.ceil(effectiveDistance / distLimit) - 1;
    const countByAddr = Math.ceil(totalAddresses / addrLimit) - 1;

    repeatersNeededCount = Math.max(0, countByDist, countByAddr);

    if (repeatersNeededCount > 0) {
      repeaterReason = `Tuyến DALI Bus dài ${effectiveDistance.toFixed(1)}m (>300m) hoặc quá 64 địa chỉ -> Tự động thêm ${repeatersNeededCount} DALI Line Repeater.`;
      warnings.push(`Cảnh báo tuyến DALI: ${repeaterReason}`);
    }
  } else if (is110V) {
    const distLimit = 100;
    const ballastLimit = 16; // 16 ballasts per 1-10V channel

    const countByDist = Math.ceil(effectiveDistance / distLimit) - 1;
    const countByBallast = Math.ceil(item.fixtureQuantity / ballastLimit) - 1;

    repeatersNeededCount = Math.max(0, countByDist, countByBallast);

    if (repeatersNeededCount > 0) {
      repeaterReason = `Số đèn 1-10V (${item.fixtureQuantity} cái) vượt quá 16 đèn/kênh hoặc chiều dài dây > 100m -> Thêm ${repeatersNeededCount} bộ khuếch đại signal 1-10V.`;
      warnings.push(`Cảnh báo 1-10V: ${repeaterReason}`);
    }
  }

  // 5. Special Power / Data Injectors (Color Kinetics / DMX Power Data Supply)
  let specialInjectorsNeededCount = 0;
  let injectorModelName = 'Không yêu cầu';

  if (fixture.requiresSpecialInjector) {
    const maxWattage = fixture.maxWattagePerInjector || 320;
    const maxFix = fixture.maxFixturesPerInjector || 32;

    const countByW = Math.ceil(totalWattage / maxWattage);
    const countByFix = Math.ceil(item.fixtureQuantity / maxFix);

    specialInjectorsNeededCount = Math.max(countByW, countByFix);
    injectorModelName = fixture.injectorModelRequired || 'Signify Data Enabler Pro (320W / 32 Fixtures)';

    warnings.push(
      `Đèn ${fixture.brand} yêu cầu ${specialInjectorsNeededCount} bộ trộn nguồn & tín hiệu [${injectorModelName}] (Tổng ${totalWattage}W, ${item.fixtureQuantity} đèn).`
    );
  }

  // 6. DALI Bus Power Supply
  let daliBusPowerSuppliesCount = 0;
  if (isDALI && !controller.notes.includes('Tích hợp nguồn')) {
    daliBusPowerSuppliesCount = universesOrLinesNeeded;
  }

  // 7. BMS Gateway Calculation
  let bmsGatewaysNeededCount = 0;
  let bmsGatewayModelName = 'Không';

  if (item.bmsRequired !== 'None') {
    const isZXP = controller.model.includes('ZXP399') || controller.brand.toLowerCase().includes('signify') || controller.brand.toLowerCase().includes('philips');
    const isExternalGateway = controller.bmsIntegrationType === 'External Gateway';
    const nativeSupport = !isExternalGateway && !isZXP && controller.bmsSupport.includes(item.bmsRequired);

    if (!nativeSupport) {
      bmsGatewaysNeededCount = 1;
      if (isZXP || isExternalGateway) {
        if (item.bmsRequired === 'BACnet IP' || item.bmsRequired === 'BACnet MSTP') {
          bmsGatewayModelName = 'ADFWeb HD67718-IP / Intesis INBACDMX (BACnet to DMX Gateway)';
        } else if (item.bmsRequired === 'Modbus TCP' || item.bmsRequired === 'Modbus RTU') {
          bmsGatewayModelName = 'ADFWeb HD67719-IP / Intesis INMBSDM (Modbus to DMX Gateway)';
        } else if (item.bmsRequired === 'KNX') {
          bmsGatewayModelName = 'ADFWeb HD67822-IP / Intesis INKNXDM (KNX to DMX Gateway)';
        } else {
          bmsGatewayModelName = `ADFWeb / Intesis (${item.bmsRequired} to DMX IN Gateway)`;
        }
        warnings.push(`Bộ điều khiển Signify ${controller.model} không hỗ trợ cổng Native BMS -> Bắt buộc dùng Gateway hãng thứ 3 [${bmsGatewayModelName}] nhận tín hiệu BMS và cấp DMX IN vào ZXP399.`);
      } else {
        bmsGatewayModelName = `Bộ Cổng Chuyển Đổi BMS ${item.bmsRequired} Gateway`;
        warnings.push(`Bộ điều khiển ${controller.model} chưa tích hợp ${item.bmsRequired} -> Tự động thêm 1 BMS Gateway [${bmsGatewayModelName}].`);
      }
    } else {
      bmsGatewayModelName = `Tích hợp sẵn trên ${controller.model}`;
    }
  }

  // 8. Protocol Converter (DMX to DALI, SPI to DMX, etc.)
  let protocolConvertersNeededCount = 0;
  let protocolConverterModelName = 'Không';
  
  if (fixture.protocol.includes('DALI') && controller.protocol === 'DMX512/RDM') {
      protocolConvertersNeededCount = universesOrLinesNeeded;
      protocolConverterModelName = 'Bộ Chuyển Đổi DMX sang DALI (DMX-DALI Gateway)';
      warnings.push(`Cảnh báo: Đèn DALI dùng điều khiển DMX -> Tự động thêm ${protocolConvertersNeededCount} bộ chuyển đổi [${protocolConverterModelName}].`);
  } else if (fixture.protocol === 'SPI' && controller.protocol === 'DMX512/RDM') {
      protocolConvertersNeededCount = universesOrLinesNeeded;
      protocolConverterModelName = 'Bộ Chuyển Đổi SPI sang DMX (SPI-DMX Decoder)';
      warnings.push(`Cảnh báo: Đèn SPI dùng điều khiển DMX -> Tự động thêm ${protocolConvertersNeededCount} bộ chuyển đổi [${protocolConverterModelName}].`);
  } else if (fixture.protocol === '1-10V' && controller.protocol === 'DMX512/RDM') {
      // LT-84A has 4 channels, so 1 module can control up to 4 channels of 1-10V dimming.
      protocolConvertersNeededCount = Math.max(1, Math.ceil(universesOrLinesNeeded / 4));
      protocolConverterModelName = 'LTECH LT-84A (DMX to 0-10V/1-10V Converter)';
      warnings.push(`Cảnh báo: Đèn 1-10V dùng điều khiển DMX -> Tự động thêm ${protocolConvertersNeededCount} bộ chuyển đổi tín hiệu [${protocolConverterModelName}].`);
  } else if (fixture.protocol === '1-10V' && controller.protocol.includes('DALI')) {
      // LT-84A also works with DALI input to 0-10V/1-10V output
      protocolConvertersNeededCount = Math.max(1, Math.ceil(universesOrLinesNeeded / 4));
      protocolConverterModelName = 'LTECH LT-84A (DALI to 0-10V/1-10V Converter)';
      warnings.push(`Cảnh báo: Đèn 1-10V dùng điều khiển DALI -> Tự động thêm ${protocolConvertersNeededCount} bộ chuyển đổi tín hiệu [${protocolConverterModelName}].`);
  }

  // General Capacity Checks
  const sub1Capacity = (allowSubControllers && subController) ? (subController.portsCount || 1) * (item.subControllerQuantity || 1) : 0;
  const sub2Capacity = (allowSubControllers && subController2) ? (subController2.portsCount || 1) * (item.subController2Quantity || 1) : 0;
  const totalCombinedCap = (controller.portsCount || 1) + sub1Capacity + sub2Capacity;
  const maxCombinedAddresses = totalCombinedCap * (controller.maxAddressesPerPort || 512);
  if (totalAddresses > controller.maxAddressesPerPort * controller.portsCount) {
    if ((sub1Capacity > 0 || sub2Capacity > 0) && totalAddresses <= maxCombinedAddresses) {
      // Sub-controller expands the universe capacity to cover this load smoothly
    } else {
      warnings.push(`Vượt quá năng lực quản lý của 1 bộ điều khiển ${controller.model} (${totalAddresses} địa chỉ > ${controller.maxAddressesPerPort * controller.portsCount}). Hệ thống tự động tính thành ${controllersNeededCount} bộ điều khiển.`);
    }
  }

  return {
    item,
    fixture,
    controller,
    subController,
    subController2,
    effectiveWattage,
    effectiveVoltage,
    effectiveBeamAngle,
    effectiveColorTemp,
    exactModelCode,
    effectiveAddressesConsumed,
    totalWattage,
    totalAddresses,
    universesOrLinesNeeded,
    controllersNeededCount,
    subControllersNeededCount,
    autoSubControllersCount,
    isSubControllerAuto,
    subControllers2NeededCount,
    repeatersNeededCount,
    repeaterReason,
    specialInjectorsNeededCount,
    injectorModelName,
    bmsGatewaysNeededCount,
    bmsGatewayModelName,
    protocolConvertersNeededCount,
    protocolConverterModelName,
    daliBusPowerSuppliesCount,
    warnings
  };
}

// Generate Aggregate Bill of Quantities (BOM / BOQ)
export function generateBOQ(
  lineResults: CalculatedLineResult[]
): { boqItems: BOQItem[]; totalCostVND: number; totalPowerKW: number } {
  const map = new Map<string, BOQItem>();

  let totalPowerKW = 0;

  // Helper to extract area name
  const getAreaName = (zoneName: string) => {
    if (zoneName.includes(' - ')) return zoneName.split(' - ')[0].trim();
    if (zoneName.includes(': ')) return zoneName.split(': ')[0].trim();
    return zoneName.trim();
  };

  // Group master controllers by Area + Controller Model so 1 central master controller in the Control Room manages all lines in the area
  const areaControllerMap = new Map<string, {
    areaName: string;
    controller: ControllerDevice;
    totalUniversesNeeded: number;
    totalAddresses: number;
    linesCount: number;
  }>();

  // Group sub-controllers by Area + Sub-Controller Model so quantity (e.g. 10x EDN 10 = +100 Universes) is counted per area
  const areaSubControllerMap = new Map<string, {
    areaName: string;
    subController: SubControllerDevice;
    quantity: number;
    linesCount: number;
  }>();

  const areaSubController2Map = new Map<string, {
    areaName: string;
    subController2: SubControllerDevice;
    quantity: number;
    linesCount: number;
  }>();

  const areaBmsMap = new Map<string, {
    areaName: string;
    controller: ControllerDevice;
    bmsRequired: string;
    bmsGatewayModelName: string;
  }>();

  for (const res of lineResults) {
    if (!res.fixture || !res.controller) continue;

    totalPowerKW += res.totalWattage / 1000;

    // 1. Luminaires (Keyed by exact variant model code so specs don't merge)
    const exactCode = res.exactModelCode || res.fixture.model;
    const lumKey = `lum-${res.fixture.id}-${exactCode}`;
    const isStrip = isLedStrip(res.fixture);
    const unitPrice = isStrip ? (res.fixture.priceVND / 5) : res.fixture.priceVND;

    if (map.has(lumKey)) {
      const existing = map.get(lumKey)!;
      existing.quantity += res.item.fixtureQuantity;
      existing.totalPriceVND = existing.quantity * existing.unitPriceVND;
    } else {
      map.set(lumKey, {
        id: lumKey,
        category: 'Luminaire',
        brand: res.fixture.brand,
        model: exactCode,
        name: res.fixture.name,
        quantity: res.item.fixtureQuantity,
        unit: isStrip ? 'Mét' : 'Bộ',
        unitPriceVND: unitPrice,
        totalPriceVND: res.item.fixtureQuantity * unitPrice,
        notes: isStrip
          ? `Tùy chọn kỹ thuật (LED dây): ${res.effectiveWattage / 5}W/m | Màu ${res.effectiveColorTemp} | Điện áp ${res.effectiveVoltage}`
          : `Tùy chọn kỹ thuật: ${res.effectiveWattage}W | Góc ${res.effectiveBeamAngle} | Màu ${res.effectiveColorTemp} | Điện áp ${res.effectiveVoltage}`
      });
    }

    // 2. Track Central Master Controllers aggregated by Area
    const areaName = getAreaName(res.item.zoneName);
    const areaCtrlKey = `${areaName}___${res.controller.id}`;
    if (areaControllerMap.has(areaCtrlKey)) {
      const existing = areaControllerMap.get(areaCtrlKey)!;
      existing.totalUniversesNeeded += res.universesOrLinesNeeded;
      existing.totalAddresses += res.totalAddresses;
      existing.linesCount += 1;
    } else {
      areaControllerMap.set(areaCtrlKey, {
        areaName,
        controller: res.controller,
        totalUniversesNeeded: res.universesOrLinesNeeded,
        totalAddresses: res.totalAddresses,
        linesCount: 1
      });
    }

    // 2.1 Track Sub-Controllers 1 aggregated by Area (e.g., Pharos EDN 10, RIO 84, e:node)
    if (res.subController && res.subControllersNeededCount > 0) {
      const areaSubKey = `${areaName}___${res.subController.id}`;
      if (areaSubControllerMap.has(areaSubKey)) {
        const existing = areaSubControllerMap.get(areaSubKey)!;
        existing.linesCount += 1;
        // Keep the explicit quantity set by user for the area
        existing.quantity = Math.max(existing.quantity, res.subControllersNeededCount);
      } else {
        areaSubControllerMap.set(areaSubKey, {
          areaName,
          subController: res.subController,
          quantity: res.subControllersNeededCount,
          linesCount: 1
        });
      }
    }

    // 2.2 Track Sub-Controllers 2 aggregated by Area (Keypad / Sensor / Remote Module)
    if (res.subController2 && res.subControllers2NeededCount > 0) {
      const areaSub2Key = `${areaName}___${res.subController2.id}`;
      if (areaSubController2Map.has(areaSub2Key)) {
        const existing = areaSubController2Map.get(areaSub2Key)!;
        existing.linesCount += 1;
        existing.quantity = Math.max(existing.quantity, res.subControllers2NeededCount);
      } else {
        areaSubController2Map.set(areaSub2Key, {
          areaName,
          subController2: res.subController2,
          quantity: res.subControllers2NeededCount,
          linesCount: 1
        });
      }
    }

    // 3. Special Power & Data Injectors (Color Kinetics Data Enabler Pro, etc.)
    if (res.specialInjectorsNeededCount > 0) {
      const injKey = `inj-${res.injectorModelName}`;
      let unitPrice = 14500000; // Estimated unit price for Data Enabler Pro
      if (res.injectorModelName.includes('sPDS-480ca')) unitPrice = 18000000;

      if (map.has(injKey)) {
        const existing = map.get(injKey)!;
        existing.quantity += res.specialInjectorsNeededCount;
        existing.totalPriceVND = existing.quantity * existing.unitPriceVND;
      } else {
        map.set(injKey, {
          id: injKey,
          category: 'Power/Data Injector',
          brand: res.fixture.brand.includes('ColorKinetics') ? 'Signify ColorKinetics' : res.fixture.brand,
          model: res.injectorModelName,
          name: `Bộ Trộn Nguồn & Tín Hiệu [${res.injectorModelName}]`,
          quantity: res.specialInjectorsNeededCount,
          unit: 'Bộ',
          unitPriceVND: unitPrice,
          totalPriceVND: res.specialInjectorsNeededCount * unitPrice,
          notes: 'Bộ trộn nguồn AC/DC và tín hiệu điều khiển DMX/Ethernet ra đèn'
        });
      }
    }

    // 4. Repeaters & DMX Splitters
    if (res.repeatersNeededCount > 0) {
      const isDMX = res.fixture?.protocol === 'DMX512/RDM';
      const isPharos = res.controller?.brand?.includes('Pharos');
      const repModel = isDMX 
        ? (isPharos ? 'Pharos DMX Repeater 4-Port' : 'DMX RDM Opto-Splitter / Repeater 4-Port')
        : 'DALI Line Repeater / Signal Booster';
      const repBrand = isDMX 
        ? (isPharos ? 'Pharos Controls' : 'Pharos Controls / Dynalite') 
        : 'Helvar / Tridonic';
      const unitPrice = isDMX 
        ? (isPharos ? 12500000 : 11000000) 
        : 7200000;
      const repKey = `rep-${repModel}`;

      if (map.has(repKey)) {
        const existing = map.get(repKey)!;
        existing.quantity += res.repeatersNeededCount;
        existing.totalPriceVND = existing.quantity * existing.unitPriceVND;
      } else {
        map.set(repKey, {
          id: repKey,
          category: 'Signal Repeater / Amp',
          brand: repBrand,
          model: repModel,
          name: isDMX 
            ? (isPharos ? 'Bộ Lặp & Khuếch Đại Tín Hiệu Pharos DMX Repeater (4 Cổng)' : 'Bộ Chia & Khuếch Đại Tín Hiệu DMX512 Cách Ly Quang') 
            : 'Bộ Kích Tín Hiệu DALI Bus Line Repeater',
          quantity: res.repeatersNeededCount,
          unit: 'Bộ',
          unitPriceVND: unitPrice,
          totalPriceVND: res.repeatersNeededCount * unitPrice,
          notes: isPharos 
            ? `Bộ lặp và khuếch đại tín hiệu DMX/RDM chính hãng Pharos (DMX Repeater) theo đúng nguyên lý thiết kế hệ thống tủ điều khiển Pharos.` 
            : res.repeaterReason
        });
      }
    }

    // 5. Track BMS Gateways aggregated by Area (1 Gateway per Area Master Controller if not natively supported)
    if (res.bmsGatewaysNeededCount > 0) {
      if (!areaBmsMap.has(areaName)) {
        areaBmsMap.set(areaName, {
          areaName,
          controller: res.controller,
          bmsRequired: res.item.bmsRequired,
          bmsGatewayModelName: res.bmsGatewayModelName
        });
      }
    }

    // 6. DALI Bus Power Supplies
    if (res.daliBusPowerSuppliesCount > 0) {
      const psKey = 'dali-ps-240ma';
      const unitPrice = 3200000;

      if (map.has(psKey)) {
        const existing = map.get(psKey)!;
        existing.quantity += res.daliBusPowerSuppliesCount;
        existing.totalPriceVND = existing.quantity * existing.unitPriceVND;
      } else {
        map.set(psKey, {
          id: psKey,
          category: 'Accessory',
          brand: 'Tridonic / Helvar',
          model: 'DALI PS 240mA DIN-Rail',
          name: 'Bộ Nguồn DALI Bus Power Supply 240mA',
          quantity: res.daliBusPowerSuppliesCount,
          unit: 'Bộ',
          unitPriceVND: unitPrice,
          totalPriceVND: res.daliBusPowerSuppliesCount * unitPrice,
          notes: 'Cấp nguồn 16VDC 240mA cho tuyến tín hiệu DALI'
        });
      }
    }

    // 7. Protocol Converters (DMX to DALI, etc.)
    if (res.protocolConvertersNeededCount > 0) {
      const convKey = `conv-${res.protocolConverterModelName}`;
      let unitPrice = 5500000; // Default DMX-DALI Gateway price
      let brand = 'Generic/Specialized';
      let notes = 'Chuyển đổi giao thức điều khiển cho tuyến đèn';

      if (res.protocolConverterModelName.includes('LT-84A')) {
        unitPrice = 4500000;
        brand = 'LTECH';
        notes = 'Bộ chuyển đổi tín hiệu cao cấp LTECH LT-84A: DMX/DALI sang 0-10V/1-10V (4 Kênh), tích hợp rơ-le AC ngắt nguồn 10A chống dòng rò và triệt tiêu năng lượng chờ.';
      } else if (res.protocolConverterModelName.includes('SPI-DMX')) {
        unitPrice = 3500000;
        brand = 'Generic/Specialized';
        notes = 'Bộ giải mã tín hiệu DMX sang SPI (SPI-DMX Decoder) điều khiển led dây IC chạy hiệu ứng đuổi màu.';
      }
      
      if (map.has(convKey)) {
        const existing = map.get(convKey)!;
        existing.quantity += res.protocolConvertersNeededCount;
        existing.totalPriceVND = existing.quantity * existing.unitPriceVND;
      } else {
        map.set(convKey, {
          id: convKey,
          category: 'Protocol Converter',
          brand: brand,
          model: res.protocolConverterModelName,
          name: res.protocolConverterModelName,
          quantity: res.protocolConvertersNeededCount,
          unit: 'Bộ',
          unitPriceVND: unitPrice,
          totalPriceVND: res.protocolConvertersNeededCount * unitPrice,
          notes: notes
        });
      }
    }
  }

  // Add Central Master Controllers to BOQ aggregated by Area
  areaControllerMap.forEach(({ areaName, controller, totalUniversesNeeded, linesCount }) => {
    const portsCount = controller.portsCount || 1;
    const controllersCount = Math.max(1, Math.ceil(totalUniversesNeeded / portsCount));
    const ctrlKey = `ctrl-${controller.id}`;

    if (map.has(ctrlKey)) {
      const existing = map.get(ctrlKey)!;
      existing.quantity += controllersCount;
      existing.totalPriceVND = existing.quantity * existing.unitPriceVND;
      existing.notes += ` | Điều khiển ${linesCount} tuyến khu vực [${areaName}] (${totalUniversesNeeded} Universes)`;
    } else {
      map.set(ctrlKey, {
        id: ctrlKey,
        category: 'Controller',
        brand: controller.brand,
        model: controller.model,
        name: `${controller.name} (Bộ Điều Khiển Trung Tâm)`,
        quantity: controllersCount,
        unit: 'Bộ',
        unitPriceVND: controller.priceVND,
        totalPriceVND: controllersCount * controller.priceVND,
        notes: `Đặt tại Phòng Điều Khiển Trung Tâm (PC Server) - Quản lý ${linesCount} tuyến đèn khu vực [${areaName}] (Tổng ${totalUniversesNeeded}/${portsCount * controllersCount} Universes, ${controller.protocol})`
      });
    }
  });

  // Add Sub-Controllers 1 (Expansion Nodes / EDN / RIO) to BOQ aggregated by Area
  areaSubControllerMap.forEach(({ areaName, subController, quantity, linesCount }) => {
    const subKey = `subctrl-${subController.id}`;
    const expandedUniverses = (subController.portsCount || 1) * quantity;

    if (map.has(subKey)) {
      const existing = map.get(subKey)!;
      existing.quantity += quantity;
      existing.totalPriceVND = existing.quantity * existing.unitPriceVND;
      existing.notes += ` | Khu vực [${areaName}]: ${quantity} bộ (+${expandedUniverses} Universes)`;
    } else {
      map.set(subKey, {
        id: subKey,
        category: 'Sub-Controller',
        brand: subController.brand,
        model: subController.model,
        name: subController.name,
        quantity: quantity,
        unit: 'Bộ',
        unitPriceVND: subController.priceVND,
        totalPriceVND: quantity * subController.priceVND,
        notes: `Cung cấp ${expandedUniverses} Universes mở rộng (${quantity} bộ x ${subController.portsCount} Ports) cho ${linesCount} tuyến khu vực [${areaName}] (${subController.voltageInput})`
      });
    }
  });

  // Add Sub-Controllers 2 (Keypad / Touchscreen / Remote Sensor) to BOQ aggregated by Area
  areaSubController2Map.forEach(({ areaName, subController2, quantity, linesCount }) => {
    const sub2Key = `subctrl2-${subController2.id}`;
    const expandedPorts = (subController2.portsCount || 1) * quantity;

    if (map.has(sub2Key)) {
      const existing = map.get(sub2Key)!;
      existing.quantity += quantity;
      existing.totalPriceVND = existing.quantity * existing.unitPriceVND;
      existing.notes += ` | Khu vực [${areaName}]: ${quantity} bộ`;
    } else {
      map.set(sub2Key, {
        id: sub2Key,
        category: 'Sub-Controller',
        brand: subController2.brand,
        model: subController2.model,
        name: subController2.name,
        quantity: quantity,
        unit: 'Bộ',
        unitPriceVND: subController2.priceVND,
        totalPriceVND: quantity * subController2.priceVND,
        notes: `Thiết bị phụ trợ 2 mở rộng (${quantity} bộ x ${subController2.portsCount} Ports = +${expandedPorts} Ports) cho khu vực [${areaName}] (${subController2.voltageInput})`
      });
    }
  });

  // Add BMS Gateways aggregated by Area (1 Gateway per Area Master Controller requiring external conversion)
  areaBmsMap.forEach(({ areaName, controller, bmsRequired, bmsGatewayModelName }) => {
    const bmsKey = `bms-${bmsGatewayModelName}`;
    const isZXP = controller.model.includes('ZXP399') || controller.brand.toLowerCase().includes('signify') || controller.brand.toLowerCase().includes('philips');
    const isExternalGateway = controller.bmsIntegrationType === 'External Gateway';
    const gatewayBrand = (isZXP || isExternalGateway) ? 'ADFWeb / Intesis' : controller.brand;
    const unitPrice = (isZXP || isExternalGateway) ? 22500000 : 28000000;
    const gatewayName = (isZXP || isExternalGateway)
      ? `Bộ Cổng Chuyển Đổi Giao Thức Công Nghiệp BMS (${bmsRequired} ➔ DMX IN)`
      : `Bộ Cổng Chuyển Đổi Giao Thức BMS (${bmsRequired})`;
    const gatewayNotes = (isZXP || isExternalGateway)
      ? `Signify ZXP399 không hỗ trợ cổng Native BMS. Hệ thống trang bị Gateway hãng thứ 3 [${bmsGatewayModelName}] chuyển đổi ${bmsRequired} sang DMX IN cắm vào cổng DMX IN của ZXP399 Master Controller để kích hoạt Scenes khu vực [${areaName}].`
      : `Tích hợp giao thức BMS ${bmsRequired} cho Master Controller khu vực [${areaName}]`;

    if (map.has(bmsKey)) {
      const existing = map.get(bmsKey)!;
      existing.quantity += 1;
      existing.totalPriceVND = existing.quantity * existing.unitPriceVND;
      existing.notes += ` | Khu vực [${areaName}]`;
    } else {
      map.set(bmsKey, {
        id: bmsKey,
        category: 'BMS Gateway',
        brand: gatewayBrand,
        model: bmsGatewayModelName,
        name: gatewayName,
        quantity: 1,
        unit: 'Bộ',
        unitPriceVND: unitPrice,
        totalPriceVND: unitPrice,
        notes: gatewayNotes
      });
    }
  });

  const boqItems = Array.from(map.values());
  const totalCostVND = boqItems.reduce((sum, item) => sum + item.totalPriceVND, 0);

  return {
    boqItems,
    totalCostVND,
    totalPowerKW
  };
}

// Utility to format VND currency
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}
