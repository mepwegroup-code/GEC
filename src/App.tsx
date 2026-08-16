import React, { useState, useMemo, useEffect } from 'react';
import { 
  ControllerDevice, 
  SubControllerDevice, 
  LuminaireFixture, 
  DesignLineItem, 
  ProjectPreset, 
  LightingProject 
} from './types';
import { INITIAL_CONTROLLERS } from './data/controllersData';
import { INITIAL_SUB_CONTROLLERS } from './data/subControllersData';
import { INITIAL_LUMINAIRES } from './data/luminairesData';
import { calculateLineResult, generateBOQ } from './utils/calculator';
import { exportFullLightingSpreadsheetToExcel } from './utils/excelExporter';
import { 
  loadProjectsFromStorage, 
  saveProjectsToStorage, 
  getActiveProjectId, 
  setActiveProjectId 
} from './utils/projectStorage';

import { Navbar } from './components/Navbar';
import { SheetTabs } from './components/SheetTabs';
import { SheetControllers } from './components/SheetControllers';
import { SheetLuminaires } from './components/SheetLuminaires';
import { SheetDesignCalculator } from './components/SheetDesignCalculator';
import { SheetSchematicBOQ } from './components/SheetSchematicBOQ';
import { SheetQACrossCheckAI } from './components/SheetQACrossCheckAI';
import { AddDeviceModal } from './components/AddDeviceModal';
import { AddLuminaireModal } from './components/AddLuminaireModal';
import { ProjectManagerModal } from './components/ProjectManagerModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<number>(3); // Default to Sheet 3 (System Configurator)
  const [controllers, setControllers] = useState<ControllerDevice[]>(INITIAL_CONTROLLERS);
  const [subControllers, setSubControllers] = useState<SubControllerDevice[]>(INITIAL_SUB_CONTROLLERS);
  const [luminaires, setLuminaires] = useState<LuminaireFixture[]>(INITIAL_LUMINAIRES);

  // Multi-Project State Engine
  const [projects, setProjects] = useState<LightingProject[]>(() => loadProjectsFromStorage());
  const [activeProjectId, setActiveProjectIdState] = useState<string>(() => {
    const loaded = loadProjectsFromStorage();
    return getActiveProjectId(loaded);
  });

  // Modals state
  const [isAddControllerOpen, setIsAddControllerOpen] = useState(false);
  const [isAddLuminaireOpen, setIsAddLuminaireOpen] = useState(false);
  const [isProjectManagerOpen, setIsProjectManagerOpen] = useState(false);

  // Derive current active project
  const activeProject = useMemo(() => {
    return projects.find(p => p.id === activeProjectId) || projects[0];
  }, [projects, activeProjectId]);

  // Derived Unique Brands for Add Modals
  const existingLuminaireBrands = useMemo(() => {
    return Array.from(new Set(luminaires.map(l => l.brand))).filter(Boolean);
  }, [luminaires]);

  const existingControllerBrands = useMemo(() => {
    return Array.from(new Set([...controllers.map(c => c.brand), ...subControllers.map(s => s.brand)])).filter(Boolean);
  }, [controllers, subControllers]);

  // Current project's line items
  const lineItems = useMemo(() => {
    return activeProject?.lineItems || [];
  }, [activeProject]);

  // Persist projects to LocalStorage whenever projects list changes
  useEffect(() => {
    if (projects.length > 0) {
      saveProjectsToStorage(projects);
    }
  }, [projects]);

  // Update active project ID and persist
  const handleSelectProject = (projectId: string) => {
    setActiveProjectIdState(projectId);
    setActiveProjectId(projectId);
  };

  // Create new project
  const handleCreateProject = (newProject: LightingProject) => {
    setProjects(prev => [newProject, ...prev]);
    setActiveProjectIdState(newProject.id);
    setActiveProjectId(newProject.id);
    setActiveTab(3);
  };

  // Update project metadata
  const handleUpdateProject = (updatedProject: LightingProject) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  // Delete project
  const handleDeleteProject = (projectId: string) => {
    if (projects.length <= 1) return;
    const remaining = projects.filter(p => p.id !== projectId);
    setProjects(remaining);
    if (activeProjectId === projectId) {
      const nextActiveId = remaining[0]?.id || '';
      setActiveProjectIdState(nextActiveId);
      setActiveProjectId(nextActiveId);
    }
  };

  // Duplicate project
  const handleDuplicateProject = (projectId: string) => {
    const target = projects.find(p => p.id === projectId);
    if (!target) return;

    const now = new Date().toISOString();
    const d = new Date();
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const rand = Math.floor(100 + Math.random() * 900);

    const duplicated: LightingProject = {
      ...target,
      id: `proj-${Date.now()}`,
      name: `${target.name} (Bản Sao)`,
      code: `PRJ-${yy}${mm}-${rand}`,
      createdAt: now,
      updatedAt: now,
      lineItems: target.lineItems.map((item, idx) => ({
        ...item,
        id: `line-${Date.now()}-${idx}`
      }))
    };

    setProjects(prev => [duplicated, ...prev]);
    setActiveProjectIdState(duplicated.id);
    setActiveProjectId(duplicated.id);
  };

  // Live calculation results for all lines in Sheet 3
  const lineResults = useMemo(() => {
    return lineItems.map(item => calculateLineResult(item, controllers, luminaires, subControllers));
  }, [lineItems, controllers, luminaires, subControllers]);

  // Aggregate BOQ calculation
  const { boqItems, totalCostVND, totalPowerKW } = useMemo(() => {
    return generateBOQ(lineResults);
  }, [lineResults]);

  // Handle Preset Load (applies to active project)
  const handleSelectPreset = (preset: ProjectPreset) => {
    if (!activeProject) return;
    const updatedLineItems = preset.items.map((item, idx) => ({
      ...item,
      id: `line-${Date.now()}-${idx}`
    }));
    
    setProjects(prev => prev.map(p => {
      if (p.id === activeProjectId) {
        return {
          ...p,
          updatedAt: new Date().toISOString(),
          lineItems: updatedLineItems
        };
      }
      return p;
    }));

    setActiveTab(3); // Jump to Sheet 3 to view calculation
  };

  // Add Custom Controller to Sheet 1
  const handleAddController = (newCtrl: ControllerDevice) => {
    setControllers(prev => [newCtrl, ...prev]);
  };

  // Add Custom Luminaire to Sheet 2
  const handleAddLuminaire = (newLum: LuminaireFixture) => {
    setLuminaires(prev => [newLum, ...prev]);
  };

  // Line Item Handlers for Sheet 3 (Updates Active Project)
  const handleUpdateLineItem = (updated: DesignLineItem) => {
    setProjects(prev => prev.map(p => {
      if (p.id === activeProjectId) {
        const exists = p.lineItems.some(i => i.id === updated.id);
        const newLineItems = exists
          ? p.lineItems.map(item => item.id === updated.id ? updated : item)
          : [...p.lineItems, updated];
        return {
          ...p,
          updatedAt: new Date().toISOString(),
          lineItems: newLineItems
        };
      }
      return p;
    }));
  };

  const handleAddLineItem = () => {
    const defaultLum = luminaires[0];
    const defaultCtrl = controllers[0];

    const newLine: DesignLineItem = {
      id: `line-${Date.now()}`,
      zoneName: `Khu Vực Mới - Tuyến Đèn #${lineItems.length + 1}`,
      luminaireBrand: defaultLum ? defaultLum.brand : 'Griven',
      luminaireId: defaultLum ? defaultLum.id : 'lum-griven-capital600',
      fixtureQuantity: 24,
      controllerBrand: defaultCtrl ? defaultCtrl.brand : 'Pharos Controls',
      controllerId: defaultCtrl ? defaultCtrl.id : 'ctrl-pharos-lpc2',
      bmsRequired: 'BACnet IP',
      controllerToFirstFixtureDistance: 50,
      interFixtureDistance: 2.0,
      totalCableLengthMeters: 96
    };

    handleUpdateLineItem(newLine);
  };

  const handleDuplicateLineItem = (id: string) => {
    const target = lineItems.find(i => i.id === id);
    if (!target) return;

    const dupLine: DesignLineItem = {
      ...target,
      id: `line-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      zoneName: `${target.zoneName} (Bản Sao)`
    };

    handleUpdateLineItem(dupLine);
  };

  const handleDeleteLineItem = (id: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === activeProjectId) {
        return {
          ...p,
          updatedAt: new Date().toISOString(),
          lineItems: p.lineItems.filter(i => i.id !== id)
        };
      }
      return p;
    }));
  };

  // Trigger Full Multi-Sheet Excel Export
  const handleExportExcel = () => {
    exportFullLightingSpreadsheetToExcel(
      controllers,
      luminaires,
      lineResults,
      boqItems,
      totalCostVND,
      totalPowerKW,
      activeProject
    );
  };

  return (
    <div className="min-h-screen bg-[#070707] text-[#E0E0E0] flex flex-col font-sans selection:bg-[#00A3FF] selection:text-black">
      {/* Navigation Header Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectPreset={handleSelectPreset}
        onExportExcel={handleExportExcel}
        onOpenAddControllerModal={() => setIsAddControllerOpen(true)}
        onOpenAddLuminaireModal={() => setIsAddLuminaireOpen(true)}
        onOpenProjectManagerModal={() => setIsProjectManagerOpen(true)}
        onOpenCreateProjectModal={() => setIsProjectManagerOpen(true)}
        activeProject={activeProject}
        totalProjectsCount={projects.length}
        totalControllersCount={controllers.length}
        totalLuminairesCount={luminaires.length}
        totalDesignLinesCount={lineItems.length}
        totalPowerKW={totalPowerKW}
        totalCostVND={totalCostVND}
      />

      {/* Spreadsheet Tabs */}
      <SheetTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        designLinesCount={lineItems.length}
      />

      {/* Main Content Area per Active Sheet Tab */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {activeTab === 1 && (
          <SheetControllers
            controllers={controllers}
            subControllers={subControllers}
            onOpenAddModal={() => setIsAddControllerOpen(true)}
          />
        )}

        {activeTab === 2 && (
          <SheetLuminaires
            luminaires={luminaires}
            onOpenAddModal={() => setIsAddLuminaireOpen(true)}
          />
        )}

        {activeTab === 3 && (
          <SheetDesignCalculator
            lineItems={lineItems}
            luminaires={luminaires}
            controllers={controllers}
            subControllers={subControllers}
            onUpdateLineItem={handleUpdateLineItem}
            onAddLineItem={handleAddLineItem}
            onDuplicateLineItem={handleDuplicateLineItem}
            onDeleteLineItem={handleDeleteLineItem}
          />
        )}

        {activeTab === 4 && (
          <SheetSchematicBOQ
            lineResults={lineResults}
            boqItems={boqItems}
            totalCostVND={totalCostVND}
            totalPowerKW={totalPowerKW}
            onExportExcel={handleExportExcel}
          />
        )}

        {activeTab === 5 && (
          <SheetQACrossCheckAI
            project={activeProject}
            lineResults={lineResults}
            boqItems={boqItems}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#0D0D0D] border-t border-[#222222] py-4 text-center text-xs text-[#777777] font-mono">
        <p>Hệ Thống Thiết Kế Bảng Tính Điều Khiển Chiếu Sáng DALI-2, DMX512/RDM, ColorKinetics, Dynalite, Signify ZXP399, Pharos, Helvar, LTECH & BMS Gateway</p>
      </footer>

      {/* Custom Device / Fixture Modals */}
      <AddDeviceModal
        isOpen={isAddControllerOpen}
        onClose={() => setIsAddControllerOpen(false)}
        onAdd={handleAddController}
        existingBrands={existingControllerBrands}
      />

      <AddLuminaireModal
        isOpen={isAddLuminaireOpen}
        onClose={() => setIsAddLuminaireOpen(false)}
        onAdd={handleAddLuminaire}
        existingBrands={existingLuminaireBrands}
      />

      {/* Project Management Modal */}
      <ProjectManagerModal
        isOpen={isProjectManagerOpen}
        onClose={() => setIsProjectManagerOpen(false)}
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={handleSelectProject}
        onCreateProject={handleCreateProject}
        onUpdateProject={handleUpdateProject}
        onDeleteProject={handleDeleteProject}
        onDuplicateProject={handleDuplicateProject}
        controllers={controllers}
        luminaires={luminaires}
        subControllers={subControllers}
      />
    </div>
  );
}
