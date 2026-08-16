import * as XLSX from 'xlsx';
import { ControllerDevice, LuminaireFixture, CalculatedLineResult, BOQItem, LightingProject } from '../types';
import { formatVND } from './calculator';

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
    { wch: 12 },
    { wch: 12 },
    { wch: 18 },
    { wch: 45 }
  ];
  XLSX.utils.book_append_sheet(wb, ws2, 'Sheet 2 - Luminaires');

  // --- SHEET 3: BẢNG THIẾT KẾ & TÍNH TOÁN HỆ THỐNG ---
  const sheet3Data = lineResults.map((res, idx) => ({
    'STT': idx + 1,
    'Tuyến / Khu Vực': res.item.zoneName,
    'Hãng Đèn': res.item.luminaireBrand,
    'Mã Đèn Chọn': res.fixture ? res.fixture.model : 'N/A',
    'Số Lượng Đèn (cái)': res.item.fixtureQuantity,
    'Địa Chỉ/Đèn': res.fixture ? res.fixture.addressesConsumed : 0,
    'Tổng Số Địa Chỉ': res.totalAddresses,
    'Tổng Công Suất (W)': res.totalWattage,
    'Hãng Điều Khiển': res.item.controllerBrand,
    'Bộ Điều Khiển Chọn': res.controller ? res.controller.model : 'N/A',
    'Số Line/Universe Cần': res.universesOrLinesNeeded,
    'Số Bộ Điều Khiển Cần': res.controllersNeededCount,
    'Thiết Bị Giao Tiếp / Phụ Trợ 1': res.subController ? `${res.subController.model} (${res.subControllersNeededCount} bộ)` : 'Không',
    'Thiết Bị Giao Tiếp / Phụ Trợ 2': res.subController2 ? `${res.subController2.model} (${res.subControllers2NeededCount} bộ)` : 'Không',
    'KC Bộ Cụm -> Đèn Đầu (m)': res.item.controllerToFirstFixtureDistance,
    'KC Trung Bình Đèn-Đèn (m)': res.item.interFixtureDistance,
    'KC Đèn 1 -> Đèn Cuối (m)': Math.max(0, res.item.fixtureQuantity - 1) * res.item.interFixtureDistance,
    'KC Controller -> Đèn Cuối (m)': res.item.controllerToFirstFixtureDistance + Math.max(0, res.item.fixtureQuantity - 1) * res.item.interFixtureDistance,
    'Tổng Chiều Dài Dây (m)': res.item.totalCableLengthMeters,
    'Số DMX/DALI Repeater Cần': res.repeatersNeededCount,
    'Lý Do Cần Repeater': res.repeaterReason || 'Trong giới hạn an toàn',
    'Số Bộ Trộn Data Enabler Cần': res.specialInjectorsNeededCount,
    'Mã Bộ Trộn Nguồn/Data': res.injectorModelName,
    'Kết Nối BMS': res.item.bmsRequired,
    'Số BMS Gateway Cần': res.bmsGatewaysNeededCount,
    'Cảnh Báo Kỹ Thuật': res.warnings.join(' | ') || 'An Toàn'
  }));

  const ws3 = XLSX.utils.json_to_sheet(sheet3Data);
  ws3['!cols'] = [
    { wch: 5 },
    { wch: 35 },
    { wch: 20 },
    { wch: 20 },
    { wch: 12 },
    { wch: 10 },
    { wch: 12 },
    { wch: 12 },
    { wch: 20 },
    { wch: 20 },
    { wch: 12 },
    { wch: 12 },
    { wch: 24 },
    { wch: 24 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 40 },
    { wch: 15 },
    { wch: 28 },
    { wch: 12 },
    { wch: 12 },
    { wch: 50 }
  ];
  XLSX.utils.book_append_sheet(wb, ws3, 'Sheet 3 - System Design');

  // --- SHEET 4: BẢNG TỔNG HỢP KHỐI LƯỢNG (BOQ / BOM) ---
  const sheet4Data: Record<string, any>[] = boqItems.map((item, idx) => ({
    'STT': idx + 1,
    'Phân Loại': item.category,
    'Hãng Sản Xuất': item.brand,
    'Mã Thiết Bị (Model)': item.model,
    'Tên Chi Tiết Equipment': item.name,
    'Số Lượng': item.quantity,
    'Đơn Vị': item.unit,
    'Đơn Giá (VNĐ)': item.unitPriceVND,
    'Thành Tiền (VNĐ)': item.totalPriceVND,
    'Ghi Chú Kỹ Thuật': item.notes
  }));

  // Add Summary Rows
  sheet4Data.push({
    'STT': 0,
    'Phân Loại': 'TỔNG CỘNG HỆ THỐNG',
    'Hãng Sản Xuất': '',
    'Mã Thiết Bị (Model)': '',
    'Tên Chi Tiết Equipment': `TỔNG CÔNG SUẤT ĐÈN: ${totalPowerKW.toFixed(2)} kW`,
    'Số Lượng': 0,
    'Đơn Vị': '',
    'Đơn Giá (VNĐ)': 0,
    'Thành Tiền (VNĐ)': totalCostVND,
    'Ghi Chú Kỹ Thuật': `Ước tính ngân sách: ${formatVND(totalCostVND)}`
  });

  const ws4 = XLSX.utils.json_to_sheet(sheet4Data);
  ws4['!cols'] = [
    { wch: 5 },
    { wch: 20 },
    { wch: 22 },
    { wch: 22 },
    { wch: 40 },
    { wch: 10 },
    { wch: 8 },
    { wch: 18 },
    { wch: 20 },
    { wch: 45 }
  ];
  XLSX.utils.book_append_sheet(wb, ws4, 'Sheet 4 - Summary BOQ');

  // --- SHEET 5: KIỂM TRA CHÉO & THẨM TRA KỸ THUẬT (QA/QC AUDIT) ---
  const sheet5Data = lineResults.map((res, idx) => {
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

  const ws5 = XLSX.utils.json_to_sheet(sheet5Data);
  ws5['!cols'] = [
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
  XLSX.utils.book_append_sheet(wb, ws5, 'Sheet 5 - QA QC Cross-Check');

  // Trigger file download
  const dateStr = new Date().toISOString().slice(0, 10);
  const projPrefix = project?.code ? `${project.code}_` : '';
  const projNameSafe = project?.name ? project.name.replace(/[^a-zA-Z0-9_\u00C0-\u1EF9]/g, '_').slice(0, 30) : 'Lighting_Design';
  XLSX.writeFile(wb, `${projPrefix}${projNameSafe}_${dateStr}.xlsx`);
}
