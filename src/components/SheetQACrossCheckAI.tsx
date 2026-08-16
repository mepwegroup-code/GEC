import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Sparkles,
  Bot,
  Send,
  RefreshCw,
  FileSpreadsheet,
  Zap,
  Activity,
  Layers,
  ArrowRight,
  Lightbulb,
  Check,
  Cpu,
  Info,
  ChevronDown,
  ChevronUp,
  Sliders,
  Award,
  Upload,
  FileText,
  Image as ImageIcon,
  Trash2,
  Eye,
  Download,
  Copy,
  CheckCheck,
  Filter,
  Maximize2,
  X,
  FileUp
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  CalculatedLineResult,
  BOQItem,
  LightingProject,
  RuleCheckIssue,
  UploadedDrawingFile,
  UploadedBOQFile,
  DrawingBOQAuditReport,
  ThreeWayDiscrepancyItem
} from '../types';
import { formatVND } from '../utils/calculator';
import {
  SAMPLE_SCHEMATIC_NAME,
  SAMPLE_SCHEMATIC_SVG,
  SAMPLE_BOQ_NAME,
  SAMPLE_BOQ_CSV
} from '../utils/sampleSchematics';

interface SheetQACrossCheckAIProps {
  project: LightingProject;
  lineResults: CalculatedLineResult[];
  boqItems: BOQItem[];
}

export const SheetQACrossCheckAI: React.FC<SheetQACrossCheckAIProps> = ({
  project,
  lineResults,
  boqItems
}) => {
  // Upload States
  const [drawingFile, setDrawingFile] = useState<UploadedDrawingFile | null>(null);
  const [boqFile, setBoqFile] = useState<UploadedBOQFile | null>(null);
  const [isDrawingDragging, setIsDrawingDragging] = useState(false);
  const [isBOQDragging, setIsBOQDragging] = useState(false);
  const [customFocus, setCustomFocus] = useState<string>('');
  const [selectedPresetFocus, setSelectedPresetFocus] = useState<string>('ALL');

  // Preview Modals
  const [previewDrawingModal, setPreviewDrawingModal] = useState(false);
  const [showParsedBOQModal, setShowParsedBOQModal] = useState(false);

  // AI Audit State
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [auditReport, setAuditReport] = useState<DrawingBOQAuditReport | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [discrepancyFilter, setDiscrepancyFilter] = useState<'ALL' | 'ISSUES_ONLY' | 'MATCH_ONLY'>('ALL');
  const [copiedReport, setCopiedReport] = useState(false);

  // Chatbot state
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([
    {
      role: 'assistant',
      text: `Xin chào Kỹ sư! Tôi là Kỹ Sư Trưởng AI chuyên về Hệ Thống Điều Khiển Chiếu Sáng & Giám Sát MEP. Bạn có thể tải lên bản vẽ sơ đồ nguyên lý (CAD, PDF, hình ảnh sơ đồ đi dây) và bảng khối lượng BOQ (Excel, CSV) để tôi kiểm tra chéo, rà soát tính đồng bộ vật tư và phát hiện sai sót kỹ thuật.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // File Inputs Refs
  const drawingInputRef = useRef<HTMLInputElement>(null);
  const boqInputRef = useRef<HTMLInputElement>(null);

  // Handle Drawing File Upload
  const handleDrawingUpload = (file: File) => {
    const reader = new FileReader();
    const isImage = file.type.startsWith('image/') || file.name.endsWith('.svg');
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');

    if (isImage || isPdf) {
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setDrawingFile({
          name: file.name,
          size: file.size,
          type: file.type || 'image/svg+xml',
          dataUrl,
          lastModified: file.lastModified,
          previewUrl: dataUrl
        });
      };
      reader.readAsDataURL(file);
    } else {
      // Text or CAD script
      reader.onload = (e) => {
        const textContent = e.target?.result as string;
        setDrawingFile({
          name: file.name,
          size: file.size,
          type: file.type || 'text/plain',
          dataUrl: '',
          textContent
        });
      };
      reader.readAsText(file);
    }
  };

  // Handle BOQ File Upload
  const handleBOQUpload = async (file: File) => {
    try {
      const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv');
      
      if (isExcel) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        if (rawJson.length > 0) {
          const headers = (rawJson[0] || []).map((h: any) => String(h || '').trim());
          const parsedRows = rawJson
            .slice(1)
            .filter((row) => row && row.some((cell) => cell !== undefined && cell !== ''))
            .map((row, idx) => {
              const rowObj: Record<string, any> = { _index: idx + 1 };
              headers.forEach((h, colIdx) => {
                rowObj[h || `Cột_${colIdx + 1}`] = row[colIdx] ?? '';
              });
              return rowObj;
            });

          const csvText = XLSX.utils.sheet_to_csv(worksheet);
          setBoqFile({
            name: file.name,
            size: file.size,
            type: file.type || 'application/vnd.ms-excel',
            textContent: csvText,
            parsedRows,
            headers
          });
          return;
        }
      }

      // If image of BOQ table
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setBoqFile({
            name: file.name,
            size: file.size,
            type: file.type,
            dataUrl: e.target?.result as string
          });
        };
        reader.readAsDataURL(file);
        return;
      }

      // Default text
      const text = await file.text();
      setBoqFile({
        name: file.name,
        size: file.size,
        type: file.type || 'text/plain',
        textContent: text
      });
    } catch (err) {
      console.error('Failed to parse BOQ file:', err);
    }
  };

  // Load Sample Schematic Preset
  const handleLoadSampleSchematic = () => {
    const svgBlob = new Blob([SAMPLE_SCHEMATIC_SVG], { type: 'image/svg+xml' });
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(SAMPLE_SCHEMATIC_SVG)}`;
    setDrawingFile({
      name: SAMPLE_SCHEMATIC_NAME,
      size: svgBlob.size,
      type: 'image/svg+xml',
      dataUrl,
      previewUrl: dataUrl,
      textContent: `Bản vẽ Sơ đồ nguyên lý điều khiển chiếu sáng MEP: Mã SD-MEP-E-501. Bao gồm tủ LCP-01 kết nối BMS BACnet/IP, 01 Tuyến DMX512 Facade 32 đèn + Opto-Splitter + Terminator 120Ω, 01 Tuyến ColorKinetics Data Enabler Pro 320W, và 01 Loop DALI-2 DT8 64 đèn + Bus Power 250mA.`
    });
  };

  // Load Sample BOQ Preset
  const handleLoadSampleBOQ = () => {
    const workbook = XLSX.read(SAMPLE_BOQ_CSV, { type: 'string' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawJson = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    const headers = rawJson[0].map((h: any) => String(h || '').trim());
    const parsedRows = rawJson.slice(1).map((row, idx) => {
      const obj: Record<string, any> = { _index: idx + 1 };
      headers.forEach((h, colIdx) => {
        obj[h] = row[colIdx] ?? '';
      });
      return obj;
    });

    setBoqFile({
      name: SAMPLE_BOQ_NAME,
      size: new Blob([SAMPLE_BOQ_CSV]).size,
      type: 'text/csv',
      textContent: SAMPLE_BOQ_CSV,
      parsedRows,
      headers
    });
  };

  // Sync BOQ from Sheet 04
  const handleSyncBOQFromSheet04 = () => {
    if (boqItems.length === 0) return;
    const headers = ['STT', 'Hạng Mục', 'Model / Hãng', 'Số Lượng', 'Đơn Vị', 'Đơn Giá (VNĐ)', 'Thành Tiền (VNĐ)', 'Ghi Chú'];
    const parsedRows = boqItems.map((item, idx) => ({
      _index: idx + 1,
      'STT': idx + 1,
      'Hạng Mục': item.name,
      'Model / Hãng': `${item.model} (${item.brand})`,
      'Số Lượng': item.quantity,
      'Đơn Vị': item.unit,
      'Đơn Giá (VNĐ)': item.unitPriceVND,
      'Thành Tiền (VNĐ)': item.totalPriceVND,
      'Ghi Chú': item.notes
    }));

    const csvContent = [
      headers.join(','),
      ...boqItems.map((item, idx) =>
        [
          idx + 1,
          `"${item.name.replace(/"/g, '""')}"`,
          `"${item.model} (${item.brand})"`,
          item.quantity,
          `"${item.unit}"`,
          item.unitPriceVND,
          item.totalPriceVND,
          `"${(item.notes || '').replace(/"/g, '""')}"`
        ].join(',')
      )
    ].join('\n');

    setBoqFile({
      name: `BOQ-Sheet04-${project.name || 'Project'}.csv`,
      size: new Blob([csvContent]).size,
      type: 'text/csv',
      textContent: csvContent,
      parsedRows,
      headers
    });
  };

  // Run Comprehensive AI Cross-Check Audit
  const handleRunAIAudit = async () => {
    setIsLoadingAI(true);
    setAiError(null);
    setLoadingStep('Đang khởi tạo phiên làm việc với Kỹ Sư Trưởng AI...');

    try {
      setTimeout(() => setLoadingStep('Đang nhận diện bóc tách đối tượng trên bản vẽ sơ đồ nguyên lý...'), 400);
      setTimeout(() => setLoadingStep('Đang đối chiếu bảng khối lượng BOQ với sơ đồ đấu nối...'), 1000);
      setTimeout(() => setLoadingStep('Đang tính toán dung lượng Universe DMX, loop DALI-2 và sụt áp...'), 1800);

      const response = await fetch('/api/ai-analyze-drawing-boq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drawingFile,
          boqFile,
          project,
          lineResults,
          boqItems,
          customFocus: customFocus || (selectedPresetFocus !== 'ALL' ? selectedPresetFocus : undefined)
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const reportData: DrawingBOQAuditReport = await response.json();
      setAuditReport(reportData);

      // Add audit summary to chat
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `🎯 **Kỹ Sư Trưởng AI đã hoàn tất Thẩm Định Chéo!**\n- **Điểm Toàn Vẹn Kỹ Thuật:** ${reportData.overallScore}%\n- **Trạng thái:** ${reportData.auditStatus === 'PASSED' ? 'ĐẠT CHUẨN NGHIỆM THU' : 'CÓ ĐIỂM CẦN LƯU Ý'}\n\n*Tóm tắt:* ${reportData.executiveSummary?.slice(0, 300)}...\n\nBạn có thể xem chi tiết bảng đối chiếu 3 chiều ở bên dưới hoặc đặt câu hỏi trực tiếp cho tôi.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      console.error('Failed to run drawing & BOQ audit:', err);
      setAiError('Không thể kết nối máy chủ AI. Đã kích hoạt bộ thẩm định kỹ thuật mô phỏng cục bộ.');
    } finally {
      setIsLoadingAI(false);
      setLoadingStep('');
    }
  };

  // Run on mount if nothing exists
  useEffect(() => {
    if (!drawingFile && !boqFile && lineResults.length > 0) {
      handleLoadSampleSchematic();
      handleSyncBOQFromSheet04();
    }
  }, []);

  // Send Message in Chat
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage.trim();
    if (!textToSend || isChatSending) return;

    const userMsg = {
      role: 'user' as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setIsChatSending(true);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          project,
          lineResults,
          boqItems,
          chatHistory: chatMessages,
          uploadedDrawingName: drawingFile?.name,
          uploadedBOQName: boqFile?.name
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.reply || 'Đã ghi nhận yêu cầu của bạn.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Rất tiếc, đã xảy ra lỗi kết nối với máy chủ AI. Bạn có thể tiếp tục xem các cảnh báo kỹ thuật trên bảng kiểm tra chéo.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsChatSending(false);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  // Copy Full Audit Summary
  const handleCopyReport = () => {
    if (!auditReport) return;
    const text = `BÁO CÁO THẨM TRA BẢN VẼ SƠ ĐỒ NGUYÊN LÝ & KHỐI LƯỢNG BOQ
Dự án: ${project.name} (Mã: ${project.code || 'PRJ'})
Thời gian: ${new Date(auditReport.timestamp).toLocaleString()}
Điểm kỹ thuật: ${auditReport.overallScore}% (${auditReport.auditStatus})

TÓM TẮT ĐÁNH GIÁ:
${auditReport.executiveSummary}

BÓC TÁCH TỪ BẢN VẼ SƠ ĐỒ:
- Tủ điều khiển: ${auditReport.schematicAnalysis.detectedPanels.join(', ')}
- Giao thức: ${auditReport.schematicAnalysis.detectedProtocols.join(', ')}
- Chuẩn đi dây: ${auditReport.schematicAnalysis.wiringTopology}
- Số bộ khuếch đại Repeater/Splitter: ${auditReport.schematicAnalysis.repeatersFound}
- Bộ trộn nguồn Injector: ${auditReport.schematicAnalysis.injectorsFound}
- Điện trở cuối tuyến 120Ω: ${auditReport.schematicAnalysis.terminationFound ? 'ĐÃ BỐ TRÍ' : 'CHƯA CÓ'}

DANH SÁCH SAI LỆCH KHỐI LƯỢNG (3-WAY DISCREPANCY):
${auditReport.threeWayDiscrepancies
  .map(
    (d) =>
      `- [${d.status}] ${d.item}: Bản vẽ=${d.drawingQuantity} | BOQ=${d.boqQuantity} | Cấu hình=${d.configQuantity} ${d.unit} -> ${d.notes}`
  )
  .join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  // Filtered Discrepancies
  const filteredDiscrepancies = useMemo(() => {
    if (!auditReport?.threeWayDiscrepancies) return [];
    if (discrepancyFilter === 'ALL') return auditReport.threeWayDiscrepancies;
    if (discrepancyFilter === 'ISSUES_ONLY')
      return auditReport.threeWayDiscrepancies.filter((d) => d.status !== 'MATCH');
    return auditReport.threeWayDiscrepancies.filter((d) => d.status === 'MATCH');
  }, [auditReport, discrepancyFilter]);

  const quickPrompts = [
    'Bản vẽ này có thiếu điện trở cuối tuyến 120Ω tại tuyến DMX nào không?',
    'Khối lượng bộ trộn Data Enabler trong BOQ có đủ cho tổng công suất các đèn không?',
    'Kiểm tra chiều dài tuyến cáp xa nhất và đánh giá sụt áp nguồn 24V/48V',
    'Hướng dẫn cấu hình địa chỉ IP cho bộ điều khiển để tích hợp BMS BACnet/IP'
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0A0A0A] p-5 border border-[#333333] shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase font-mono font-bold tracking-widest text-emerald-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            Sheet 05 • Multimodal AI Cross-Check & QA/QC Engine
          </div>
          <h2 className="text-xl font-light italic font-serif text-[#F2F2F2] mt-0.5">
            Tải Lên Bản Vẽ Sơ Đồ Nguyên Lý & BOQ Để AI Kỹ Sư Trưởng Thẩm Tra
          </h2>
          <p className="text-xs text-[#888888] font-sans mt-0.5 max-w-3xl">
            Hỗ trợ tải lên trực tiếp file bản vẽ sơ đồ nguyên lý (CAD / PDF / SVG / Image) và bảng khối lượng BOQ (Excel .xlsx / CSV). AI Agent tự động bóc tách đối tượng, đối chiếu 3 chiều, tính toán suy hao trở kháng và kiểm tra tính toàn vẹn hệ thống.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleLoadSampleSchematic}
            className="text-[11px] font-mono bg-[#141414] hover:bg-[#1F1F1F] text-[#CCCCCC] hover:text-white px-3 py-2 border border-[#333333] transition"
          >
            Nạp Bản Vẽ Mẫu
          </button>
          <button
            onClick={handleLoadSampleBOQ}
            className="text-[11px] font-mono bg-[#141414] hover:bg-[#1F1F1F] text-[#CCCCCC] hover:text-white px-3 py-2 border border-[#333333] transition"
          >
            Nạp BOQ Mẫu
          </button>
          <button
            onClick={handleRunAIAudit}
            disabled={isLoadingAI}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold uppercase tracking-wider px-4 py-2 transition shadow-lg font-sans disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAI ? 'animate-spin' : ''}`} />
            <span>{isLoadingAI ? 'AI Đang Thẩm Tra...' : 'Chạy AI Audit Toàn Diện'}</span>
          </button>
        </div>
      </div>

      {/* Upload Zone 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upload Column 1: Bản Vẽ Sơ Đồ Nguyên Lý */}
        <div
          className={`bg-[#0D0D0D] border p-5 transition-all flex flex-col justify-between ${
            isDrawingDragging
              ? 'border-emerald-400 bg-emerald-950/20'
              : drawingFile
              ? 'border-emerald-500/40 bg-[#0E1210]'
              : 'border-[#292929] hover:border-[#404040]'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDrawingDragging(true);
          }}
          onDragLeave={() => setIsDrawingDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDrawingDragging(false);
            if (e.dataTransfer.files?.[0]) {
              handleDrawingUpload(e.dataTransfer.files[0]);
            }
          }}
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#242424]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#1A1A1A] border border-[#333333] rounded">
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-[#F2F2F2]">
                    1. Bản Vẽ Sơ Đồ Nguyên Lý Điều Khiển
                  </h3>
                  <span className="text-[11px] text-[#777777] font-sans">
                    Schematic Diagram / SLD / Single-Line Topology
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-[#181818] text-[#888888] px-2 py-0.5 rounded border border-[#2E2E2E]">
                PNG, JPG, SVG, PDF, TXT
              </span>
            </div>

            {/* If Drawing is Uploaded */}
            {drawingFile ? (
              <div className="mt-4 space-y-3">
                <div className="bg-[#141816] border border-emerald-500/30 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {drawingFile.previewUrl ? (
                      <div
                        onClick={() => setPreviewDrawingModal(true)}
                        className="w-12 h-12 bg-black border border-[#333333] rounded overflow-hidden shrink-0 cursor-pointer relative group"
                      >
                        <img
                          src={drawingFile.previewUrl}
                          alt="Drawing preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                          <Eye className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    ) : (
                      <FileText className="w-8 h-8 text-emerald-400 shrink-0" />
                    )}
                    <div className="truncate">
                      <div className="text-xs font-semibold text-[#EEEEEE] truncate font-sans">
                        {drawingFile.name}
                      </div>
                      <div className="text-[10px] font-mono text-[#888888]">
                        {(drawingFile.size / 1024).toFixed(1)} KB • {drawingFile.type}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {drawingFile.previewUrl && (
                      <button
                        onClick={() => setPreviewDrawingModal(true)}
                        title="Xem phóng to bản vẽ"
                        className="p-1.5 bg-[#202020] hover:bg-[#2A2A2A] text-[#CCCCCC] hover:text-white border border-[#3A3A3A] transition rounded"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => setDrawingFile(null)}
                      title="Xóa bản vẽ"
                      className="p-1.5 bg-[#202020] hover:bg-red-950 text-[#888888] hover:text-red-400 border border-[#3A3A3A] hover:border-red-500/40 transition rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-[#888888] font-sans flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Bản vẽ đã sẵn sàng để Kỹ Sư Trưởng AI bóc tách đối tượng & phân tích topology.</span>
                </div>
              </div>
            ) : (
              /* Dropzone Placeholder */
              <div
                onClick={() => drawingInputRef.current?.click()}
                className="mt-4 border border-dashed border-[#333333] hover:border-emerald-400/60 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition bg-[#111111] hover:bg-[#141414] group"
              >
                <input
                  type="file"
                  ref={drawingInputRef}
                  className="hidden"
                  accept="image/*,.svg,.pdf,.txt"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleDrawingUpload(e.target.files[0]);
                  }}
                />
                <Upload className="w-7 h-7 text-[#666666] group-hover:text-emerald-400 transition mb-2" />
                <div className="text-xs font-semibold text-[#CCCCCC] group-hover:text-white font-sans">
                  Kéo thả bản vẽ vào đây, hoặc click để chọn file
                </div>
                <div className="text-[10px] text-[#777777] font-mono mt-1">
                  Nhận diện CAD export, sơ đồ nguyên lý PDF, sơ đồ đơn tuyến SLD, ảnh JPG/PNG
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#1F1F1F] flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#666666]">
              {drawingFile ? 'Trạng thái: Đã tải lên' : 'Chưa có bản vẽ'}
            </span>
            <button
              onClick={handleLoadSampleSchematic}
              className="text-[10px] font-mono text-emerald-400 hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              Nạp Sơ Đồ Mẫu Facade + DALI-2
            </button>
          </div>
        </div>

        {/* Upload Column 2: Bảng Khối Lượng BOQ / BOM */}
        <div
          className={`bg-[#0D0D0D] border p-5 transition-all flex flex-col justify-between ${
            isBOQDragging
              ? 'border-[#00A3FF] bg-sky-950/20'
              : boqFile
              ? 'border-[#00A3FF]/40 bg-[#0E1117]'
              : 'border-[#292929] hover:border-[#404040]'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsBOQDragging(true);
          }}
          onDragLeave={() => setIsBOQDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsBOQDragging(false);
            if (e.dataTransfer.files?.[0]) {
              handleBOQUpload(e.dataTransfer.files[0]);
            }
          }}
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#242424]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#1A1A1A] border border-[#333333] rounded">
                  <FileSpreadsheet className="w-4 h-4 text-[#00A3FF]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-[#F2F2F2]">
                    2. Bảng Khối Lượng BOQ / BOM Dự Toán
                  </h3>
                  <span className="text-[11px] text-[#777777] font-sans">
                    Bill of Quantities / Equipment Schedule
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-[#181818] text-[#888888] px-2 py-0.5 rounded border border-[#2E2E2E]">
                Excel (.xlsx, .xls), CSV, PDF
              </span>
            </div>

            {/* If BOQ is Uploaded */}
            {boqFile ? (
              <div className="mt-4 space-y-3">
                <div className="bg-[#12161E] border border-[#00A3FF]/30 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileSpreadsheet className="w-8 h-8 text-[#00A3FF] shrink-0" />
                    <div className="truncate">
                      <div className="text-xs font-semibold text-[#EEEEEE] truncate font-sans">
                        {boqFile.name}
                      </div>
                      <div className="text-[10px] font-mono text-[#888888]">
                        {(boqFile.size / 1024).toFixed(1)} KB •{' '}
                        {boqFile.parsedRows ? `${boqFile.parsedRows.length} dòng vật tư` : boqFile.type}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {boqFile.parsedRows && boqFile.parsedRows.length > 0 && (
                      <button
                        onClick={() => setShowParsedBOQModal(true)}
                        title="Xem bảng chi tiết"
                        className="p-1.5 bg-[#202020] hover:bg-[#2A2A2A] text-[#CCCCCC] hover:text-white border border-[#3A3A3A] transition rounded"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => setBoqFile(null)}
                      title="Xóa BOQ"
                      className="p-1.5 bg-[#202020] hover:bg-red-950 text-[#888888] hover:text-red-400 border border-[#3A3A3A] hover:border-red-500/40 transition rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-[#888888] font-sans flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00A3FF]" />
                  <span>
                    Đã nạp {boqFile.parsedRows ? boqFile.parsedRows.length : 'dữ liệu'} hạng mục vật tư để đối chiếu 3 chiều.
                  </span>
                </div>
              </div>
            ) : (
              /* Dropzone Placeholder */
              <div
                onClick={() => boqInputRef.current?.click()}
                className="mt-4 border border-dashed border-[#333333] hover:border-[#00A3FF]/60 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition bg-[#111111] hover:bg-[#141414] group"
              >
                <input
                  type="file"
                  ref={boqInputRef}
                  className="hidden"
                  accept=".xlsx,.xls,.csv,.pdf,.txt,image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleBOQUpload(e.target.files[0]);
                  }}
                />
                <Upload className="w-7 h-7 text-[#666666] group-hover:text-[#00A3FF] transition mb-2" />
                <div className="text-xs font-semibold text-[#CCCCCC] group-hover:text-white font-sans">
                  Kéo thả file BOQ vào đây, hoặc click để chọn file
                </div>
                <div className="text-[10px] text-[#777777] font-mono mt-1">
                  Đọc trực tiếp sheet Excel (.xlsx), CSV, hoặc đồng bộ từ Sheet 04 BOM
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#1F1F1F] flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#666666]">
              {boqFile ? 'Trạng thái: Đã sẵn sàng' : 'Chưa có BOQ'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSyncBOQFromSheet04}
                className="text-[10px] font-mono text-[#00A3FF] hover:underline flex items-center gap-1"
              >
                <Layers className="w-3 h-3" />
                Lấy BOQ từ Sheet 04
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Inspection Focus & Trigger Card */}
      <div className="bg-[#0D0D0D] border border-[#2B2B2B] p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase font-mono tracking-wider text-[#E0E0E0]">
              Tùy Chọn Trọng Tâm Thẩm Định Kỹ Thuật (Audit Scope)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'Toàn Diện 3 Chiều' },
              { id: 'QTY_CHECK', label: 'Đối Chiếu Khối Lượng Vật Tư' },
              { id: 'PROTOCOL_TOPOLOGY', label: 'Kiểm Tra DMX Daisy-Chain & DALI' },
              { id: 'POWER_INJECTOR', label: 'Kiểm Tra Bộ Trộn & Sụt Áp' },
              { id: 'BMS_INTEGRATION', label: 'Tích Hợp BMS BACnet/Modbus' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPresetFocus(p.id)}
                className={`text-[10px] font-mono px-2.5 py-1 rounded-sm border transition ${
                  selectedPresetFocus === p.id
                    ? 'bg-emerald-500 text-black font-bold border-emerald-500'
                    : 'bg-[#161616] text-[#888888] border-[#333333] hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          <input
            type="text"
            placeholder="Yêu cầu cụ thể thêm cho Kỹ Sư Trưởng AI (VD: Rà soát sụt áp cáp Facade >100m, kiểm tra cổng RJ45 BMS...)"
            value={customFocus}
            onChange={(e) => setCustomFocus(e.target.value)}
            className="flex-1 bg-[#141414] text-[#E0E0E0] text-xs font-sans px-3 py-2 border border-[#333333] focus:outline-none focus:border-emerald-400"
          />
          <button
            onClick={handleRunAIAudit}
            disabled={isLoadingAI}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold uppercase tracking-wider px-5 py-2 transition font-sans shrink-0 disabled:opacity-50"
          >
            <Bot className="w-4 h-4" />
            <span>{isLoadingAI ? 'Đang Chạy Thẩm Định...' : 'Bắt Đầu AI Audit'}</span>
          </button>
        </div>

        {/* Loading Step Banner */}
        {isLoadingAI && (
          <div className="bg-[#121815] border border-emerald-500/40 p-3 rounded flex items-center gap-3">
            <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
            <span className="text-xs font-mono text-emerald-300 animate-pulse">
              {loadingStep || 'Kỹ Sư Trưởng AI đang kiểm tra chéo bản vẽ và bảng khối lượng...'}
            </span>
          </div>
        )}
      </div>

      {/* AUDIT REPORT PRESENTATION */}
      {auditReport && (
        <div className="space-y-6">
          {/* Executive Overview Banner */}
          <div className="bg-[#0E0E0E] border border-emerald-500/40 p-5 shadow-2xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#242424] gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded">
                  <Bot className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#F2F2F2] font-sans flex items-center gap-2">
                    <span>Báo Cáo Thẩm Tra Của Kỹ Sư Trưởng AI (Senior QA/QC Audit)</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        auditReport.auditStatus === 'PASSED'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {auditReport.auditStatus}
                    </span>
                  </h3>
                  <p className="text-xs text-[#888888] font-sans">
                    Đối chiếu 3 chiều: Bản vẽ sơ đồ ({drawingFile?.name || 'Mô phỏng'}) ⟷ Bảng BOQ ({boqFile?.name || 'Sheet 04'}) ⟷ Cấu hình ({lineResults.length} tuyến)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] font-mono text-[#666666] uppercase">Điểm Chuẩn Kỹ Thuật</div>
                  <div className="text-2xl font-mono font-bold text-emerald-400">
                    {auditReport.overallScore}%
                  </div>
                </div>
                <button
                  onClick={handleCopyReport}
                  className="flex items-center gap-1.5 text-xs bg-[#1A1A1A] hover:bg-[#252525] text-[#CCCCCC] hover:text-white px-3 py-2 border border-[#333333] transition"
                >
                  {copiedReport ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedReport ? 'Đã Copy' : 'Sao Chép Báo Cáo'}</span>
                </button>
              </div>
            </div>

            {/* Summary Text */}
            <div className="bg-[#141414] p-4 border border-[#2B2B2B] text-xs text-[#D8D8D8] font-sans leading-relaxed">
              <strong className="text-emerald-400 font-semibold uppercase tracking-wider block mb-1">
                📋 Nhận Xét Tổng Quan Của Kỹ Sư Trưởng AI:
              </strong>
              {auditReport.executiveSummary}
            </div>

            {/* Schematic Detection Summary Cards */}
            {auditReport.schematicAnalysis && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-sans">
                <div className="bg-[#161616] p-3 border border-[#262626]">
                  <span className="text-[10px] font-mono uppercase text-[#777777] block">Tủ Điều Khiển</span>
                  <span className="font-semibold text-[#EEEEEE] block truncate mt-0.5">
                    {auditReport.schematicAnalysis.detectedPanels?.length || 1} Tủ
                  </span>
                  <span className="text-[10px] text-[#888888] truncate block">
                    {auditReport.schematicAnalysis.detectedPanels?.[0] || 'LCP-01'}
                  </span>
                </div>

                <div className="bg-[#161616] p-3 border border-[#262626]">
                  <span className="text-[10px] font-mono uppercase text-[#777777] block">Topology Đi Dây</span>
                  <span className="font-semibold text-emerald-400 block mt-0.5">
                    {auditReport.schematicAnalysis.wiringTopology || 'Daisy-Chain'}
                  </span>
                  <span className="text-[10px] text-[#888888] block">Chuẩn DMX/DALI</span>
                </div>

                <div className="bg-[#161616] p-3 border border-[#262626]">
                  <span className="text-[10px] font-mono uppercase text-[#777777] block">Bộ Lặp / Splitter</span>
                  <span className="font-semibold text-[#00A3FF] block mt-0.5">
                    {auditReport.schematicAnalysis.repeatersFound || 0} Bộ
                  </span>
                  <span className="text-[10px] text-[#888888] block">Cách ly quang học</span>
                </div>

                <div className="bg-[#161616] p-3 border border-[#262626]">
                  <span className="text-[10px] font-mono uppercase text-[#777777] block">Data Enabler / Injector</span>
                  <span className="font-semibold text-purple-400 block mt-0.5">
                    {auditReport.schematicAnalysis.injectorsFound || 0} Bộ
                  </span>
                  <span className="text-[10px] text-[#888888] block">Trộn nguồn + data</span>
                </div>

                <div className="bg-[#161616] p-3 border border-[#262626]">
                  <span className="text-[10px] font-mono uppercase text-[#777777] block">Trở Cuối Tuyến 120Ω</span>
                  <span className={`font-semibold block mt-0.5 ${auditReport.schematicAnalysis.terminationFound ? 'text-emerald-400' : 'text-red-400'}`}>
                    {auditReport.schematicAnalysis.terminationFound ? 'ĐÃ BỐ TRÍ' : 'THIẾU TRỞ'}
                  </span>
                  <span className="text-[10px] text-[#888888] block">Chống phản xạ sóng</span>
                </div>

                <div className="bg-[#161616] p-3 border border-[#262626]">
                  <span className="text-[10px] font-mono uppercase text-[#777777] block">Kết Nối BMS</span>
                  <span className="font-semibold text-amber-400 block mt-0.5">
                    {auditReport.schematicAnalysis.bmsGatewayFound ? 'BACnet / Modbus' : 'Trực tiếp'}
                  </span>
                  <span className="text-[10px] text-[#888888] block">Tích hợp tòa nhà</span>
                </div>
              </div>
            )}
          </div>

          {/* Three-Way Discrepancy Table */}
          <div className="bg-[#0A0A0A] border border-[#333333] shadow-2xl overflow-hidden">
            <div className="p-4 bg-[#141414] border-b border-[#333333] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-[#F2F2F2] font-sans flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Bảng Đối Chiếu 3 Chiều (Three-Way Discrepancy Matrix)</span>
                </h3>
                <p className="text-xs text-[#888888] font-sans">
                  So sánh trực quan: Số lượng trên Bản Vẽ ⟷ Số lượng trong Bảng BOQ ⟷ Cấu hình Hệ thống Sheet 03.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <button
                  onClick={() => setDiscrepancyFilter('ALL')}
                  className={`px-2.5 py-1 text-[11px] border transition ${
                    discrepancyFilter === 'ALL'
                      ? 'bg-white text-black font-bold border-white'
                      : 'bg-[#181818] text-[#888888] border-[#333333] hover:text-white'
                  }`}
                >
                  Tất cả ({auditReport.threeWayDiscrepancies?.length || 0})
                </button>
                <button
                  onClick={() => setDiscrepancyFilter('ISSUES_ONLY')}
                  className={`px-2.5 py-1 text-[11px] border transition ${
                    discrepancyFilter === 'ISSUES_ONLY'
                      ? 'bg-amber-500 text-black font-bold border-amber-500'
                      : 'bg-[#181818] text-amber-400 border-[#333333] hover:border-amber-400'
                  }`}
                >
                  Chỉ Sai Lệch ({auditReport.threeWayDiscrepancies?.filter((d) => d.status !== 'MATCH').length || 0})
                </button>
                <button
                  onClick={() => setDiscrepancyFilter('MATCH_ONLY')}
                  className={`px-2.5 py-1 text-[11px] border transition ${
                    discrepancyFilter === 'MATCH_ONLY'
                      ? 'bg-emerald-500 text-black font-bold border-emerald-500'
                      : 'bg-[#181818] text-emerald-400 border-[#333333] hover:border-emerald-400'
                  }`}
                >
                  Khớp 100% ({auditReport.threeWayDiscrepancies?.filter((d) => d.status === 'MATCH').length || 0})
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#111111] text-[#888888] uppercase font-mono text-[10px] border-b border-[#262626]">
                  <tr>
                    <th className="py-2.5 px-4">Hạng Mục Vật Tư & Quy Cách</th>
                    <th className="py-2.5 px-3">Phân Loại</th>
                    <th className="py-2.5 px-3 text-center">SL Bản Vẽ</th>
                    <th className="py-2.5 px-3 text-center">SL BOQ</th>
                    <th className="py-2.5 px-3 text-center">SL Sheet 03</th>
                    <th className="py-2.5 px-3 text-center">Đơn Vị</th>
                    <th className="py-2.5 px-3 text-center">Trạng Thái</th>
                    <th className="py-2.5 px-4">Ghi Chú & Khắc Phục</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F1F1F]">
                  {filteredDiscrepancies.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-[#888888]">
                        Không có dữ liệu trong bộ lọc này.
                      </td>
                    </tr>
                  ) : (
                    filteredDiscrepancies.map((disc, idx) => {
                      const isMatch = disc.status === 'MATCH';
                      const isMissingBOQ = disc.status === 'MISSING_IN_BOQ';
                      const isMissingDrawing = disc.status === 'MISSING_IN_DRAWING';
                      const isDiscrepancy = disc.status === 'DISCREPANCY' || disc.status === 'CONFIG_MISMATCH';

                      return (
                        <tr
                          key={disc.id || idx}
                          className={`hover:bg-[#151515] transition ${
                            !isMatch ? 'bg-amber-950/10' : ''
                          }`}
                        >
                          <td className="py-3 px-4 font-medium text-[#F2F2F2]">
                            {disc.item}
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#181818] text-[#999999] border border-[#2C2C2C]">
                              {disc.category}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-[#00A3FF] font-semibold">
                            {disc.drawingQuantity}
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-emerald-400 font-semibold">
                            {disc.boqQuantity}
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-purple-400 font-semibold">
                            {disc.configQuantity}
                          </td>
                          <td className="py-3 px-3 text-center text-[#888888] font-mono">
                            {disc.unit || 'Bộ'}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                                isMatch
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : isMissingBOQ
                                  ? 'bg-red-500/20 text-red-300 border-red-500/40'
                                  : isMissingDrawing
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                              }`}
                            >
                              {isMatch
                                ? 'KHỚP 100%'
                                : isMissingBOQ
                                ? 'THIẾU TRONG BOQ'
                                : isMissingDrawing
                                ? 'THIẾU BẢN VẼ'
                                : 'LỆCH SỐ LƯỢNG'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-[#AAAAAA] leading-relaxed">
                            <div>{disc.notes}</div>
                            {disc.actionRequired && (
                              <div className="text-[11px] text-emerald-400 font-sans mt-0.5">
                                ➔ {disc.actionRequired}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Critical Risks & Value Engineering Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Critical Wiring Risks */}
            <div className="bg-[#0D0D0D] border border-[#2B2B2B] p-5 space-y-3">
              <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-amber-400 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Cảnh Báo Rủi Ro Đấu Nối & Sụt Áp (Signal & Power Integrity)
              </h4>
              <div className="space-y-2.5">
                {auditReport.criticalWiringRisks?.map((risk, idx) => (
                  <div key={idx} className="bg-[#141414] p-3.5 border border-[#262626] text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#EEEEEE]">{risk.title}</span>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          risk.severity === 'Critical'
                            ? 'bg-red-500/20 text-red-400'
                            : risk.severity === 'High'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {risk.severity}
                      </span>
                    </div>
                    <p className="text-[#999999] text-[11px] leading-relaxed">{risk.description}</p>
                    <div className="text-[11px] text-emerald-400 font-sans pt-1 flex items-start gap-1">
                      <ArrowRight className="w-3 h-3 shrink-0 mt-0.5" />
                      <span>Biện pháp khắc phục: {risk.fix}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Value Engineering & T&C Steps */}
            <div className="bg-[#0D0D0D] border border-[#2B2B2B] p-5 space-y-3">
              <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-purple-400 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Đề Xuất Value Engineering (VE) & Tối Ưu Chi Phí
              </h4>
              <div className="space-y-2.5">
                {auditReport.valueEngineering?.map((ve, idx) => (
                  <div key={idx} className="bg-[#141414] p-3.5 border border-[#262626] text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#EEEEEE]">{ve.title}</span>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                        {ve.potentialSavings}
                      </span>
                    </div>
                    <p className="text-[#999999] text-[11px] leading-relaxed">{ve.impact}</p>
                    <p className="text-purple-300 text-[11px]">➔ {ve.recommendation}</p>
                  </div>
                ))}
              </div>

              {/* Commissioning Checklist */}
              {auditReport.commissioningChecklist && auditReport.commissioningChecklist.length > 0 && (
                <div className="pt-3 border-t border-[#222222] space-y-2">
                  <h5 className="text-[11px] uppercase font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" />
                    Checklist Nghiệm Thu & Chạy Thử Thực Địa (T&C):
                  </h5>
                  <div className="space-y-1 text-[11px] text-[#CCCCCC] font-sans">
                    {auditReport.commissioningChecklist.map((step, idx) => (
                      <div key={idx} className="bg-[#161616] p-2 border border-[#282828] flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive AI Senior Engineer Terminal */}
      <div className="bg-[#0A0A0A] border border-[#333333] shadow-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <div>
              <h3 className="text-sm font-semibold text-[#F2F2F2] font-sans">
                Trợ Lý Kỹ Sư Trưởng AI (Interactive MEP Lighting Specialist)
              </h3>
              <p className="text-xs text-[#888888] font-sans">
                Hỏi trực tiếp về bản vẽ sơ đồ nguyên lý tải lên ({drawingFile?.name || 'Sơ đồ mẫu'}) và đối chiếu bảng dự toán BOQ ({boqFile?.name || 'BOQ mẫu'}).
              </p>
            </div>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono uppercase text-[#777777] flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            Gợi ý nhanh:
          </span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={isChatSending}
              className="text-[11px] bg-[#161616] hover:bg-[#222222] text-[#CCCCCC] hover:text-white px-2.5 py-1 border border-[#333333] transition-colors rounded-sm text-left"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat History Box */}
        <div className="bg-[#121212] border border-[#242424] p-4 h-72 overflow-y-auto space-y-3 font-sans text-xs">
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono text-[#666666]">
                <span>{msg.role === 'user' ? 'Kỹ Sư Thiết Kế' : 'Kỹ Sư Trưởng AI'}</span>
                <span>•</span>
                <span>{msg.time}</span>
              </div>
              <div
                className={`p-3 max-w-[85%] rounded-sm leading-relaxed whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-[#00A3FF]/20 text-[#E0F2FE] border border-[#00A3FF]/40'
                    : 'bg-[#1A1A1A] text-[#D4D4D4] border border-[#333333]'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isChatSending && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono italic">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Kỹ sư AI đang phân tích dữ liệu bản vẽ & BOQ để soạn phản hồi...</span>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Chat Input Field */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Hỏi Kỹ sư trưởng AI về sơ đồ nguyên lý, BMS, sụt áp, đấu nối DMX/DALI..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isChatSending}
            className="flex-1 bg-[#141414] text-[#E0E0E0] text-xs font-sans px-3.5 py-2.5 border border-[#333333] focus:outline-none focus:border-emerald-400"
          />
          <button
            type="submit"
            disabled={isChatSending || !inputMessage.trim()}
            className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 font-sans transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Gửi</span>
          </button>
        </form>
      </div>

      {/* Modal: Zoom High-Res Drawing Preview */}
      {previewDrawingModal && drawingFile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101010] border border-[#333333] w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl rounded overflow-hidden">
            <div className="p-4 bg-[#181818] border-b border-[#2A2A2A] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-[#F2F2F2] font-mono">
                  Xem Bản Vẽ Sơ Đồ Nguyên Lý: {drawingFile.name}
                </span>
              </div>
              <button
                onClick={() => setPreviewDrawingModal(false)}
                className="p-1 text-[#888888] hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto bg-[#070A0E] flex items-center justify-center min-h-[400px]">
              {drawingFile.previewUrl ? (
                <img
                  src={drawingFile.previewUrl}
                  alt="Full Drawing"
                  className="max-w-full max-h-[70vh] object-contain border border-[#222222] shadow-lg"
                />
              ) : (
                <pre className="text-xs font-mono text-[#D4D4D4] whitespace-pre-wrap max-h-[60vh] overflow-auto p-4 bg-[#141414]">
                  {drawingFile.textContent}
                </pre>
              )}
            </div>
            <div className="p-3 bg-[#141414] border-t border-[#2A2A2A] flex items-center justify-between text-xs font-mono text-[#888888]">
              <span>Kích thước: {(drawingFile.size / 1024).toFixed(1)} KB</span>
              <button
                onClick={() => setPreviewDrawingModal(false)}
                className="px-3 py-1 bg-white text-black font-bold uppercase text-[11px]"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: View Parsed BOQ Items */}
      {showParsedBOQModal && boqFile && boqFile.parsedRows && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101010] border border-[#333333] w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl rounded overflow-hidden">
            <div className="p-4 bg-[#181818] border-b border-[#2A2A2A] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#00A3FF]" />
                <span className="text-xs font-bold text-[#F2F2F2] font-mono">
                  Bảng Dữ Liệu BOQ Tải Lên: {boqFile.name} ({boqFile.parsedRows.length} dòng)
                </span>
              </div>
              <button
                onClick={() => setShowParsedBOQModal(false)}
                className="p-1 text-[#888888] hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto bg-[#0A0A0A]">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#141414] text-[#888888] font-mono text-[10px] uppercase border-b border-[#2B2B2B]">
                  <tr>
                    {boqFile.headers?.map((h, i) => (
                      <th key={i} className="py-2 px-3 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F1F1F]">
                  {boqFile.parsedRows.slice(0, 50).map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#161616]">
                      {boqFile.headers?.map((h, colIdx) => (
                        <td key={colIdx} className="py-2 px-3 text-[#D4D4D4]">
                          {String(row[h] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-[#141414] border-t border-[#2A2A2A] flex items-center justify-between text-xs font-mono text-[#888888]">
              <span>Tổng số: {boqFile.parsedRows.length} hạng mục</span>
              <button
                onClick={() => setShowParsedBOQModal(false)}
                className="px-3 py-1 bg-white text-black font-bold uppercase text-[11px]"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
