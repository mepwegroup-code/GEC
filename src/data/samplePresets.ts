import { DesignLineItem, ProjectPreset } from '../types';

export const SAMPLE_LINE_ITEMS: DesignLineItem[] = [
  {
    id: 'line-1',
    zoneName: 'Facade Khối Tháp Tower - Tuyến 1: Đèn Pha Đỉnh Tháp',
    luminaireBrand: 'Griven',
    luminaireId: 'lum-griven-capital600',
    fixtureQuantity: 8,
    controllerBrand: 'Pharos Controls',
    controllerId: 'ctrl-pharos-lpc2',
    bmsRequired: 'BACnet IP',
    controllerToFirstFixtureDistance: 150,
    interFixtureDistance: 10.0,
    totalCableLengthMeters: 220
  },
  {
    id: 'line-2',
    zoneName: 'Facade Khối Tháp Tower - Tuyến 2: Thanh Hắt Tường Graze',
    luminaireBrand: 'ColorKinetics (Signify)',
    luminaireId: 'lum-ck-colorgraze-mx',
    fixtureQuantity: 48,
    controllerBrand: 'Pharos Controls',
    controllerId: 'ctrl-pharos-lpc2',
    bmsRequired: 'BACnet IP',
    controllerToFirstFixtureDistance: 120,
    interFixtureDistance: 1.2,
    totalCableLengthMeters: 176.4
  },
  {
    id: 'line-3',
    zoneName: 'Facade Khối Tháp Tower - Tuyến 3: Vệt Sáng Cửa Kính',
    luminaireBrand: 'iGuzzini',
    luminaireId: 'lum-iguzzini-trick-dmx',
    fixtureQuantity: 32,
    controllerBrand: 'Pharos Controls',
    controllerId: 'ctrl-pharos-tpc',
    bmsRequired: 'BACnet IP',
    controllerToFirstFixtureDistance: 80,
    interFixtureDistance: 3.0,
    totalCableLengthMeters: 173
  },
  {
    id: 'line-4',
    zoneName: 'Khối Đế Facade & Sảnh - Tuyến 1: Đèn Hắt Cột Cổng Vòm',
    luminaireBrand: 'L&L Luce&Light',
    luminaireId: 'lum-ll-neva-dmx',
    fixtureQuantity: 24,
    controllerBrand: 'Signify Dynalite',
    controllerId: 'ctrl-dynalite-lnk-dmx',
    bmsRequired: 'BACnet IP',
    controllerToFirstFixtureDistance: 45,
    interFixtureDistance: 2.5,
    totalCableLengthMeters: 102.5
  },
  {
    id: 'line-5',
    zoneName: 'Khối Đế Facade & Sảnh - Tuyến 2: Downlight Âm Trần Sảnh',
    luminaireBrand: 'NEKO Lighting',
    luminaireId: 'lum-neko-fusion-dali',
    fixtureQuantity: 60,
    controllerBrand: 'Helvar',
    controllerId: 'ctrl-helvar-910',
    bmsRequired: 'Modbus TCP',
    controllerToFirstFixtureDistance: 30,
    interFixtureDistance: 2.0,
    totalCableLengthMeters: 148
  }
];

export const PROJECT_PRESETS: ProjectPreset[] = [
  {
    id: 'preset-facade-multibrand',
    name: 'Mặt Đứng Facade Tòa Nhà Multi-Brand (Pharos + Griven + Signify + iGuzzini + L&L)',
    description: 'Thiết kế hệ thống chiếu sáng Facade phức hợp cho tòa nhà cao tầng gồm nhiều loại đèn (Pha công suất lớn, Thanh hắt vách, Trick 360 cửa kính) từ các hãng nổi tiếng do Long Khang & General E&C phân phối.',
    items: SAMPLE_LINE_ITEMS
  },
  {
    id: 'preset-facade-ck',
    name: 'Dự Án Chiếu Sáng Mặt Tiền Facade ColorKinetics & Dynalite',
    description: 'Hệ thống DMX512/RDM điều khiển đèn hắt mặt tiền ColorKinetics, tích hợp bộ trộn nguồn Data Enabler Pro, DMX Isolator & BMS BACnet IP.',
    items: [
      {
        id: 'line-ck-1',
        zoneName: 'Facade Khối Đế Tầng 1-5',
        luminaireBrand: 'ColorKinetics (Signify)',
        luminaireId: 'lum-ck-colorgraze-mx',
        fixtureQuantity: 64,
        controllerBrand: 'Signify Dynalite',
        controllerId: 'ctrl-dynalite-lnk-dmx',
        bmsRequired: 'BACnet IP',
        controllerToFirstFixtureDistance: 110,
        interFixtureDistance: 1.2,
        totalCableLengthMeters: 186.8
      },
      {
        id: 'line-ck-2',
        zoneName: 'Cột Cờ & Đỉnh Mái Tòa Nhà (ReachElite)',
        luminaireBrand: 'ColorKinetics (Signify)',
        luminaireId: 'lum-ck-reachelite100',
        fixtureQuantity: 12,
        controllerBrand: 'Pharos Controls',
        controllerId: 'ctrl-pharos-lpc2',
        bmsRequired: 'BACnet IP',
        controllerToFirstFixtureDistance: 210,
        interFixtureDistance: 8.0,
        totalCableLengthMeters: 306
      }
    ]
  },
  {
    id: 'preset-hotel-dali',
    name: 'Khách Sạn 5* - Đại Sảnh & Sảnh Tiệc (Helvar DALI-2 + ERCO + NEKO + ELR)',
    description: 'Hệ thống DALI-2 DT8 Tunable White điều khiển sảnh tiệc, nhà hàng, kết nối Router Helvar 910 và BMS.',
    items: [
      {
        id: 'line-ht-1',
        zoneName: 'Đại Sảnh Reception Downlight NEKO & ELR',
        luminaireBrand: 'NEKO Lighting',
        luminaireId: 'lum-neko-fusion-dali',
        fixtureQuantity: 80,
        controllerBrand: 'Helvar',
        controllerId: 'ctrl-helvar-910',
        bmsRequired: 'BACnet IP',
        controllerToFirstFixtureDistance: 60,
        interFixtureDistance: 2.0,
        totalCableLengthMeters: 220
      },
      {
        id: 'line-ht-2',
        zoneName: 'Nhà Hàng Buffet - Tracklight DALI DT8 ERCO',
        luminaireBrand: 'ERCO',
        luminaireId: 'lum-erco-parscan-dali',
        fixtureQuantity: 50,
        controllerBrand: 'Helvar',
        controllerId: 'ctrl-helvar-910',
        bmsRequired: 'BACnet IP',
        controllerToFirstFixtureDistance: 40,
        interFixtureDistance: 3.0,
        totalCableLengthMeters: 190
      }
    ]
  },
  {
    id: 'preset-signify-ltech-bms',
    name: 'Giải Pháp Tòa Nhà Thông Minh Philips / Signify ZXP399 + LTECH + Schneider / Tridium BMS',
    description: 'Hệ thống điều khiển Facade trung tâm Philips / Signify ZXP399 Main Controller (6000 Univ) kết hợp các bộ điều khiển LTECH ArtNet/Bluetooth Mesh và Tridium Niagara / Schneider BMS Gateway.',
    items: [
      {
        id: 'line-sig-1',
        zoneName: 'Mặt Đứng Facade Chính - Trục Đèn Hắt Tường Signify ColorGraze',
        luminaireBrand: 'ColorKinetics (Signify)',
        luminaireId: 'lum-ck-colorgraze-mx',
        fixtureQuantity: 64,
        controllerBrand: 'Philips / Signify',
        controllerId: 'ctrl-philips-zxp399-main-dmx',
        bmsRequired: 'BACnet IP',
        controllerToFirstFixtureDistance: 95,
        interFixtureDistance: 1.2,
        totalCableLengthMeters: 171.6
      },
      {
        id: 'line-sig-2',
        zoneName: 'Tháp Mái Đỉnh Tòa Nhà - Đèn Pha Siêu Cường ReachElite 300W',
        luminaireBrand: 'ColorKinetics (Signify)',
        luminaireId: 'lum-ck-reachelite300',
        fixtureQuantity: 6,
        controllerBrand: 'Philips / Signify',
        controllerId: 'ctrl-philips-zxp399-main-dmx',
        bmsRequired: 'BACnet IP',
        controllerToFirstFixtureDistance: 140,
        interFixtureDistance: 12.0,
        totalCableLengthMeters: 200
      },
      {
        id: 'line-sig-3',
        zoneName: 'Tuyến Sảnh Ngoại Thất & Cảnh Quan - LTECH Wireless DMX + L&L Neva',
        luminaireBrand: 'L&L Luce&Light',
        luminaireId: 'lum-ll-neva-dmx',
        fixtureQuantity: 32,
        controllerBrand: 'LTECH',
        controllerId: 'ctrl-ltech-artnet-8',
        bmsRequired: 'Modbus TCP',
        controllerToFirstFixtureDistance: 70,
        interFixtureDistance: 2.5,
        totalCableLengthMeters: 147.5
      },
      {
        id: 'line-sig-4',
        zoneName: 'Chiếu Sáng Nội Thất & Hành Lang - DALI-2 LTECH Router + NEKO Downlight',
        luminaireBrand: 'NEKO Lighting',
        luminaireId: 'lum-neko-fusion-dali',
        fixtureQuantity: 96,
        controllerBrand: 'LTECH',
        controllerId: 'ctrl-ltech-lt424',
        bmsRequired: 'BACnet IP',
        controllerToFirstFixtureDistance: 50,
        interFixtureDistance: 1.8,
        totalCableLengthMeters: 221
      }
    ]
  }
];
