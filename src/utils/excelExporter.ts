import * as XLSX from 'xlsx';
import { ControllerDevice, LuminaireFixture, CalculatedLineResult, BOQItem, LightingProject } from '../types';
import { formatVND } from './calculator';
import { calculateVoltageDropForLine } from './voltageDropCalculator';

export function exportFullLightingSpreadsheetToExcel(
  controllers: ControllerDevice[],
  luminaires: LuminaireFixture[],
  lineResults: CalculatedLineResult[],
  boqItems: BOQItem[],
  totalCostVND: number,
  totalPowerKW: number,
  project?: LightingProject
) {
  const wb = XLSX.utils.book_new();

  // --- SHEET 1: HÃNG & THIẾT BỊ ĐIỀU KHIỂN ---
  const sheet1Data = controllers.map((c, idx) => ({
    'STT': idx + 1,
    'Hãng Sản Xuất': c.brand,
    'Mã Thiết Bị (Model)': c.model,
    'Tên & Chức Năng': c.name,
    'Giao Thức Điều Khiển': c.protocol,
    'Số Địa Chỉ/Kênh Max / Port': c.maxAddressesPerPort,
    'Số Port / Universe': c.portsCount,
    'Max Đèn Daisy-Chain / Line': c.maxDaisyChainDevices,
    'Max Khoảng Cách Dây (m)': c.maxCableDistanceMeters,
    'Hỗ Trợ BMS': c.bmsSupport.join(', '),
    'Điện Áp Cấp': c.voltageInput,
    'Đơn Giá Tham Khảo (VNĐ)': c.priceVND,
    'Ghi Chú Kỹ Thuật': c.notes
  }));

  const ws1 = XLSX.utils.json_to_sheet(sheet1Data);
  // Style headers
  const range1 = XLSX.utils.decode_range(ws1['!ref'] || 'A1:M1');
  for (let C = range1.s.c; C <= range1.e.c; ++C) {
    const address = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!ws1[address]) continue;
    ws1[address].s = { font: { bold: true }, fill: { fgColor: { rgb: "DDDDDD" } } };
  }
  ws1['!cols'] = [
    { wch: 5 },  // STT
    { wch: 20 }, // Hãng
    { wch: 18 }, // Model
    { wch: 35 }, // Tên
    { wch: 15 }, // Protocol
    { wch: 12 }, // Max Addr
    { wch: 10 }, // Ports
    { wch: 12 }, // Max Daisy
    { wch: 12 }, // Distance
    { wch: 20 }, // BMS
    { wch: 18 }, // Voltage
    { wch: 18 }, // Price
    { wch: 45 }  // Notes
  ];
  XLSX.utils.book_append_sheet(wb, ws1, 'Sheet 1 - Controllers');

  // --- SHEET 2: HÃNG ĐÈN & LOẠI ĐÈN ---
  const sheet2Data = luminaires.map((f, idx) => ({
    'STT': idx + 1,
    'Hãng Đèn': f.brand,
    'Mã Đèn (Model)': f.model,
    'Tên & Loại Đèn Fixture': f.name,
    'Cấp Bảo Vệ (IP)': f.ipRating || 'N/A',
    'Chỉ Số Hoàn Màu (CRI)': f.cri || 'N/A',
    'Góc Chiếu (Beam)': f.beamAngle || 'N/A',
    'Quang Thông (Lumens)': f.luminousFluxLm || 'N/A',
    'Màu Sắc / Nhiệt Độ Màu': f.colorTemp || 'N/A',
    'Chất Liệu Vỏ / Thân': f.housingMaterial || 'N/A',
    'Chuẩn Điều Khiển': f.protocol,
    'Kiểu Dimming': f.dimType,
    'Địa Chỉ Tiêu Thụ / Đèn': f.addressesConsumed,
    'Công Suất (W)': f.wattage,
    'Điện Áp Cấp': f.voltage,
    'Bộ Trộn Nguồn/Data Riêng?': f.requiresSpecialInjector ? 'CÓ (Cần Data Enabler/PDS)' : 'Không',
    'Mã Bộ Trộn Nguồn/Data': f.injectorModelRequired || 'N/A',
    'Max Đèn / Bộ Trộn': f.maxFixturesPerInjector || 'N/A',
    'Max Watt / Bộ Trộn': f.maxWattagePerInjector || 'N/A',
    'Max Distance Đèn-Đèn (m)': f.maxInterFixtureDistanceMeters,
    'Max Distance Ctrl-Đèn Cuối (m)': f.maxControllerToLastFixtureMeters,
    'Ngưỡng Cần Repeater (m)': f.repeaterThresholdDistanceMeters,
    'Đơn Giá Tham Khảo (VNĐ)': f.priceVND,
    'Ghi Chú & Phụ Kiện': f.notes
  }));

  const ws2 = XLSX.utils.json_to_sheet(sheet2Data);
  ws2['!cols'] = [
    { wch: 5 },
    { wch: 22 },
    { wch: 20 },
    { wch: 38 },
    { wch: 12 },
    { wch: 12 },
    { wch: 18 },
    { wch: 15 },
    { wch: 20 },
    { wch: 25 },
    { wch: 15 },
    { wch: 18 },
    { wch: 10 },
    { wch: 12 },
    { wch: 22 },
    { wch: 18 },
    { wch: 25 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 45 }
  ];
  XLSX.utils.book_append_sheet(wb, ws2, 'Sheet 2 - Luminaires');

  // --- SHEET 3: BẢNG TÍNH THIẾT KẾ ĐIỀU KHIỂN CHI TIẾT ---
  const sheet3Data = lineResults.map((res, idx) => ({
    'STT': idx + 1,
    'Khu Vực / Tuyến Đèn': res.item.zoneName,
    'Hãng Đèn': res.item.luminaireBrand,
    'Mã Đèn': res.fixture?.model || 'N/A',
    'Số Lượng Đèn (Bộ)': res.item.fixtureQuantity,
    'Địa Chỉ / Đèn': res.fixture?.addressesConsumed || 0,
    'Tổng Địa Chỉ / Kênh': res.totalAddresses,
    'Công Suất / Đèn (W)': res.effectiveWattage,
    'Tổng Công Suất Tuyến (W)': res.totalWattage,
    'Khoảng Cách Đèn-Đèn (m)': res.item.interFixtureDistance,
    'Khoảng Cách Tủ-Đèn Đầu (m)': res.item.controllerToFirstFixtureDistance,
    'Tổng Chiều Dài Cáp Tuyến (m)': res.item.totalCableLengthMeters,
    'Hãng Controller': res.item.controllerBrand,
    'Mã Controller': res.controller?.model || 'N/A',
    'Số Port/Line Cần': res.universesOrLinesNeeded,
    'Cần Repeater/Splitter?': res.repeatersNeededCount > 0 ? `CÓ (${res.repeatersNeededCount} bộ)` : 'Không',
    'Cần Bộ Trộn Data Enabler?': res.specialInjectorsNeededCount > 0 ? `CÓ (${res.specialInjectorsNeededCount} bộ ${res.injectorModelName})` : 'Không',
    'Tích Hợp BMS': res.item.bmsRequired,
    'Đánh Giá An Toàn & Cảnh Báo': res.warnings.length === 0 ? 'ĐẠT TIÊU CHUẨN' : res.warnings.join(' | ')
  }));

  const ws3 = XLSX.utils.json_to_sheet(sheet3Data);
  ws3['!cols'] = [
    { wch: 5 },
    { wch: 30 },
    { wch: 18 },
    { wch: 20 },
    { wch: 15 },
    { wch: 12 },
    { wch: 15 },
    { wch: 15 },
    { wch: 18 },
    { wch: 15 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 20 },
    { wch: 14 },
    { wch: 18 },
    { wch: 25 },
    { wch: 15 },
    { wch: 45 }
  ];
  XLSX.utils.book_append_sheet(wb, ws3, 'Sheet 3 - Design Calculator');

  // --- SHEET 4: TỔNG HỢP KHỐI LƯỢNG VẬT TƯ & DỰ TOÁN BOQ ---
  const sheet4Data: Array<Record<string, any>> = boqItems.map((item, idx) => ({
    'STT': idx + 1,
    'Hạng Mục': item.category,
    'Hãng Sản Xuất': item.brand,
    'Mã Vật Tư / Thiết Bị': item.model,
    'Mô Tả Chi Tiết': item.name,
    'Số Lượng': item.quantity,
    'Đơn Vị': item.unit,
    'Đơn Giá Dự Kiến (VNĐ)': item.unitPriceVND,
    'Thành Tiền (VNĐ)': item.totalPriceVND,
    'Ghi Chú Kỹ Thuật': item.notes
  }));

  // Append Total Row
  sheet4Data.push({
    'STT': '',
    'Hạng Mục': 'TỔNG CỘNG',
    'Hãng Sản Xuất': '',
    'Mã Vật Tư / Thiết Bị': '',
    'Mô Tả Chi Tiết': `Tổng Công Suất: ${totalPowerKW.toFixed(2)} kW`,
    'Số Lượng': '',
    'Đơn Vị': '',
    'Đơn Giá Dự Kiến (VNĐ)': '',
    'Thành Tiền (VNĐ)': totalCostVND,
    'Ghi Chú Kỹ Thuật': 'Chưa bao gồm VAT và chi phí nhân công lập trình'
  });

  const ws4 = XLSX.utils.json_to_sheet(sheet4Data);
  ws4['!cols'] = [
    { wch: 5 },
    { wch: 25 },
    { wch: 20 },
    { wch: 22 },
    { wch: 40 },
    { wch: 10 },
    { wch: 8 },
    { wch: 18 },
    { wch: 20 },
    { wch: 45 }
  ];
  XLSX.utils.book_append_sheet(wb, ws4, 'Sheet 4 - Summary BOQ');

  // --- SHEET 5: TÍNH SỤT ÁP & CHỌN CÁP ĐIỆN ĐỘNG LỰC TCVN ---
  const sheet5Data = lineResults.map((res, idx) => {
    const dropRes = calculateVoltageDropForLine(res, {
      assignedPhase: res.item.assignedPhase,
      supplyPhaseTypeOverride: res.item.supplyPhaseType
    });
    return {
      'STT': idx + 1,
      'Tuyến Đèn / Khu Vực': dropRes.zoneName,
      'Pha Cấp Nguồn': dropRes.assignedPhase === '3P' ? '3 Pha (380V)' : dropRes.assignedPhase === 'DC' ? 'DC Supply' : `Pha ${dropRes.assignedPhase} (220V)`,
      'Mã Đèn & Số Lượng': `${dropRes.luminaireModel} (${dropRes.fixtureQuantity} bộ)`,
      'Tổng Công Suất (W)': dropRes.totalWattageW,
      'Điện Áp Cấp (V)': dropRes.voltageSupply,
      'Dòng Điện Tính Toán Ib (A)': dropRes.loadCurrentA,
      'Chiều Dài Tuyến L (m)': dropRes.cableLengthMeters,
      'Tiết Diện Tính Smin (mm²)': dropRes.calculatedMinCrossSectionMm2,
      'Tiết Diện Chuẩn Chọn S (mm²)': dropRes.selectedStandardSizeMm2,
      'Mã Cáp Động Lực Đề Xuất': dropRes.selectedCableCode,
      'Sụt Áp Thực Tế (V)': dropRes.actualVoltageDropV,
      'Sụt Áp Thực Tế (%)': `${dropRes.actualVoltageDropPercent}%`,
      'Sụt Áp Cho Phép (%)': `${dropRes.allowableDropPercent}%`,
      'Dòng Cho Phép Iz (A)': dropRes.currentCarryingCapacityIz,
      'Aptomat MCB Đề Xuất': dropRes.recommendedMCB,
      'Đánh Giá Tiêu Chuẩn': dropRes.isOverallCompliant ? 'ĐẠT CHUẨN TCVN' : 'CẦN NÂNG TIẾT DIỆN'
    };
  });

  const ws5 = XLSX.utils.json_to_sheet(sheet5Data);
  ws5['!cols'] = [
    { wch: 5 },
    { wch: 28 },
    { wch: 18 },
    { wch: 25 },
    { wch: 16 },
    { wch: 12 },
    { wch: 18 },
    { wch: 16 },
    { wch: 18 },
    { wch: 20 },
    { wch: 35 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 16 },
    { wch: 25 },
    { wch: 18 }
  ];
  XLSX.utils.book_append_sheet(wb, ws5, 'Sheet 5 - Voltage Drop TCVN');

  // --- SHEET 6: KIỂM TRA CHÉO & THẨM TRA KỸ THUẬT (QA/QC AUDIT) ---
  const sheet6Data = lineResults.map((res, idx) => {
    const isOver512 = res.totalAddresses > 512;
    const isOver100m = res.item.totalCableLengthMeters > 100;
    const hasInjector = res.specialInjectorsNeededCount > 0;
    
    return {
      'STT': idx + 1,
      'Tuyến Đèn': res.item.zoneName,
      'Hãng Đèn / Mã': `${res.fixture?.brand || ''} - ${res.fixture?.model || ''}`,
      'Số Đèn': res.item.fixtureQuantity,
      'Tổng Địa Chỉ': res.totalAddresses,
      'Kiểm Tra Universe DMX': isOver512 ? `VƯỢT 512 KÊNH (Cần ${res.universesOrLinesNeeded} Universes)` : 'HỢP LỆ (<=512 ch)',
      'Tổng Chiều Dài Cáp': `${res.item.totalCableLengthMeters}m`,
      'Kiểm Tra Khoảng Cách Cáp': isOver100m ? 'CẦN REPEATER/SPLITTER (>100m)' : 'AN TOÀN (<100m)',
      'Bộ Trộn Data Enabler': hasInjector ? `${res.specialInjectorsNeededCount}x ${res.injectorModelName}` : 'Không yêu cầu',
      'Tích Hợp BMS': res.item.bmsRequired,
      'Đánh Giá Thẩm Tra': res.warnings.length === 0 ? 'ĐẠT TIÊU CHUẨN' : res.warnings.join('; ')
    };
  });

  const ws6 = XLSX.utils.json_to_sheet(sheet6Data);
  ws6['!cols'] = [
    { wch: 5 },
    { wch: 32 },
    { wch: 30 },
    { wch: 10 },
    { wch: 14 },
    { wch: 28 },
    { wch: 18 },
    { wch: 30 },
    { wch: 30 },
    { wch: 15 },
    { wch: 45 }
  ];
  XLSX.utils.book_append_sheet(wb, ws6, 'Sheet 6 - QA QC Cross-Check');

  // Trigger file download
  const dateStr = new Date().toISOString().slice(0, 10);
  const projPrefix = project?.code ? `${project.code}_` : '';
  const projNameSafe = project?.name ? project.name.replace(/[^a-zA-Z0-9_\u00C0-\u1EF9]/g, '_').slice(0, 30) : 'Lighting_Design';
  XLSX.writeFile(wb, `${projPrefix}${projNameSafe}_${dateStr}.xlsx`);
}
