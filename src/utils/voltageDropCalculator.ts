import { DesignLineItem, CalculatedLineResult, VoltageDropLineResult, VoltageDropProjectSummary, PhaseDistributionSummary, SupplyPhaseType } from '../types';

/**
 * TCVN & IEC Standard Cable Cross-Sections (mm²)
 * Standard sizes per IEC 60228 / TCVN 7447 / IEC 61439
 */
export const STANDARD_CABLE_SIZES_MM2 = [1.5, 2.5, 4.0, 6.0, 10.0, 16.0, 25.0, 35.0, 50.0, 70.0, 95.0, 120.0];

/**
 * Copper & Aluminum Resistivity (rho) in Ohm.mm²/m
 * At operating temperatures:
 * - Copper at 20°C: ~0.0175
 * - Copper at 70°C (PVC rated): ~0.0225
 * - Copper at 90°C (XLPE rated): ~0.0240
 * - Aluminum at 70°C: ~0.0360
 */
export const CONDUCTOR_RESISTIVITY = {
  Cu: {
    PVC: 0.0225,  // Ohm.mm²/m at 70°C
    XLPE: 0.0240  // Ohm.mm²/m at 90°C
  },
  Al: {
    PVC: 0.0360,
    XLPE: 0.0380
  }
};

/**
 * Base Current-Carrying Capacity Iz (Amperes) for Copper Conductors (in conduit or enclosed cable tray at 30°C ambient)
 * Reference: IEC 60364-5-52 / TCVN 7447-5-52 Table B.52.1
 */
export const COPPER_CURRENT_CAPACITY_IZ: Record<number, { PVC: number; XLPE: number }> = {
  1.5: { PVC: 18.5, XLPE: 24 },
  2.5: { PVC: 25.0, XLPE: 32 },
  4.0: { PVC: 34.0, XLPE: 42 },
  6.0: { PVC: 43.0, XLPE: 54 },
  10.0: { PVC: 60.0, XLPE: 75 },
  16.0: { PVC: 80.0, XLPE: 100 },
  25.0: { PVC: 105.0, XLPE: 130 },
  35.0: { PVC: 130.0, XLPE: 160 },
  50.0: { PVC: 160.0, XLPE: 200 },
  70.0: { PVC: 200.0, XLPE: 250 },
  95.0: { PVC: 245.0, XLPE: 305 },
  120.0: { PVC: 285.0, XLPE: 355 }
};

/**
 * Temperature correction factors (k_temp) relative to base 30°C
 * Reference: IEC 60364-5-52 Table B.52.14
 */
export function getAmbientTempFactor(ambientTempC: number, insulation: 'PVC' | 'XLPE'): number {
  if (insulation === 'PVC') {
    if (ambientTempC <= 25) return 1.06;
    if (ambientTempC <= 30) return 1.00;
    if (ambientTempC <= 35) return 0.94;
    if (ambientTempC <= 40) return 0.87;
    if (ambientTempC <= 45) return 0.79;
    if (ambientTempC <= 50) return 0.71;
    return 0.60;
  } else {
    // XLPE
    if (ambientTempC <= 25) return 1.04;
    if (ambientTempC <= 30) return 1.00;
    if (ambientTempC <= 35) return 0.96;
    if (ambientTempC <= 40) return 0.91;
    if (ambientTempC <= 45) return 0.87;
    if (ambientTempC <= 50) return 0.82;
    return 0.75;
  }
}

/**
 * Installation method correction factor (k_install)
 */
export function getInstallationMethodFactor(method: 'Conduit' | 'CableTray' | 'DirectBuried' | 'Air'): number {
  switch (method) {
    case 'Conduit': return 0.90;
    case 'CableTray': return 0.95;
    case 'DirectBuried': return 1.00;
    case 'Air': return 1.05;
    default: return 0.90;
  }
}

/**
 * Detect supply phase and nominal voltage from voltage string
 */
export function parsePhaseAndVoltage(voltageStr?: string): { phase: SupplyPhaseType; nominalVoltage: number } {
  if (!voltageStr) {
    return { phase: '1P_220V', nominalVoltage: 220 };
  }
  const v = voltageStr.toLowerCase();
  if (v.includes('380') || v.includes('400') || v.includes('3-phase') || v.includes('3p')) {
    return { phase: '3P_380V', nominalVoltage: 380 };
  }
  if (v.includes('24v') || v.includes('24 v') || v.includes('24vdc') || v.includes('24v dc')) {
    return { phase: 'DC_24V', nominalVoltage: 24 };
  }
  if (v.includes('48v') || v.includes('48 v') || v.includes('48vdc') || v.includes('48v dc')) {
    return { phase: 'DC_48V', nominalVoltage: 48 };
  }
  if (v.includes('12v') || v.includes('12 v') || v.includes('12vdc') || v.includes('12v dc')) {
    return { phase: 'DC_12V', nominalVoltage: 12 };
  }
  return { phase: '1P_220V', nominalVoltage: 220 };
}

/**
 * Calculate recommended MCB / Circuit Breaker rating
 */
export function getRecommendedMCB(loadCurrentA: number, phase: SupplyPhaseType): string {
  const standardMCBs = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125];
  // MCB rating should be >= loadCurrent * 1.25 for continuous lighting load
  const targetRating = loadCurrentA * 1.25;
  const selectedRating = standardMCBs.find(r => r >= targetRating) || standardMCBs[standardMCBs.length - 1];

  if (phase === '3P_380V') {
    return `MCB 3P ${selectedRating}A 6kA (Curve C)`;
  } else if (phase === '1P_220V') {
    return `MCB 1P+N ${selectedRating}A 6kA (Curve C)`;
  } else {
    return `Aptomat DC 2P ${selectedRating}A (Tải DC ${phase.replace('DC_', '')})`;
  }
}

/**
 * Build standard cable code description according to TCVN & IEC
 */
export function getCableDescriptionCode(
  sizeMm2: number,
  phase: SupplyPhaseType,
  insulation: 'PVC' | 'XLPE',
  conductor: 'Cu' | 'Al'
): string {
  const cond = conductor === 'Cu' ? 'Cu' : 'Al';
  const insul = insulation === 'XLPE' ? 'XLPE/PVC' : 'PVC/PVC';

  if (phase === '3P_380V') {
    // 3-phase 4-wire or 5-wire
    if (sizeMm2 >= 16) {
      const earthSize = Math.max(10, sizeMm2 / 2);
      return `${cond}/${insul} (3x${sizeMm2} + 1x${sizeMm2} + 1x${earthSize}mm²)`;
    }
    return `${cond}/${insul} 4x${sizeMm2}mm² + E${sizeMm2}mm²`;
  } else if (phase === '1P_220V') {
    return `${cond}/${insul} 2x${sizeMm2}mm² + E${sizeMm2}mm²`;
  } else {
    return `Cáp Động Lực DC ${cond}/${insulation} 2x${sizeMm2}mm² (Chịu Tải Cao)`;
  }
}

/**
 * Auto Phase Balancing algorithm for single-phase lines across 3-phase supply (L1, L2, L3).
 * Uses LPT (Largest-Processing-Time-first) greedy algorithm to distribute load evenly.
 */
export function autoBalancePhases(
  results: CalculatedLineResult[],
  customPhases?: Record<string, 'L1' | 'L2' | 'L3' | '3P' | 'DC'>
): Record<string, 'L1' | 'L2' | 'L3' | '3P' | 'DC'> {
  const assignments: Record<string, 'L1' | 'L2' | 'L3' | '3P' | 'DC'> = {};
  
  // Track current power sum for AC phases
  const phaseLoads = {
    L1: 0,
    L2: 0,
    L3: 0
  };

  // Separate non-1P lines (3P, DC) and 1P lines
  const singlePhaseLines: Array<{ id: string; wattage: number }> = [];

  results.forEach(res => {
    const v = (res.effectiveVoltage || res.fixture?.voltage || '').toLowerCase();
    const explicitPhase = customPhases?.[res.item.id] || res.item.assignedPhase;
    
    if (explicitPhase === '3P' || v.includes('380') || v.includes('400') || v.includes('3-phase') || v.includes('3p')) {
      assignments[res.item.id] = '3P';
      const perPhase = res.totalWattage / 3;
      phaseLoads.L1 += perPhase;
      phaseLoads.L2 += perPhase;
      phaseLoads.L3 += perPhase;
    } else if (explicitPhase === 'DC' || v.includes('24v') || v.includes('48v') || v.includes('12v')) {
      assignments[res.item.id] = 'DC';
    } else {
      singlePhaseLines.push({ id: res.item.id, wattage: res.totalWattage });
    }
  });

  // Sort descending by wattage (LPT heuristic)
  singlePhaseLines.sort((a, b) => b.wattage - a.wattage);

  // Assign each line to phase with lowest current load
  singlePhaseLines.forEach(line => {
    let minPhase: 'L1' | 'L2' | 'L3' = 'L1';
    let minLoad = phaseLoads.L1;

    if (phaseLoads.L2 < minLoad) {
      minPhase = 'L2';
      minLoad = phaseLoads.L2;
    }
    if (phaseLoads.L3 < minLoad) {
      minPhase = 'L3';
      minLoad = phaseLoads.L3;
    }

    assignments[line.id] = minPhase;
    phaseLoads[minPhase] += line.wattage;
  });

  return assignments;
}

/**
 * Calculate Voltage Drop and Automatically Select Standard Cable Size
 * for a Single Line Item based on TCVN 7114 / TCVN 7447 / IEC 60364 / IEC 61439
 */
export function calculateVoltageDropForLine(
  calcResult: CalculatedLineResult,
  options: {
    allowableDropPercent?: number; // default 3.0% (TCVN interior) or 5.0% (facade)
    powerFactorCosPhi?: number;   // default 0.92 for electronic LED drivers
    ambientTempC?: number;        // default 35°C in Vietnam
    insulationType?: 'PVC' | 'XLPE'; // default 'PVC'
    conductorMaterial?: 'Cu' | 'Al'; // default 'Cu'
    installationMethod?: 'Conduit' | 'CableTray' | 'DirectBuried' | 'Air'; // default 'Conduit'
    manualOverrideSizeMm2?: number; // User override
    assignedPhase?: 'L1' | 'L2' | 'L3' | '3P' | 'DC'; // Phase override
    supplyPhaseTypeOverride?: SupplyPhaseType; // Global or local supply phase type override
  } = {}
): VoltageDropLineResult {
  const { item, fixture } = calcResult;
  const allowableDropPercent = options.allowableDropPercent ?? 3.0;
  const powerFactorCosPhi = options.powerFactorCosPhi ?? 0.92;
  const ambientTempC = options.ambientTempC ?? 35;
  const insulationType = options.insulationType ?? 'PVC';
  const conductorMaterial = options.conductorMaterial ?? 'Cu';
  const installationMethod = options.installationMethod ?? 'Conduit';

  // 1. Resolve Active Power and Total Cable Length
  const totalWattageW = Math.max(1, calcResult.totalWattage || (item.fixtureQuantity * (fixture?.wattage || 10)));
  const cableLengthMeters = Math.max(1, item.totalCableLengthMeters || calcResult.item.totalCableLengthMeters || 15);
  
  // 2. Parse Phase and Voltage (honor overrides)
  const defaultParsed = parsePhaseAndVoltage(calcResult.effectiveVoltage || fixture?.voltage);
  let phase: SupplyPhaseType = defaultParsed.phase;
  let nominalVoltage = defaultParsed.nominalVoltage;
  let assignedPhase: 'L1' | 'L2' | 'L3' | '3P' | 'DC' = options.assignedPhase || item.assignedPhase || 'L1';

  if (options.supplyPhaseTypeOverride) {
    phase = options.supplyPhaseTypeOverride;
    if (phase === '3P_380V') {
      nominalVoltage = 380;
      assignedPhase = '3P';
    } else if (phase === '1P_220V') {
      nominalVoltage = 220;
      if (assignedPhase === '3P' || assignedPhase === 'DC') assignedPhase = 'L1';
    } else if (phase === 'DC_24V') {
      nominalVoltage = 24;
      assignedPhase = 'DC';
    } else if (phase === 'DC_48V') {
      nominalVoltage = 48;
      assignedPhase = 'DC';
    } else if (phase === 'DC_12V') {
      nominalVoltage = 12;
      assignedPhase = 'DC';
    }
  } else if (options.assignedPhase) {
    assignedPhase = options.assignedPhase;
    if (assignedPhase === '3P') {
      phase = '3P_380V';
      nominalVoltage = 380;
    } else if (assignedPhase === 'DC') {
      phase = defaultParsed.phase.startsWith('DC') ? defaultParsed.phase : 'DC_24V';
      nominalVoltage = defaultParsed.nominalVoltage <= 48 ? defaultParsed.nominalVoltage : 24;
    } else {
      phase = '1P_220V';
      nominalVoltage = 220;
    }
  } else if (phase === '3P_380V') {
    assignedPhase = '3P';
  } else if (phase.startsWith('DC')) {
    assignedPhase = 'DC';
  }

  // 3. Calculate Load Current (Ib in Amperes)
  let loadCurrentA = 0;
  if (phase === '3P_380V') {
    // Ib = P / (sqrt(3) * U * cos(phi))
    loadCurrentA = totalWattageW / (Math.sqrt(3) * nominalVoltage * powerFactorCosPhi);
  } else if (phase === '1P_220V') {
    // Ib = P / (U * cos(phi))
    loadCurrentA = totalWattageW / (nominalVoltage * powerFactorCosPhi);
  } else {
    // DC Supply: Ib = P / U
    loadCurrentA = totalWattageW / nominalVoltage;
  }

  // 4. Calculate Maximum Allowable Voltage Drop (delta U max in Volts)
  const maxAllowableDeltaUV = (allowableDropPercent / 100) * nominalVoltage;

  // 5. Conductor Resistivity (rho)
  const rho = CONDUCTOR_RESISTIVITY[conductorMaterial][insulationType];

  // 6. Calculate Theoretical Minimum Cross-Section S_min (mm²) based purely on allowable voltage drop
  let calculatedMinCrossSectionMm2 = 0;
  if (phase === '3P_380V') {
    // deltaU = sqrt(3) * L * Ib * rho / S  =>  S = sqrt(3) * L * Ib * rho / deltaU_max
    calculatedMinCrossSectionMm2 = (Math.sqrt(3) * cableLengthMeters * loadCurrentA * rho * powerFactorCosPhi) / maxAllowableDeltaUV;
  } else {
    // 1P or DC: deltaU = 2 * L * Ib * rho / S  =>  S = 2 * L * Ib * rho / deltaU_max
    calculatedMinCrossSectionMm2 = (2 * cableLengthMeters * loadCurrentA * rho) / maxAllowableDeltaUV;
  }

  // Minimum mechanical cross-section standard for lighting is 1.5mm² per IEC 60364
  calculatedMinCrossSectionMm2 = Math.max(1.5, calculatedMinCrossSectionMm2);

  // 7. Derating factors for current capacity Iz
  const kTemp = getAmbientTempFactor(ambientTempC, insulationType);
  const kInstall = getInstallationMethodFactor(installationMethod);
  const totalDeratingK = kTemp * kInstall;

  // 8. Select Standard Cable Size that satisfies BOTH Voltage Drop and Current Capacity
  let selectedStandardSizeMm2 = options.manualOverrideSizeMm2 || STANDARD_CABLE_SIZES_MM2[0];
  let actualIz = 0;

  if (options.manualOverrideSizeMm2) {
    selectedStandardSizeMm2 = options.manualOverrideSizeMm2;
    const baseIz = COPPER_CURRENT_CAPACITY_IZ[selectedStandardSizeMm2]?.[insulationType] || 20;
    actualIz = baseIz * totalDeratingK;
  } else {
    // Auto-select the smallest standard wire size that meets all criteria
    for (const size of STANDARD_CABLE_SIZES_MM2) {
      const baseIz = COPPER_CURRENT_CAPACITY_IZ[size]?.[insulationType] || (size * 6);
      const effectiveIz = baseIz * totalDeratingK;

      // Calculate actual delta U with this size
      let testDeltaUV = 0;
      if (phase === '3P_380V') {
        testDeltaUV = (Math.sqrt(3) * cableLengthMeters * loadCurrentA * rho * powerFactorCosPhi) / size;
      } else {
        testDeltaUV = (2 * cableLengthMeters * loadCurrentA * rho) / size;
      }
      const testDeltaUPercent = (testDeltaUV / nominalVoltage) * 100;

      // Check both criteria: Delta U <= Allowable AND Load Current <= Effective Iz
      if (testDeltaUPercent <= allowableDropPercent && loadCurrentA <= effectiveIz) {
        selectedStandardSizeMm2 = size;
        actualIz = effectiveIz;
        break;
      }
      // If we are on the largest size, keep it
      if (size === STANDARD_CABLE_SIZES_MM2[STANDARD_CABLE_SIZES_MM2.length - 1]) {
        selectedStandardSizeMm2 = size;
        actualIz = effectiveIz;
      }
    }
  }

  // 9. Calculate Final Actual Voltage Drop with Selected Size
  let actualVoltageDropV = 0;
  if (phase === '3P_380V') {
    actualVoltageDropV = (Math.sqrt(3) * cableLengthMeters * loadCurrentA * rho * powerFactorCosPhi) / selectedStandardSizeMm2;
  } else {
    actualVoltageDropV = (2 * cableLengthMeters * loadCurrentA * rho) / selectedStandardSizeMm2;
  }
  const actualVoltageDropPercent = (actualVoltageDropV / nominalVoltage) * 100;

  // 10. Compliance Checks
  const isDropCompliant = actualVoltageDropPercent <= allowableDropPercent;
  const isCurrentCompliant = loadCurrentA <= actualIz;
  const isOverallCompliant = isDropCompliant && isCurrentCompliant;

  // 11. Safety Margin and Recommendations
  const safetyMarginPercent = actualIz > 0 ? Math.round(((actualIz - loadCurrentA) / actualIz) * 100) : 0;
  const selectedCableCode = getCableDescriptionCode(selectedStandardSizeMm2, phase, insulationType, conductorMaterial);
  const recommendedMCB = getRecommendedMCB(loadCurrentA, phase);

  return {
    lineId: item.id,
    zoneName: item.zoneName,
    luminaireModel: fixture?.model || 'Đèn chiếu sáng',
    fixtureQuantity: item.fixtureQuantity,
    unitWattage: calcResult.effectiveWattage || fixture?.wattage || 10,
    totalWattageW,
    voltageSupply: nominalVoltage,
    phaseType: phase,
    assignedPhase,
    powerFactorCosPhi,
    loadCurrentA: parseFloat(loadCurrentA.toFixed(2)),
    cableLengthMeters,
    conductorMaterial,
    insulationType,
    installationMethod,
    ambientTempC,
    allowableDropPercent,
    calculatedMinCrossSectionMm2: parseFloat(calculatedMinCrossSectionMm2.toFixed(2)),
    selectedStandardSizeMm2,
    selectedCableCode,
    actualVoltageDropV: parseFloat(actualVoltageDropV.toFixed(2)),
    actualVoltageDropPercent: parseFloat(actualVoltageDropPercent.toFixed(2)),
    currentCarryingCapacityIz: parseFloat(actualIz.toFixed(1)),
    isDropCompliant,
    isCurrentCompliant,
    isOverallCompliant,
    recommendedMCB,
    safetyMarginPercent,
    standardReference: 'TCVN 7114 / TCVN 7447 / IEC 60364 / IEC 61439'
  };
}

/**
 * Calculate Project Aggregate Summary for Voltage Drop & Cable Sizing with Phase Balancing
 */
export function calculateVoltageDropProjectSummary(results: VoltageDropLineResult[]): VoltageDropProjectSummary {
  const totalLinesCount = results.length;
  const compliantLinesCount = results.filter(r => r.isOverallCompliant).length;
  const nonCompliantLinesCount = totalLinesCount - compliantLinesCount;
  const totalLoadKW = parseFloat((results.reduce((sum, r) => sum + r.totalWattageW, 0) / 1000).toFixed(2));
  const totalCurrentA = parseFloat(results.reduce((sum, r) => sum + r.loadCurrentA, 0).toFixed(1));
  const totalCableLengthM = results.reduce((sum, r) => sum + r.cableLengthMeters, 0);

  const drops = results.map(r => r.actualVoltageDropPercent);
  const maxVoltageDropPercent = drops.length > 0 ? Math.max(...drops) : 0;
  const avgVoltageDropPercent = drops.length > 0 ? parseFloat((drops.reduce((a, b) => a + b, 0) / drops.length).toFixed(2)) : 0;

  // Phase Distribution Calculations
  let pL1Watts = 0;
  let pL2Watts = 0;
  let pL3Watts = 0;
  let pDCWatts = 0;

  let currentL1A = 0;
  let currentL2A = 0;
  let currentL3A = 0;

  const linesPerPhase = {
    L1: 0,
    L2: 0,
    L3: 0,
    '3P': 0,
    DC: 0
  };

  results.forEach(r => {
    if (r.assignedPhase === '3P' || r.phaseType === '3P_380V') {
      const splitPower = r.totalWattageW / 3;
      pL1Watts += splitPower;
      pL2Watts += splitPower;
      pL3Watts += splitPower;
      currentL1A += r.loadCurrentA;
      currentL2A += r.loadCurrentA;
      currentL3A += r.loadCurrentA;
      linesPerPhase['3P'] += 1;
    } else if (r.assignedPhase === 'L2') {
      pL2Watts += r.totalWattageW;
      currentL2A += r.loadCurrentA;
      linesPerPhase.L2 += 1;
    } else if (r.assignedPhase === 'L3') {
      pL3Watts += r.totalWattageW;
      currentL3A += r.loadCurrentA;
      linesPerPhase.L3 += 1;
    } else if (r.assignedPhase === 'DC' || r.phaseType.startsWith('DC')) {
      pDCWatts += r.totalWattageW;
      linesPerPhase.DC += 1;
    } else {
      // Default to L1
      pL1Watts += r.totalWattageW;
      currentL1A += r.loadCurrentA;
      linesPerPhase.L1 += 1;
    }
  });

  const avgACWatts = (pL1Watts + pL2Watts + pL3Watts) / 3;
  let unbalancePercent = 0;
  if (avgACWatts > 0) {
    const maxDev = Math.max(
      Math.abs(pL1Watts - avgACWatts),
      Math.abs(pL2Watts - avgACWatts),
      Math.abs(pL3Watts - avgACWatts)
    );
    unbalancePercent = parseFloat(((maxDev / avgACWatts) * 100).toFixed(1));
  }

  const phaseDistribution: PhaseDistributionSummary = {
    pL1Watts: Math.round(pL1Watts),
    pL2Watts: Math.round(pL2Watts),
    pL3Watts: Math.round(pL3Watts),
    pDCWatts: Math.round(pDCWatts),
    currentL1A: parseFloat(currentL1A.toFixed(1)),
    currentL2A: parseFloat(currentL2A.toFixed(1)),
    currentL3A: parseFloat(currentL3A.toFixed(1)),
    unbalancePercent,
    isUnbalanceAcceptable: unbalancePercent <= 15.0,
    linesPerPhase
  };

  // Breakdown by Cable Size
  const sizeMap = new Map<number, { totalLength: number; count: number; code: string }>();
  results.forEach(r => {
    const existing = sizeMap.get(r.selectedStandardSizeMm2) || { totalLength: 0, count: 0, code: r.selectedCableCode };
    existing.totalLength += r.cableLengthMeters;
    existing.count += 1;
    sizeMap.set(r.selectedStandardSizeMm2, existing);
  });

  const cableSizeBreakdown = Array.from(sizeMap.entries())
    .map(([sizeMm2, data]) => ({
      sizeMm2,
      cableType: data.code,
      totalLengthMeters: data.totalLength,
      linesCount: data.count,
      percentage: totalCableLengthM > 0 ? Math.round((data.totalLength / totalCableLengthM) * 100) : 0
    }))
    .sort((a, b) => a.sizeMm2 - b.sizeMm2);

  return {
    totalLinesCount,
    compliantLinesCount,
    nonCompliantLinesCount,
    totalLoadKW,
    totalCurrentA,
    totalCableLengthM,
    maxVoltageDropPercent,
    avgVoltageDropPercent,
    phaseDistribution,
    cableSizeBreakdown
  };
}
