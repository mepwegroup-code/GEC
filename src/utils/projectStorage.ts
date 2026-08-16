import { LightingProject, DesignLineItem } from '../types';
import { PROJECT_PRESETS, SAMPLE_LINE_ITEMS } from '../data/samplePresets';

const STORAGE_PROJECTS_KEY = 'lighting_cal_projects_v2';
const STORAGE_ACTIVE_PROJECT_KEY = 'lighting_cal_active_project_id_v2';

// Create initial sample projects from presets
export const createInitialProjects = (): LightingProject[] => {
  const now = new Date().toISOString();
  return [
    {
      id: 'proj-facade-multibrand',
      name: 'Tòa Nhà Cao Ốc Landmark Tower - Hệ Thống Facade Đa Hãng',
      code: 'PRJ-2026-001',
      clientName: 'Tập Đoàn Bất Động Sản Long Khang & General E&C',
      location: 'Quận 1, TP. Hồ Chí Minh',
      description: 'Thiết kế hệ thống chiếu sáng kiến trúc mặt đứng kết hợp nhiều thương hiệu đèn cao cấp (Griven, ColorKinetics, iGuzzini, L&L Luce&Light) điều khiển bởi Pharos & Dynalite kết nối BMS BACnet IP.',
      createdAt: now,
      updatedAt: now,
      lineItems: SAMPLE_LINE_ITEMS
    },
    {
      id: 'proj-hotel-dali',
      name: 'Khách Sạn 5* Marina Bay - Hệ Thống DALI-2 Sảnh & Hội Nghị',
      code: 'PRJ-2026-002',
      clientName: 'Marina Bay Hospitality Group',
      location: 'Bãi Cháy, TP. Hạ Long, Quảng Ninh',
      description: 'Hệ thống DALI-2 DT8 Tunable White điều khiển sảnh tiệc, nhà hàng, kết nối Router Helvar 910 và BMS Modbus TCP.',
      createdAt: now,
      updatedAt: now,
      lineItems: PROJECT_PRESETS[2].items
    },
    {
      id: 'proj-smart-signify',
      name: 'Khu Phức Hợp Thông Minh Smart Complex - Philips / Signify & LTECH',
      code: 'PRJ-2026-003',
      clientName: 'Công Ty CP Phát Triển Đô Thị Sáng Tạo',
      location: 'Khu Đô Thị Mới Thủ Thiêm, TP. Thủ Đức',
      description: 'Hệ thống điều khiển Facade trung tâm Philips / Signify ZXP399 Main Controller (6000 Univ) kết hợp các bộ điều khiển LTECH ArtNet và BMS Gateway.',
      createdAt: now,
      updatedAt: now,
      lineItems: PROJECT_PRESETS[3].items
    }
  ];
};

// Load all projects from LocalStorage
export const loadProjectsFromStorage = (): LightingProject[] => {
  try {
    const raw = localStorage.getItem(STORAGE_PROJECTS_KEY);
    if (!raw) {
      const initial = createInitialProjects();
      saveProjectsToStorage(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    const initial = createInitialProjects();
    saveProjectsToStorage(initial);
    return initial;
  } catch (err) {
    console.error('Failed to load projects from storage:', err);
    return createInitialProjects();
  }
};

// Save all projects to LocalStorage
export const saveProjectsToStorage = (projects: LightingProject[]): void => {
  try {
    localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to save projects to storage:', err);
  }
};

// Get active project ID
export const getActiveProjectId = (projects: LightingProject[]): string => {
  try {
    const activeId = localStorage.getItem(STORAGE_ACTIVE_PROJECT_KEY);
    if (activeId && projects.some(p => p.id === activeId)) {
      return activeId;
    }
  } catch (err) {
    console.error('Failed to get active project ID:', err);
  }
  return projects[0]?.id || '';
};

// Set active project ID
export const setActiveProjectId = (id: string): void => {
  try {
    localStorage.setItem(STORAGE_ACTIVE_PROJECT_KEY, id);
  } catch (err) {
    console.error('Failed to set active project ID:', err);
  }
};
