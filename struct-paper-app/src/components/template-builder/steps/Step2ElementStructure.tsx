'use client';

import React, { useState } from 'react';
import {
  SemanticElement,
  LayoutZoneConfig,
  ElementType,
} from '@/types/template-builder';
import {
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Type,
  Users,
  Grid,
  BoxSelect,
  Tag,
  Heading,
  Baseline,
  Sparkles,
  Image,
  Table,
  UserCheck,
  BookOpen,
  FileQuestion,
  Layers,
  ArrowRight,
  ArrowLeft,
  Inbox,
  X,
  Sigma,
  Code2,
  Link2,
} from 'lucide-react';
import { toast } from '@/components/DynamicIslandToast';
import { Select } from '@/components/ui/Select';
import { flattenAllZones } from '../nested-zones';

interface Step2ElementStructureProps {
  elements: SemanticElement[];
  zones: LayoutZoneConfig[];
  selectedElementId: string | null;
  onSelectElement: (id: string) => void;
  onElementsChange: (elements: SemanticElement[]) => void;
  onNavigateToStyling: (elementId: string) => void;
  onNavigateToBack?: () => void;
  onNavigateForward?: () => void;
}

const ELEMENT_TYPE_METAS: {
  type: ElementType;
  label: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}[] = [
    {
      type: 'article-title',
      label: 'Tiêu đề bài báo',
      category: 'Đầu bài',
      icon: Type,
      description: 'Tiêu đề chính kèm tiêu đề song ngữ tiếng Anh phụ',
    },
    {
      type: 'author-block',
      label: 'Khối Tác giả & Đơn vị',
      category: 'Đầu bài',
      icon: Users,
      description: 'Tên tác giả, chỉ số đơn vị công tác, tác giả liên hệ, ORCID',
    },
    {
      type: 'metadata-grid',
      label: 'Lịch sử nộp bài & DOI',
      category: 'Thông tin',
      icon: Grid,
      description: 'Ngày nhận, ngày duyệt, DOI, bản quyền, mã bài báo',
    },
    {
      type: 'abstract-box',
      label: 'Khối Tóm tắt (Abstract)',
      category: 'Đầu bài',
      icon: BoxSelect,
      description: 'Khung tóm tắt có viền nhấn, nền màu, hỗ trợ song ngữ',
    },
    {
      type: 'keywords-group',
      label: 'Từ khoá nghiên cứu',
      category: 'Đầu bài',
      icon: Tag,
      description: 'Danh sách từ khoá với dấu phân cách hoặc thẻ badge',
    },
    {
      type: 'heading',
      label: 'Tiêu đề Mục (Heading)',
      category: 'Thân bài',
      icon: Heading,
      description: 'Heading cấp 1, 2, 3 với số La Mã I, II hoặc số Ả Rập',
    },
    {
      type: 'body-text',
      label: 'Đoạn văn Thân bài',
      category: 'Thân bài',
      icon: Baseline,
      description: 'Văn bản nội dung có hỗ trợ chữ cái to đầu dòng (Drop Cap)',
    },
    {
      type: 'callout-box',
      label: 'Hộp Điểm nhấn (Highlights)',
      category: 'Đặc biệt',
      icon: Sparkles,
      description: 'Hộp đóng khung chứa điểm nhấn nghiên cứu, lưu ý biên tập',
    },
    {
      type: 'figure-box',
      label: 'Chú thích & Khung Hình ảnh (Figure)',
      category: 'Minh hoạ',
      icon: Image,
      description: 'Quy chuẩn hình vẽ, biểu đồ vector, 2 hình con (a & b) và tiền tố Hình / Fig.',
    },
    {
      type: 'table-box',
      label: 'Định dạng Bảng biểu (Table)',
      category: 'Minh hoạ',
      icon: Table,
      description: 'Chuẩn bảng Booktabs khoa học (3 đường kẻ), kẻ sọc zebra, chú thích trên bảng',
    },
    {
      type: 'equation-box',
      label: 'Công thức Toán học (Equation)',
      category: 'Minh hoạ',
      icon: Sigma,
      description: 'Công thức toán học có đánh số (1), căn giữa chuẩn LaTeX/MathML',
    },
    {
      type: 'code-algorithm',
      label: 'Thuật toán & Mã nguồn (Algorithm)',
      category: 'Minh hoạ',
      icon: Code2,
      description: 'Khối mã nguồn hoặc mã giả thuật toán có đánh số dòng và 3 đường kẻ chuẩn xuất bản',
    },
    {
      type: 'link-box',
      label: 'Liên kết DOI & Dữ liệu mở (Link)',
      category: 'Thông tin',
      icon: Link2,
      description: 'Mã định danh DOI, kho lưu trữ GitHub, URL kèm mã QR Code cho bản in',
    },
    {
      type: 'biography-box',
      label: 'Tiểu sử Tác giả (Bio)',
      category: 'Cuối bài',
      icon: UserCheck,
      description: 'Khung tóm tắt học hàm, học vị và ảnh chân dung tác giả',
    },
    {
      type: 'references-block',
      label: 'Tài liệu Tham khảo',
      category: 'Cuối bài',
      icon: BookOpen,
      description: 'Chuẩn Vancouver [1], IEEE, APA 7th, Harvard',
    },
    {
      type: 'custom-field',
      label: 'Trường Tự do (Custom Field)',
      category: 'Tự do',
      icon: FileQuestion,
      description: 'Lời cảm ơn, nguồn tài trợ, tuyên bố đạo đức, mã nguồn Git',
    },
  ];

export const Step2ElementStructure: React.FC<Step2ElementStructureProps> = ({
  elements,
  zones,
  selectedElementId,
  onSelectElement,
  onElementsChange,
  onNavigateToStyling,
  onNavigateToBack,
  onNavigateForward,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [targetZoneForAdd, setTargetZoneForAdd] = useState<string>(
    zones[0]?.id || ''
  );

  const flattened = flattenAllZones(zones);
  const activeZoneIds = new Set(flattened.map((f) => f.zone.id));
  const unassignedElements = elements
    .filter((e) => !e.zoneId || !activeZoneIds.has(e.zoneId))
    .sort((a, b) => a.order - b.order);

  const rowZoneOptions = [
    {
      value: '',
      label: '⚡ Chưa gán phân vùng',
    },
    ...flattened.map((f) => ({
      value: f.zone.id,
      label: f.displayName,
    })),
  ];

  // Add new element
  const handleAddNewElement = (type: ElementType) => {
    const meta = ELEMENT_TYPE_METAS.find((m) => m.type === type);
    const chosenZoneId = targetZoneForAdd; // Keeps '' when unassigned!
    const newElement: SemanticElement = {
      id: `elem_${type}_${Date.now()}`,
      type,
      name: meta?.label || 'Thành phần mới',
      zoneId: chosenZoneId,
      order: elements.length + 1,
      spanColumns: false,
      visible: true,
      styling: {
        fontFamily: 'Arial',
        fontSize: type === 'article-title' ? 18 : 10,
        fontWeight: type === 'heading' || type === 'article-title' ? 'bold' : 'normal',
        fontStyle: 'normal',
        textColor: '#1A1A1A',
        textAlign: type === 'article-title' ? 'left' : 'justify',
        lineHeight: 1.25,
        textTransform: type === 'heading' ? 'uppercase' : 'none',
        backgroundColor: type === 'callout-box' ? '#FFF7ED' : 'transparent',
        borderStyle: type === 'callout-box' ? 'all-borders' : 'none',
        borderColor: '#E2E8F0',
        borderWidth: 1,
        borderRadius: 4,
        padding: { top: 2, right: 2, bottom: 2, left: 2 },
        margin: { top: 4, bottom: 4 },
      },
      specialProps: {
        customContentSample: `Mẫu nội dung của ${meta?.label}`,
        ...(type === 'figure-box'
          ? {
              captionPrefix: 'Hình',
              captionPosition: 'below',
              captionText: 'Sơ đồ luồng xử lý và trích xuất cấu trúc văn bản học thuật',
              figureSource: 'Nguồn: Nhóm nghiên cứu (2025)',
              figureAlignment: 'center',
              figureSubfigures: false,
            }
          : {}),
        ...(type === 'table-box'
          ? {
              captionPrefix: 'Bảng',
              captionPosition: 'above',
              captionText: 'So sánh hiệu năng trích xuất và độ chính xác phân vùng',
              tableBorderMode: 'booktabs',
              zebraStriping: false,
              tableFootnote: '* Ghi chú: Thử nghiệm thực hiện trên 100 văn bản mẫu.',
            }
          : {}),
        ...(type === 'equation-box'
          ? {
              equationNumber: '(1)',
              equationLatex: '\\mathcal{L}_{total} = \\alpha \\mathcal{L}_{struct} + \\beta \\mathcal{L}_{sem} + \\gamma \\|W\\|_2^2',
              equationAlign: 'center',
            }
          : {}),
        ...(type === 'code-algorithm'
          ? {
              algorithmTitle: 'Thuật toán 1: Phân tách phân vùng bố cục văn bản',
              codeLanguage: 'Pseudocode',
              showLineNumbers: true,
              algorithmInputs: 'Tài liệu DOCX đầu vào D',
              algorithmOutputs: 'Ma trận phân vùng CSS Grid G',
            }
          : {}),
        ...(type === 'link-box'
          ? {
              linkType: 'doi',
              linkLabel: 'Mã định danh DOI',
              linkUrl: 'https://doi.org/10.32508/stdj.v28i2.1234',
              linkStyle: 'pill',
              showQrCode: true,
            }
          : {}),
        ...(type === 'biography-box'
          ? {
              authorName: 'TS. Nguyễn Hoàng Nam',
              showAuthorPhoto: true,
              bioText: 'Nhận bằng Tiến sĩ Khoa học Máy tính tại ĐHQG TP.HCM. Hướng nghiên cứu chuyên sâu về bóc tách cấu trúc và hệ thống xuất bản học thuật.',
            }
          : {}),
      },
    };

    onElementsChange([...elements, newElement]);
    setShowAddModal(false);
    onSelectElement(newElement.id);
    const assignedZone = zones.find((z) => z.id === chosenZoneId);
    toast.success(
      'Thêm thành phần',
      assignedZone
        ? `Đã thêm khối "${meta?.label || 'mới'}" vào ${assignedZone.name}!`
        : `Đã thêm khối "${meta?.label || 'mới'}" (Chưa gán phân vùng)!`
    );
  };

  // Duplicate an element
  const handleDuplicate = (el: SemanticElement) => {
    const duplicated: SemanticElement = {
      ...JSON.parse(JSON.stringify(el)),
      id: `elem_${el.type}_${Date.now()}`,
      name: `${el.name} (Bản sao)`,
      order: el.order + 1,
    };
    onElementsChange([...elements, duplicated]);
    toast.success('Nhân bản', `Đã nhân bản "${el.name}"`);
  };

  // Delete an element
  const handleDelete = (id: string) => {
    onElementsChange(elements.filter((e) => e.id !== id));
    toast.success('Đã xóa khối thành phần');
  };

  // Move element up/down in same zone or within unassigned group
  const handleMove = (id: string, direction: 'up' | 'down') => {
    const el = elements.find((e) => e.id === id);
    if (!el) return;

    const isUnassigned = !el.zoneId || !activeZoneIds.has(el.zoneId);
    const peerElements = isUnassigned
      ? elements.filter((e) => !e.zoneId || !activeZoneIds.has(e.zoneId)).sort((a, b) => a.order - b.order)
      : elements.filter((e) => e.zoneId === el.zoneId).sort((a, b) => a.order - b.order);

    const currIdx = peerElements.findIndex((e) => e.id === id);
    const targetIdx = direction === 'up' ? currIdx - 1 : currIdx + 1;

    if (targetIdx < 0 || targetIdx >= peerElements.length) return;

    const temp = peerElements[currIdx];
    peerElements[currIdx] = peerElements[targetIdx];
    peerElements[targetIdx] = temp;

    peerElements.forEach((item, i) => (item.order = i + 1));

    const otherEls = elements.filter((e) =>
      isUnassigned
        ? (e.zoneId && activeZoneIds.has(e.zoneId))
        : e.zoneId !== el.zoneId
    );
    onElementsChange([...otherEls, ...peerElements]);
  };

  // Update element field
  const handleUpdateElement = (id: string, updated: Partial<SemanticElement>) => {
    onElementsChange(
      elements.map((e) => (e.id === id ? { ...e, ...updated } : e))
    );
  };

  const renderElementItem = (
    el: SemanticElement,
    elIdx: number,
    groupLength: number,
    isUnassigned = false
  ) => {
    const meta = ELEMENT_TYPE_METAS.find((m) => m.type === el.type);
    const Icon = meta?.icon || Type;
    const isSelected = selectedElementId === el.id;

    return (
      <div
        key={el.id}
        className={`p-3.5 rounded-3xl transition-all flex flex-col gap-2.5 relative focus-within:z-30 shadow-[0_0_10px_rgba(0,0,0,0.03)] ${isSelected
          ? 'border-2 border-[#78C841] bg-white ring-2 ring-[#78C841]/20'
          : isUnassigned
            ? 'border border-amber-200/80 bg-white hover:bg-white'
            : 'border border-zinc-200/60 bg-white hover:bg-white hover:border-zinc-300'
          }`}
      >
        {/* Row 1: Left: Icon, Name input, Type Badge, Staging Badge. Right: Move, Copy, Eye, Delete, Định dạng */}
        <div className="flex items-center justify-between gap-2.5 flex-wrap">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-xl bg-zinc-100 border border-zinc-200/80 flex items-center justify-center text-zinc-700 shrink-0 shadow-2xs">
              <Icon className="w-4 h-4" />
            </div>

            <div className="min-w-0 flex-1 flex items-center gap-2 flex-wrap">
              <input
                type="text"
                value={el.name}
                onChange={(e) =>
                  handleUpdateElement(el.id, { name: e.target.value })
                }
                className="text-xs font-extrabold text-zinc-900 bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-[#78C841] outline-none truncate max-w-[200px] min-w-[100px]"
              />
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-200/80 text-zinc-700 font-mono font-bold shrink-0">
                {el.type}
              </span>
              {isUnassigned && (
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200 shrink-0">
                  Chờ phân vùng
                </span>
              )}
            </div>
          </div>

          {/* Action button cluster */}
          <div className="flex items-center gap-1 shrink-0 ml-auto">
            {/* Reorder buttons */}
            <button
              type="button"
              onClick={() => handleMove(el.id, 'up')}
              disabled={elIdx === 0}
              className="p-1.5 rounded-xl hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 disabled:opacity-30 cursor-pointer transition-colors"
              title="Lên trên"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleMove(el.id, 'down')}
              disabled={elIdx === groupLength - 1}
              className="p-1.5 rounded-xl hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 disabled:opacity-30 cursor-pointer transition-colors"
              title="Xuống dưới"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {/* Duplicate */}
            <button
              type="button"
              onClick={() => handleDuplicate(el)}
              className="p-1.5 rounded-xl hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 cursor-pointer transition-colors"
              title="Nhân bản khối này"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            {/* Visibility toggle (Eye) - styled identically to trash, next to trash */}
            <button
              type="button"
              onClick={() =>
                handleUpdateElement(el.id, { visible: !el.visible })
              }
              className={`p-1.5 rounded-xl hover:bg-zinc-100 cursor-pointer transition-colors ${
                el.visible
                  ? 'text-zinc-500 hover:text-zinc-900'
                  : 'text-zinc-400 hover:text-zinc-600'
              }`}
              title={el.visible ? 'Đang hiển thị (Click để ẩn)' : 'Đang ẩn (Click để hiện)'}
            >
              {el.visible ? (
                <Eye className="w-3.5 h-3.5" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-zinc-400" />
              )}
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={() => handleDelete(el.id)}
              className="p-1.5 rounded-xl hover:bg-red-50 text-zinc-400 hover:text-red-600 cursor-pointer transition-colors"
              title="Xóa khối này"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Jump to Styling */}
            <button
              type="button"
              onClick={() => {
                onSelectElement(el.id);
                onNavigateToStyling(el.id);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-400/80 hover:bg-[#68af38] text-white text-xs font-extrabold shadow-sm transition-all hover:scale-102 active:scale-98 cursor-pointer ml-1"
              title="Chỉnh font chữ, màu sắc, viền ở Bước 3"
            >
              <span>Định dạng</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Row 2: Description on left, Zone Selector and Span Columns on right */}
        <div className="flex items-center justify-between gap-2.5 pt-2 border-t border-zinc-100 flex-wrap">
          <div className="text-[11px] text-zinc-500 truncate min-w-0 flex-1">
            {meta?.description}
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {/* Zone reassign dropdown */}
            <div className="w-40 min-w-[140px]">
              <Select
                value={el.zoneId && activeZoneIds.has(el.zoneId) ? el.zoneId : ''}
                onChange={(val) => {
                  handleUpdateElement(el.id, { zoneId: val });
                  const targetZone = zones.find((z) => z.id === val);
                  toast.success(
                    'Cập nhật phân vùng',
                    targetZone
                      ? `Đã chuyển "${el.name}" vào ${targetZone.name}`
                      : `Đã đưa "${el.name}" về danh sách chưa gán`
                  );
                }}
                variant="flat-white"
                size="xs"
                align="right"
                options={rowZoneOptions}
              />
            </div>

            {/* Span columns toggle */}
            <button
              type="button"
              disabled={isUnassigned}
              onClick={() =>
                handleUpdateElement(el.id, {
                  spanColumns: !el.spanColumns,
                })
              }
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${el.spanColumns
                ? 'bg-purple-100 text-purple-700 border-purple-200'
                : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                } ${isUnassigned ? 'opacity-40 cursor-not-allowed' : ''}`}
              title="Tràn toàn bộ cột trong phân vùng (Span all columns)"
            >
              {el.spanColumns ? 'Tràn cột' : 'Theo cột'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Add Button */}
      <div className="relative z-30 focus-within:z-40 p-2 pb-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-zinc-700" />
            <h3 className="font-extrabold text-sm sm:text-base text-zinc-900">
              Bước 3: Cấu trúc Thành phần ({elements.length})
            </h3>
          </div>

          <button
            type="button"
            onClick={() => {
              setTargetZoneForAdd(zones[0]?.id || '');
              setShowAddModal(true);
            }}
            className="btn-pill-lime text-xs py-1.5 px-3.5 flex items-center gap-1.5 shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm khối thành phần mới</span>
          </button>
        </div>
      </div>

      {/* 0. Khối Chưa Gán Phân Vùng (Staging / Buffer Area) */}
      <div className="relative z-20 focus-within:z-40 bg-gray-200/50 rounded-[32px] p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-amber-100">
          <div className="flex items-center gap-2">
            <Inbox className="w-4 h-4 text-amber-600" />
            <h3 className="font-extrabold text-xs sm:text-sm text-zinc-900 uppercase tracking-tight">
              Khối Chưa Gán Phân Vùng (Chờ Sắp Xếp)
            </h3>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${unassignedElements.length > 0
                ? 'bg-amber-100 text-amber-800'
                : 'bg-zinc-100 text-zinc-500'
                }`}
            >
              {unassignedElements.length} thành phần
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setTargetZoneForAdd('');
              setShowAddModal(true);
            }}
            className="text-xs text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1.5 cursor-pointer bg-amber-100/70 hover:bg-amber-200/70 px-3 py-1.5 rounded-xl border border-amber-200/80 transition-all shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm khối tự do</span>
          </button>
        </div>

        {unassignedElements.length === 0 ? (
          <div className="py-4 px-4 text-center text-xs text-amber-700/70 bg-amber-50/40 border border-dashed border-amber-200/70 rounded-2xl">
            Tất cả khối thành phần hiện đã được xếp vào các phân vùng bố cục bên dưới. Bạn có thể nhấn &quot;+ Thêm khối tự do&quot; để tạo khối chờ chưa thuộc phân vùng nào. Khi bạn xóa một phân vùng, các khối bên trong cũng sẽ được tự động bảo toàn tại đây.
          </div>
        ) : (
          <div className="space-y-1">
            <div className="text-[11px] text-amber-800 bg-amber-50 px-3.5 py-2 rounded-2xl border border-amber-200/60 flex items-center justify-between">
              <span>
                💡 Các khối này chưa thuộc phân vùng nào. Bạn có thể bấm &quot;Định dạng&quot; hoặc chọn menu phân vùng bên phải để đưa vào bố cục bất cứ lúc nào.
              </span>
            </div>
            {unassignedElements.map((el, elIdx) =>
              renderElementItem(el, elIdx, unassignedElements.length, true)
            )}
          </div>
        )}
      </div>

      {/* Elements grouped by Zones */}
      <div className="space-y-2">
        {zones.map((zone) => {
          const zoneElements = elements
            .filter((e) => e.zoneId === zone.id)
            .sort((a, b) => a.order - b.order);

          return (
            <div
              key={zone.id}
              className="relative z-20 focus-within:z-40 bg-white rounded-[32px] p-5 shadow-[0_0_16px_rgba(0,0,0,0.06),0_0_4px_rgba(0,0,0,0.03)] space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60">
                <div className="flex items-center gap-2">
                  <BoxSelect className="w-4 h-4 text-zinc-700" />
                  <h3 className="font-extrabold text-xs sm:text-sm text-zinc-900 uppercase tracking-tight">
                    {zone.name}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-mono font-bold">
                    {zone.type} ({zoneElements.length})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setTargetZoneForAdd(zone.id);
                    setShowAddModal(true);
                  }}
                  className="btn-pill-subtle text-xs py-1 px-2.5 flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm vào phân vùng</span>
                </button>
              </div>

              {zoneElements.length === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 rounded-2xl">
                  Chưa có thành phần nào trong phân vùng này. Nhấn &quot;+ Thêm&quot; để đưa khối vào.
                </div>
              ) : (
                <div className="space-y-1">
                  {zoneElements.map((el, elIdx) =>
                    renderElementItem(el, elIdx, zoneElements.length, false)
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Add New Element */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FBFBFC] rounded-[32px] max-w-2xl w-full shadow-2xl border border-[#E2E4E9] overflow-hidden flex flex-col max-h-[88vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gray-200/50 rounded-b-[24px] flex items-center justify-between shadow-2xs flex-shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-zinc-700" />
                <h3 className="font-extrabold text-sm sm:text-base text-zinc-900 tracking-tight">
                  Thêm Khối Thành Phần Mới
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-600 hover:text-zinc-900 flex items-center justify-center transition-colors cursor-pointer"
                title="Đóng (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              {/* Target zone picker */}
              <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-zinc-200/80 shadow-2xs">
                <span className="text-xs font-extrabold text-zinc-700 shrink-0">
                  Thêm vào phân vùng:
                </span>
                <div className="flex-1">
                  <Select
                    value={targetZoneForAdd}
                    onChange={(val) => setTargetZoneForAdd(val)}
                    variant="clean"
                    size="sm"
                    options={[
                      {
                        value: '',
                        label: '⚡ Chưa gán phân vùng (Lưu trữ / Chờ bố cục sau)',
                        description: 'Khối tự do, có thể xếp vào bất kỳ phân vùng nào sau này',
                      },
                      ...zones.map((z) => ({
                        value: z.id,
                        label: `${z.name} (${z.type})`,
                      })),
                    ]}
                  />
                </div>
              </div>

              {/* Grid of Element Types */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {ELEMENT_TYPE_METAS.map((meta) => {
                  const Icon = meta.icon;
                  return (
                    <button
                      key={meta.type}
                      onClick={() => handleAddNewElement(meta.type)}
                      className="flex items-start gap-3 p-3.5 rounded-2xl border border-zinc-200/80 bg-white hover:border-[#78C841] hover:bg-[#D9F99D]/10 text-left transition-all group shadow-2xs hover:shadow-xs cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 group-hover:bg-[#78C841] group-hover:text-white flex items-center justify-center text-zinc-700 shrink-0 transition-colors shadow-2xs">
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <div className="text-xs font-extrabold text-zinc-900 group-hover:text-zinc-950">
                            {meta.label}
                          </div>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-bold group-hover:bg-white shrink-0">
                            {meta.category}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-500 leading-snug mt-1">
                          {meta.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
