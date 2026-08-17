import React, { useRef } from 'react';
import { 
  FolderKanban, 
  Plus, 
  Download, 
  Upload,
  PlusCircle, 
  Lightbulb, 
  Cpu, 
  FileSpreadsheet, 
  Building2,
  CheckCircle,
  SlidersHorizontal,
  ChevronDown,
  FileJson
} from 'lucide-react';
import { LightingProject, ProjectPreset } from '../types';
import { PROJECT_PRESETS } from '../data/samplePresets';
import { formatVND } from '../utils/calculator';

interface NavbarProps {
  activeTab: number;
  setActiveTab: (tab: number) => void;
  onSelectPreset: (preset: ProjectPreset) => void;
  onExportExcel: () => void;
  onExportProjectJSON?: () => void;
  onImportProjectJSON?: (file: File) => void;
  onOpenAddControllerModal: () => void;
  onOpenAddLuminaireModal: () => void;
  onOpenProjectManagerModal: () => void;
  onOpenCreateProjectModal: () => void;
  activeProject?: LightingProject;
  totalProjectsCount: number;
  totalControllersCount: number;
  totalLuminairesCount: number;
  totalDesignLinesCount: number;
  totalPowerKW: number;
  totalCostVND: number;
  lastSavedTime?: string;
  isAutoSaving?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onSelectPreset,
  onExportExcel,
  onExportProjectJSON,
  onImportProjectJSON,
  onOpenAddControllerModal,
  onOpenAddLuminaireModal,
  onOpenProjectManagerModal,
  onOpenCreateProjectModal,
  activeProject,
  totalProjectsCount,
  totalControllersCount,
  totalLuminairesCount,
  totalDesignLinesCount,
  totalPowerKW,
  totalCostVND,
  lastSavedTime,
  isAutoSaving
}) => {
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportProjectJSON) {
      onImportProjectJSON(file);
      e.target.value = '';
    }
  };
  return (
    <header className="bg-[#121212] border-b border-[#333333] text-[#E0E0E0] sticky top-0 z-30 shadow-2xl">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#888888] font-semibold font-mono">
              Professional Lighting Control System
            </span>
            <span 
              className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 border border-emerald-800/60 flex items-center gap-1.5 shadow-sm"
              title={`Dữ liệu dự án được tự động lưu vào LocalStorage${lastSavedTime ? ` lúc ${lastSavedTime}` : ''}`}
            >
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${isAutoSaving ? 'inline-flex' : 'hidden'}`}></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-bold">Auto-Saved</span>
              {lastSavedTime && <span className="text-emerald-300/80 font-normal">({lastSavedTime})</span>}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <h1 className="text-2xl md:text-3xl font-light tracking-tighter italic font-serif text-[#F2F2F2]">
              LIGHTING CONTROL CAL
            </h1>
            <span className="text-xs not-italic font-mono text-[#00A3FF] font-semibold tracking-wider">
              v2.5.0
            </span>
          </div>
        </div>

        {/* Project Selector & Management Pill */}
        <div className="flex items-center gap-2 bg-[#0A0A0A] p-1.5 border border-[#2E2E2E] shadow-inner max-w-full overflow-hidden">
          <div className="flex items-center gap-2 pl-2 pr-1 truncate">
            <FolderKanban className="w-4 h-4 text-[#00A3FF] shrink-0" />
            <div className="truncate text-left">
              <div className="text-[9px] font-mono text-[#888888] uppercase flex items-center gap-1">
                <span>Dự Án Hiện Tại:</span>
                {activeProject?.code && (
                  <strong className="text-amber-400">[{activeProject.code}]</strong>
                )}
              </div>
              <div className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-[260px] font-sans" title={activeProject?.name}>
                {activeProject?.name || 'Dự Án Mặc Định'}
              </div>
            </div>
          </div>

          <button
            onClick={onOpenProjectManagerModal}
            className="bg-[#1C1C1C] hover:bg-[#282828] text-[#00A3FF] hover:text-white px-2.5 py-1.5 text-xs font-mono font-bold border border-[#3A3A3A] transition-colors shrink-0 flex items-center gap-1"
            title="Mở Quản Lý Dự Án để chuyển đổi, sao chép hoặc xuất dữ liệu"
          >
            <span>Đổi / Quản Lý</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          <button
            onClick={onOpenCreateProjectModal}
            className="bg-[#00A3FF] hover:bg-[#33B5FF] text-black px-2.5 py-1.5 text-xs font-mono font-bold uppercase transition-colors shrink-0 flex items-center gap-1"
            title="Tạo dự án chiếu sáng mới"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dự Án Mới</span>
          </button>
        </div>

        {/* Quick Actions & Export */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Selector Dropdown */}
          <div className="relative group">
            <div className="flex items-center gap-1.5 bg-[#1A1A1A] hover:bg-[#252525] text-[#E0E0E0] text-xs font-mono uppercase tracking-wider px-3 py-2 border border-[#333333] transition-colors cursor-pointer">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#00A3FF]" />
              <span>Mẫu Dự Án</span>
            </div>
            <div className="absolute right-0 mt-1 w-80 bg-[#141414] border border-[#333333] shadow-2xl p-2 hidden group-hover:block z-50">
              <div className="text-[10px] font-mono font-bold text-[#00A3FF] px-2 py-1 uppercase tracking-widest border-b border-[#222222] mb-1">
                Preset Configurations:
              </div>
              {PROJECT_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onSelectPreset(p)}
                  className="w-full text-left p-2.5 hover:bg-[#1F1F1F] transition text-xs group/btn border-b border-[#222222]/50 last:border-b-0"
                >
                  <div className="font-medium text-[#F2F2F2] group-hover/btn:text-[#00A3FF] font-sans">{p.name}</div>
                  <div className="text-[10px] text-[#888888] line-clamp-2 mt-0.5 font-sans">{p.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Add Device / Fixture Buttons */}
          <button
            onClick={onOpenAddControllerModal}
            className="flex items-center gap-1.5 bg-[#1A1A1A] hover:bg-[#252525] text-[#E0E0E0] text-xs font-mono uppercase tracking-wider px-3 py-2 border border-[#333333] transition-colors"
            title="Thêm thiết bị điều khiển mới vào Sheet 1"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#00A3FF]" />
            <span className="hidden sm:inline">+ Thiết Bị Ctrl</span>
          </button>

          <button
            onClick={onOpenAddLuminaireModal}
            className="flex items-center gap-1.5 bg-[#1A1A1A] hover:bg-[#252525] text-[#E0E0E0] text-xs font-mono uppercase tracking-wider px-3 py-2 border border-[#333333] transition-colors"
            title="Thêm loại đèn mới vào Sheet 2"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">+ Mã Đèn</span>
          </button>

          {/* Hidden JSON file input */}
          <input
            type="file"
            ref={jsonFileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
          />

          {/* Import / Export JSON Project Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => jsonFileInputRef.current?.click()}
              className="flex items-center gap-1.5 bg-[#181818] hover:bg-[#252525] text-amber-300 hover:text-amber-200 text-xs font-mono px-2.5 py-2 border border-amber-800/40 transition-colors"
              title="Nhập file dự án (.json) đã lưu từ máy tính vào ứng dụng"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xl:inline">Nhập JSON</span>
            </button>

            {onExportProjectJSON && (
              <button
                onClick={onExportProjectJSON}
                className="flex items-center gap-1.5 bg-[#181818] hover:bg-[#252525] text-emerald-300 hover:text-emerald-200 text-xs font-mono px-2.5 py-2 border border-emerald-800/40 transition-colors"
                title="Xuất dự án hiện tại ra file .json để lưu trữ trên máy tính cá nhân"
              >
                <FileJson className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden xl:inline">Lưu JSON</span>
              </button>
            )}
          </div>

          {/* Export Excel Button */}
          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 bg-[#00A3FF] hover:bg-[#33B5FF] text-black font-bold uppercase text-xs px-3.5 py-2 tracking-widest transition-colors font-sans"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Statistics Bar */}
      <div className="bg-[#0A0A0A] border-t border-[#222222] px-4 py-2 font-mono text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-[#888888] gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5">
              <FolderKanban className="w-3.5 h-3.5 text-[#00A3FF]" />
              <strong className="text-[#F2F2F2]">{totalProjectsCount}</strong> Dự Án
            </span>
            <span className="text-[#444444]">|</span>
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#00A3FF]" />
              <strong className="text-[#F2F2F2]">{totalControllersCount}</strong> Controllers
            </span>
            <span className="text-[#444444]">|</span>
            <span className="flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <strong className="text-[#F2F2F2]">{totalLuminairesCount}</strong> Fixtures
            </span>
            <span className="text-[#444444]">|</span>
            <span className="flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <strong className="text-[#F2F2F2]">{totalDesignLinesCount}</strong> Tuyến Đèn
            </span>
          </div>

          <div className="flex items-center gap-4 bg-[#141414] px-3 py-1 border border-[#2A2A2A]">
            <span>Tổng Công Suất: <strong className="text-amber-400 font-semibold">{totalPowerKW.toFixed(2)} kW</strong></span>
            <span className="text-[#444444]">|</span>
            <span>Tổng Dự Toán: <strong className="text-emerald-400 font-bold">{formatVND(totalCostVND)}</strong></span>
          </div>
        </div>
      </div>
    </header>
  );
};
