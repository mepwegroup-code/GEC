import React, { useState, useRef } from 'react';
import { 
  X, 
  FolderKanban, 
  Plus, 
  Check, 
  Copy, 
  Trash2, 
  Edit3, 
  Download, 
  Upload, 
  Search, 
  Building2, 
  Zap, 
  DollarSign, 
  Calendar, 
  MapPin, 
  User, 
  Layers, 
  Sparkles, 
  AlertCircle,
  FileCheck,
  ArrowRight
} from 'lucide-react';
import { LightingProject, ControllerDevice, LuminaireFixture, SubControllerDevice, DesignLineItem, BMSProtocol } from '../types';
import { PROJECT_PRESETS, SAMPLE_LINE_ITEMS } from '../data/samplePresets';
import { calculateLineResult, generateBOQ, formatVND } from '../utils/calculator';

interface ProjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: LightingProject[];
  activeProjectId: string;
  onSelectProject: (projectId: string) => void;
  onCreateProject: (newProject: LightingProject) => void;
  onUpdateProject: (updatedProject: LightingProject) => void;
  onDeleteProject: (projectId: string) => void;
  onDuplicateProject: (projectId: string) => void;
  controllers: ControllerDevice[];
  luminaires: LuminaireFixture[];
  subControllers: SubControllerDevice[];
}

export const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({
  isOpen,
  onClose,
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  onDuplicateProject,
  controllers,
  luminaires,
  subControllers
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'import'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProject, setEditingProject] = useState<LightingProject | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<LightingProject | null>(null);

  // Form State for Creating a Project
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectCode, setNewProjectCode] = useState(() => {
    const d = new Date();
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const rand = Math.floor(100 + Math.random() * 900);
    return `PRJ-${yy}${mm}-${rand}`;
  });
  const [newClientName, setNewClientName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Filter projects by search term
  const filteredProjects = projects.filter(p => {
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      (p.code && p.code.toLowerCase().includes(term)) ||
      (p.clientName && p.clientName.toLowerCase().includes(term)) ||
      (p.location && p.location.toLowerCase().includes(term))
    );
  });

  // Calculate project metrics helper
  const getProjectStats = (proj: LightingProject) => {
    const results = proj.lineItems.map(item => calculateLineResult(item, controllers, luminaires, subControllers));
    const { totalCostVND, totalPowerKW } = generateBOQ(results);
    
    // Group by areas
    const areas = new Set<string>();
    proj.lineItems.forEach(item => {
      let areaName = item.zoneName;
      if (areaName.includes(' - ')) areaName = areaName.split(' - ')[0].trim();
      else if (areaName.includes(': ')) areaName = areaName.split(': ')[0].trim();
      areas.add(areaName);
    });

    return {
      areasCount: areas.size,
      linesCount: proj.lineItems.length,
      totalFixtures: proj.lineItems.reduce((sum, i) => sum + i.fixtureQuantity, 0),
      totalPowerKW,
      totalCostVND
    };
  };

  // Starter Templates
  const templates: { id: string; name: string; badge: string; desc: string; items: DesignLineItem[] }[] = [
    {
      id: 'tmpl-multibrand',
      name: 'Facade Tòa Nhà Cao Tầng Phức Hợp Multi-Brand',
      badge: 'Phổ biến nhất',
      desc: 'Mặt đứng tháp cao tầng kết hợp Pharos LPC X, Griven Capital, ColorKinetics Graze, iGuzzini Trick và L&L Neva kết nối BMS BACnet IP.',
      items: SAMPLE_LINE_ITEMS
    },
    {
      id: 'tmpl-colorkinetics',
      name: 'Mặt Đứng Facade Signify ColorKinetics & Dynalite',
      badge: 'Signify CK',
      desc: 'Hệ thống DMX512/RDM ColorGraze MX, ReachElite, Dynalite DMX controller và Data Enabler Pro.',
      items: PROJECT_PRESETS[1].items
    },
    {
      id: 'tmpl-dali-hotel',
      name: 'Khách Sạn 5* & Đại Sảnh Tiệc DALI-2 Helvar DT8',
      badge: 'DALI-2 DT8',
      desc: 'Hệ thống điều khiển ánh sáng kiến trúc nội thất Helvar Router 910 kết hợp ERCO Parscan & NEKO Downlight.',
      items: PROJECT_PRESETS[2].items
    },
    {
      id: 'tmpl-signify-zxp399',
      name: 'Tòa Nhà Thông Minh Philips / Signify ZXP399 + LTECH + BMS',
      badge: 'Signify ZXP399',
      desc: 'Giải pháp tích hợp Philips / Signify ZXP399 Main Controller (6000 Univ), LTECH ArtNet và BMS Modbus TCP.',
      items: PROJECT_PRESETS[3].items
    },
    {
      id: 'tmpl-blank-standard',
      name: 'Dự Án Trắng Chuẩn (Clean Standard Project)',
      badge: 'Khởi đầu mới',
      desc: 'Khởi tạo dự án mới với 1 Khu Vực Facade Khối Tháp chuẩn để bắt đầu tự thiết kế từ đầu.',
      items: [
        {
          id: `line-${Date.now()}-1`,
          zoneName: 'Facade Khối Tháp - Tuyến 1: Đèn Hắt Cột Vách',
          luminaireBrand: 'Griven',
          luminaireId: 'lum-griven-capital600',
          fixtureQuantity: 16,
          controllerBrand: 'Pharos Controls',
          controllerId: 'ctrl-pharos-lpc2',
          bmsRequired: 'BACnet IP',
          controllerToFirstFixtureDistance: 50,
          interFixtureDistance: 2.5,
          totalCableLengthMeters: 87.5
        }
      ]
    }
  ];

  // Handle Create Project
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const now = new Date().toISOString();
    const chosenTemplate = templates[selectedTemplateIndex] || templates[0];

    // Clone items with fresh IDs
    const clonedItems = chosenTemplate.items.map((item, idx) => ({
      ...item,
      id: `line-${Date.now()}-${idx}`
    }));

    const newProject: LightingProject = {
      id: `proj-${Date.now()}`,
      name: newProjectName.trim(),
      code: newProjectCode.trim() || `PRJ-${Date.now()}`,
      clientName: newClientName.trim(),
      location: newLocation.trim(),
      description: newDescription.trim(),
      createdAt: now,
      updatedAt: now,
      lineItems: clonedItems
    };

    onCreateProject(newProject);
    onSelectProject(newProject.id);

    // Reset Form
    setNewProjectName('');
    const d = new Date();
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const rand = Math.floor(100 + Math.random() * 900);
    setNewProjectCode(`PRJ-${yy}${mm}-${rand}`);
    setNewClientName('');
    setNewLocation('');
    setNewDescription('');
    setActiveTab('list');
  };

  // Handle Update Project Info
  const handleSaveEditProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    onUpdateProject({
      ...editingProject,
      updatedAt: new Date().toISOString()
    });

    setEditingProject(null);
  };

  // Handle Export Project JSON
  const handleExportJSON = (project: LightingProject) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${(project.code || 'project')}_${project.name.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Handle Import JSON
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    fileReader.readAsText(files[0], "UTF-8");
    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.name && Array.isArray(parsed.lineItems)) {
          const importedProject: LightingProject = {
            ...parsed,
            id: `proj-${Date.now()}`,
            name: `${parsed.name} (Đã Nhập)`,
            code: parsed.code ? `${parsed.code}-IMP` : `PRJ-IMP-${Date.now().toString().slice(-4)}`,
            updatedAt: new Date().toISOString()
          };
          onCreateProject(importedProject);
          onSelectProject(importedProject.id);
          setActiveTab('list');
        } else {
          alert('Định dạng file JSON dự án không hợp lệ. Vui lòng kiểm tra lại!');
        }
      } catch (err) {
        alert('Lỗi đọc file JSON dự án: ' + err);
      }
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0A0A0A] border-2 border-[#333333] w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Modal Header */}
        <div className="bg-[#121212] px-6 py-4 border-b border-[#2A2A2A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00A3FF]/15 border border-[#00A3FF]/40 text-[#00A3FF]">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#00A3FF]">
                Multi-Project Workspace Engine
              </div>
              <h2 className="text-lg font-bold text-[#F2F2F2] mt-0.5">
                Quản Lý & Lưu Trữ Dự Án Chiếu Sáng (Project Management)
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#888888] hover:text-white p-1 hover:bg-[#202020] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation & Search */}
        <div className="bg-[#141414] px-6 py-2.5 border-b border-[#262626] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => { setActiveTab('list'); setEditingProject(null); }}
              className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-colors ${
                activeTab === 'list'
                  ? 'bg-[#00A3FF] text-black'
                  : 'bg-[#1C1C1C] text-[#888888] hover:text-[#CCCCCC] border border-[#333333]'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Danh Sách Dự Án ({projects.length})</span>
            </button>

            <button
              onClick={() => { setActiveTab('create'); setEditingProject(null); }}
              className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-colors ${
                activeTab === 'create'
                  ? 'bg-[#00A3FF] text-black'
                  : 'bg-[#1C1C1C] text-[#888888] hover:text-[#CCCCCC] border border-[#333333]'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tạo Dự Án Mới</span>
            </button>

            <button
              onClick={() => { setActiveTab('import'); setEditingProject(null); }}
              className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-colors ${
                activeTab === 'import'
                  ? 'bg-[#00A3FF] text-black'
                  : 'bg-[#1C1C1C] text-[#888888] hover:text-[#CCCCCC] border border-[#333333]'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Nhập File JSON</span>
            </button>
          </div>

          {activeTab === 'list' && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#666666]" />
              <input
                type="text"
                placeholder="Tìm dự án theo tên, mã, CĐT..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-[#1A1A1A] text-xs text-[#E0E0E0] pl-8 pr-3 py-1.5 border border-[#333333] focus:outline-none focus:border-[#00A3FF] font-mono"
              />
            </div>
          )}
        </div>

        {/* Modal Body Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#0A0A0A]">
          {/* TAB 1: PROJECT LIST */}
          {activeTab === 'list' && !editingProject && (
            <div className="space-y-4">
              {filteredProjects.length === 0 ? (
                <div className="bg-[#111111] border border-[#2A2A2A] p-8 text-center space-y-3">
                  <FolderKanban className="w-10 h-10 text-[#555555] mx-auto" />
                  <p className="text-sm text-[#888888]">Không tìm thấy dự án nào khớp với từ khóa tìm kiếm.</p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="px-4 py-2 bg-[#00A3FF] text-black text-xs font-mono font-bold uppercase"
                  >
                    + Tạo Dự Án Mới Ngay
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredProjects.map(proj => {
                    const isActive = proj.id === activeProjectId;
                    const stats = getProjectStats(proj);

                    return (
                      <div
                        key={proj.id}
                        className={`bg-[#111111] border-2 transition-all p-4 flex flex-col justify-between space-y-3 relative group ${
                          isActive
                            ? 'border-[#00A3FF] shadow-lg shadow-[#00A3FF]/10'
                            : 'border-[#262626] hover:border-[#404040]'
                        }`}
                      >
                        {/* Card Header & Badges */}
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {isActive ? (
                                <span className="bg-[#00A3FF] text-black text-[10px] font-mono font-bold uppercase px-2 py-0.5 flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  Đang Hoạt Động
                                </span>
                              ) : (
                                <span className="bg-[#1F1F1F] text-[#888888] text-[10px] font-mono uppercase px-2 py-0.5 border border-[#333333]">
                                  Dự Án Lưu Trữ
                                </span>
                              )}
                              {proj.code && (
                                <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 border border-amber-500/30">
                                  {proj.code}
                                </span>
                              )}
                            </div>

                            {/* Card Top Action Icons */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setEditingProject(proj)}
                                className="p-1 text-[#888888] hover:text-[#00A3FF] hover:bg-[#1A1A1A] transition-colors"
                                title="Chỉnh sửa thông tin dự án"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => onDuplicateProject(proj.id)}
                                className="p-1 text-[#888888] hover:text-purple-400 hover:bg-[#1A1A1A] transition-colors"
                                title="Nhân bản dự án này (Tạo bản sao mới)"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleExportJSON(proj)}
                                className="p-1 text-[#888888] hover:text-emerald-400 hover:bg-[#1A1A1A] transition-colors"
                                title="Xuất file sao lưu (.json)"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setProjectToDelete(proj)}
                                disabled={projects.length <= 1}
                                className={`p-1 transition-colors ${
                                  projects.length <= 1
                                    ? 'text-[#444444] cursor-not-allowed'
                                    : 'text-[#888888] hover:text-red-400 hover:bg-[#1A1A1A]'
                                }`}
                                title={projects.length <= 1 ? 'Không thể xóa dự án duy nhất' : 'Xóa dự án'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Project Name */}
                          <h3 className="text-base font-bold text-[#F2F2F2] font-sans line-clamp-2 leading-snug">
                            {proj.name}
                          </h3>

                          {/* Meta: Client & Location */}
                          <div className="space-y-1 text-xs text-[#888888]">
                            {proj.clientName && (
                              <div className="flex items-center gap-1.5 truncate">
                                <User className="w-3.5 h-3.5 text-[#00A3FF] shrink-0" />
                                <span>CĐT: <strong className="text-[#CCCCCC]">{proj.clientName}</strong></span>
                              </div>
                            )}
                            {proj.location && (
                              <div className="flex items-center gap-1.5 truncate">
                                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <span>Địa điểm: <strong className="text-[#CCCCCC]">{proj.location}</strong></span>
                              </div>
                            )}
                          </div>

                          {proj.description && (
                            <p className="text-[11px] text-[#777777] line-clamp-2 italic font-sans">
                              {proj.description}
                            </p>
                          )}
                        </div>

                        {/* Project Statistics Bar */}
                        <div className="pt-2 border-t border-[#1E1E1E] grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                          <div className="bg-[#141414] p-1.5 border border-[#222222]">
                            <div className="text-[#888888]">Khu Vực & Tuyến</div>
                            <div className="font-bold text-[#00A3FF] mt-0.5">{stats.areasCount} KV • {stats.linesCount} Tuyến</div>
                          </div>
                          <div className="bg-[#141414] p-1.5 border border-[#222222]">
                            <div className="text-[#888888]">Tổng Công Suất</div>
                            <div className="font-bold text-amber-400 mt-0.5">{stats.totalPowerKW.toFixed(2)} kW</div>
                          </div>
                          <div className="bg-[#141414] p-1.5 border border-[#222222]">
                            <div className="text-[#888888]">Dự Toán Thiết Bị</div>
                            <div className="font-bold text-emerald-400 mt-0.5">{formatVND(stats.totalCostVND)}</div>
                          </div>
                        </div>

                        {/* Switch Project Button */}
                        <div>
                          {isActive ? (
                            <div className="w-full py-2 bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 text-xs font-mono font-bold text-center flex items-center justify-center gap-1.5">
                              <FileCheck className="w-3.5 h-3.5" />
                              <span>Đang Làm Việc Trên Dự Án Này</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                onSelectProject(proj.id);
                                onClose();
                              }}
                              className="w-full py-2 bg-[#1A1A1A] hover:bg-[#00A3FF] text-[#E0E0E0] hover:text-black border border-[#333333] hover:border-[#00A3FF] text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                            >
                              <span>Mở & Chuyển Sang Dự Án Này</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* EDIT PROJECT FORM MODAL INLINE */}
          {editingProject && (
            <form onSubmit={handleSaveEditProject} className="bg-[#111111] p-5 border border-[#333333] space-y-4">
              <div className="flex items-center justify-between border-b border-[#222222] pb-3">
                <h3 className="text-base font-bold text-[#F2F2F2] flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[#00A3FF]" />
                  Chỉnh Sửa Thông Tin Dự Án
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="text-xs text-[#888888] hover:text-white"
                >
                  Hủy bỏ
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                <div className="space-y-1">
                  <label className="text-[#AAAAAA] font-mono">Tên Dự Án (*):</label>
                  <input
                    type="text"
                    required
                    value={editingProject.name}
                    onChange={e => setEditingProject({ ...editingProject, name: e.target.value })}
                    className="w-full bg-[#181818] text-[#F2F2F2] p-2 border border-[#333333] focus:outline-none focus:border-[#00A3FF]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#AAAAAA] font-mono">Mã Dự Án (Code):</label>
                  <input
                    type="text"
                    value={editingProject.code || ''}
                    onChange={e => setEditingProject({ ...editingProject, code: e.target.value })}
                    className="w-full bg-[#181818] text-amber-400 font-mono p-2 border border-[#333333] focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#AAAAAA] font-mono">Chủ Đầu Tư / Khách Hàng:</label>
                  <input
                    type="text"
                    value={editingProject.clientName || ''}
                    onChange={e => setEditingProject({ ...editingProject, clientName: e.target.value })}
                    className="w-full bg-[#181818] text-[#F2F2F2] p-2 border border-[#333333] focus:outline-none focus:border-[#00A3FF]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#AAAAAA] font-mono">Địa Điểm Công Trình:</label>
                  <input
                    type="text"
                    value={editingProject.location || ''}
                    onChange={e => setEditingProject({ ...editingProject, location: e.target.value })}
                    className="w-full bg-[#181818] text-[#F2F2F2] p-2 border border-[#333333] focus:outline-none focus:border-[#00A3FF]"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[#AAAAAA] font-mono">Mô Tả & Ghi Chú Kỹ Thuật:</label>
                  <textarea
                    rows={3}
                    value={editingProject.description || ''}
                    onChange={e => setEditingProject({ ...editingProject, description: e.target.value })}
                    className="w-full bg-[#181818] text-[#F2F2F2] p-2 border border-[#333333] focus:outline-none focus:border-[#00A3FF]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#222222]">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#252525] text-[#CCCCCC] text-xs font-mono uppercase border border-[#333333]"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00A3FF] hover:bg-[#33B5FF] text-black text-xs font-mono font-bold uppercase"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: CREATE NEW PROJECT */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateSubmit} className="space-y-5">
              <div className="bg-[#111111] p-5 border border-[#333333] space-y-4">
                <div className="border-b border-[#222222] pb-2">
                  <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                    <Plus className="w-4 h-4 text-[#00A3FF]" />
                    1. Thông Tin Cơ Bản Dự Án Mới
                  </h3>
                  <p className="text-xs text-[#888888] font-sans mt-0.5">
                    Khai báo tên dự án, mã quản lý và thông tin chủ đầu tư để phân loại độc lập, không bị trùng lặp.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                  <div className="space-y-1">
                    <label className="text-[#AAAAAA] font-mono font-bold flex items-center gap-1">
                      <span>Tên Dự Án Chiếu Sáng</span>
                      <span className="text-[#00A3FF]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Tòa Nhà Bitexco Financial 2 - Facade DMX512"
                      value={newProjectName}
                      onChange={e => setNewProjectName(e.target.value)}
                      className="w-full bg-[#181818] text-[#F2F2F2] p-2.5 border border-[#333333] focus:outline-none focus:border-[#00A3FF] font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#AAAAAA] font-mono font-bold">Mã Quản Lý Dự Án (Code):</label>
                    <input
                      type="text"
                      placeholder="VD: PRJ-2026-008"
                      value={newProjectCode}
                      onChange={e => setNewProjectCode(e.target.value)}
                      className="w-full bg-[#181818] text-amber-400 font-mono p-2.5 border border-[#333333] focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#AAAAAA] font-mono">Chủ Đầu Tư / Khách Hàng:</label>
                    <input
                      type="text"
                      placeholder="VD: Tập Đoàn Vingroup / Sungroup / Khang Điền..."
                      value={newClientName}
                      onChange={e => setNewClientName(e.target.value)}
                      className="w-full bg-[#181818] text-[#F2F2F2] p-2.5 border border-[#333333] focus:outline-none focus:border-[#00A3FF]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#AAAAAA] font-mono">Địa Điểm Công Trình:</label>
                    <input
                      type="text"
                      placeholder="VD: TP. Nha Trang, Khánh Hòa"
                      value={newLocation}
                      onChange={e => setNewLocation(e.target.value)}
                      className="w-full bg-[#181818] text-[#F2F2F2] p-2.5 border border-[#333333] focus:outline-none focus:border-[#00A3FF]"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[#AAAAAA] font-mono">Mô Tả Yêu Cầu Thiết Kế & Phạm Vi:</label>
                    <textarea
                      rows={2}
                      placeholder="VD: Chiếu sáng mặt đứng Facade và vương miện mái tháp 35 tầng, kết nối BMS tòa nhà qua giao thức BACnet IP..."
                      value={newDescription}
                      onChange={e => setNewDescription(e.target.value)}
                      className="w-full bg-[#181818] text-[#F2F2F2] p-2.5 border border-[#333333] focus:outline-none focus:border-[#00A3FF]"
                    />
                  </div>
                </div>
              </div>

              {/* Starter Template Selection */}
              <div className="bg-[#111111] p-5 border border-[#333333] space-y-3">
                <div className="border-b border-[#222222] pb-2">
                  <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    2. Chọn Mẫu Khởi Tạo Ban Đầu (Starter Template)
                  </h3>
                  <p className="text-xs text-[#888888] font-sans mt-0.5">
                    Dự án mới sẽ được thiết lập sẵn các khu vực mẫu chuẩn hoá, bạn có thể tự do thêm, xóa, đổi tên khu vực sau này.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {templates.map((tmpl, idx) => {
                    const isSelected = selectedTemplateIndex === idx;
                    return (
                      <div
                        key={tmpl.id}
                        onClick={() => setSelectedTemplateIndex(idx)}
                        className={`p-3.5 border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#181818] border-[#00A3FF]'
                            : 'bg-[#141414] border-[#262626] hover:border-[#383838]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 border ${
                            isSelected
                              ? 'bg-[#00A3FF] text-black border-[#00A3FF]'
                              : 'bg-[#202020] text-amber-400 border-amber-500/30'
                          }`}>
                            {tmpl.badge}
                          </span>
                          <span className="text-[10px] text-[#888888] font-mono">
                            {tmpl.items.length} Tuyến Đèn Mẫu
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-[#F2F2F2] mt-1.5 font-sans">{tmpl.name}</h4>
                        <p className="text-[11px] text-[#888888] mt-1 font-sans line-clamp-2">{tmpl.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2.5 bg-[#1A1A1A] hover:bg-[#252525] text-[#CCCCCC] text-xs font-mono uppercase border border-[#333333]"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#00A3FF] hover:bg-[#33B5FF] text-black text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>Khởi Tạo & Bắt Đầu Thiết Kế Dự Án</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: IMPORT PROJECT JSON */}
          {activeTab === 'import' && (
            <div className="bg-[#111111] p-8 border border-[#333333] text-center space-y-4">
              <Upload className="w-12 h-12 text-[#00A3FF] mx-auto" />
              <div>
                <h3 className="text-base font-bold text-[#F2F2F2] font-sans">Nhập Dự Án Từ File Sao Lưu JSON</h3>
                <p className="text-xs text-[#888888] font-sans max-w-md mx-auto mt-1">
                  Chọn file JSON dự án đã xuất trước đó để nạp lại toàn bộ cấu hình khu vực, tuyến đèn và thiết bị điều khiển.
                </p>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileImport}
                accept=".json"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-[#00A3FF] hover:bg-[#33B5FF] text-black font-mono font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-lg"
              >
                <Upload className="w-4 h-4" />
                <span>Chọn File (.json) Từ Máy Tính</span>
              </button>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal Overlay */}
        {projectToDelete && (
          <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="bg-[#141414] border-2 border-red-500/80 p-6 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex items-center gap-3 text-red-400">
                <AlertCircle className="w-6 h-6 shrink-0" />
                <h4 className="text-base font-bold font-sans">Xác Nhận Xóa Dự Án?</h4>
              </div>
              <p className="text-xs text-[#CCCCCC] font-sans leading-relaxed">
                Bạn có chắc chắn muốn xóa dự án <strong>"{projectToDelete.name}"</strong> (Mã: {projectToDelete.code || 'N/A'})?
                <br />
                Toàn bộ dữ liệu khu vực và tuyến đèn trong dự án này sẽ bị xóa khỏi bộ nhớ lưu trữ.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={() => setProjectToDelete(null)}
                  className="px-3.5 py-1.5 bg-[#1F1F1F] text-[#CCCCCC] text-xs font-mono border border-[#333333]"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteProject(projectToDelete.id);
                    setProjectToDelete(null);
                  }}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold uppercase"
                >
                  Xóa Vĩnh Viễn
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
