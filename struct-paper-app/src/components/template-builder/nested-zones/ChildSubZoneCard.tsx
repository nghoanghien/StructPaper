'use client';

import React, { useState, useEffect } from 'react';
import { LayoutZoneConfig } from '@/types/template-builder';
import { X, Layers, Edit2 } from 'lucide-react';

interface ChildSubZoneCardProps {
  subZone: LayoutZoneConfig;
  index: number;
  isSelected: boolean;
  isMoving?: boolean;
  isResizing?: boolean;
  maxCols: number;
  onSelect: (id: string) => void;
  onDrillDown?: (id: string) => void;
  onDelete?: (id: string) => void;
  onUpdateSubZone?: (id: string, updated: Partial<LayoutZoneConfig>) => void;
  onStartMove?: (id: string, e: React.MouseEvent) => void;
  onStartResize?: (id: string, handle: 'se' | 'nw', e: React.MouseEvent) => void;
}

export const ChildSubZoneCard: React.FC<ChildSubZoneCardProps> = ({
  subZone,
  index,
  isSelected,
  isMoving = false,
  isResizing = false,
  onSelect,
  onDrillDown,
  onDelete,
  onUpdateSubZone,
  onStartMove,
  onStartResize,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(subZone.name);

  useEffect(() => {
    setTempName(subZone.name);
  }, [subZone.name]);

  const handleFinishEditing = () => {
    setIsEditing(false);
    const trimmed = tempName.trim();
    if (trimmed && trimmed !== subZone.name) {
      onUpdateSubZone?.(subZone.id, { name: trimmed });
    } else {
      setTempName(subZone.name);
    }
  };

  const area = subZone.gridArea || {
    rowStart: 1,
    colStart: index + 1,
    rowSpan: 1,
    colSpan: 1,
  };

  return (
    <div
      onMouseDown={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest('button, input, [data-sub-resize]')) return;
        e.stopPropagation();
        onStartMove?.(subZone.id, e);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(subZone.id);
      }}
      style={{
        gridRow: `${area.rowStart} / span ${area.rowSpan}`,
        gridColumn: `${area.colStart} / span ${area.colSpan}`,
      }}
      className={`group/subcard relative rounded-xl border-2 transition-all flex flex-col justify-between p-1.5 select-none ${
        isMoving || isResizing
          ? 'border-dashed border-[#78C841] bg-[#78C841]/20 opacity-40 scale-[0.98]'
          : isSelected
            ? 'border-[#78C841] bg-white ring-2 ring-[#78C841]/50 shadow-md z-20 cursor-grab active:cursor-grabbing'
            : 'border-[#78C841]/70 bg-white/95 hover:bg-white shadow-2xs hover:border-[#78C841] cursor-grab active:cursor-grabbing'
      }`}
      title={`Vùng con "${subZone.name}" (C${area.colStart}..${area.colStart + area.colSpan - 1} × R${area.rowStart}..${area.rowStart + area.rowSpan - 1}). Nhấp đúp tên để đổi tên, kéo góc để co giãn ô`}
    >
      {/* 1. TOP-LEFT Corner Resize Handle (nw) */}
      <div
        data-sub-resize="nw"
        onMouseDown={(e) => {
          e.stopPropagation();
          onStartResize?.(subZone.id, 'nw', e);
        }}
        className="absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded bg-white/90 border border-zinc-300 text-zinc-600 hover:text-[#78C841] hover:border-[#78C841] cursor-nw-resize shadow-2xs hover:scale-110 active:scale-95 transition-transform flex items-center justify-center z-30 pointer-events-auto"
        title="Kéo góc trên-trái để co giãn vùng con"
      >
        <div className="w-2 h-2 border-l-2 border-t-2 border-current rounded-tl-[1px]" />
      </div>

      {/* Header: Index pill, name (editable), drill-down, delete */}
      <div className="flex items-center justify-between gap-1 pl-3.5">
        <div className="flex items-center gap-1 min-w-0">
          <span className="w-3.5 h-3.5 rounded bg-zinc-900 text-white flex items-center justify-center text-[7.5px] font-mono font-bold shrink-0">
            {index + 1}
          </span>

          {isEditing ? (
            <input
              type="text"
              autoFocus
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={handleFinishEditing}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFinishEditing();
                if (e.key === 'Escape') {
                  setTempName(subZone.name);
                  setIsEditing(false);
                }
              }}
              className="text-[8.5px] font-extrabold text-[#14532D] bg-emerald-50 border border-[#78C841] rounded px-1 py-0.2 outline-none w-20"
            />
          ) : (
            <span
              onDoubleClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="text-[8.5px] font-extrabold text-[#14532D] truncate max-w-[85px] cursor-text hover:underline"
              title="Nhấp đúp để đổi tên phân vùng con"
            >
              {subZone.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="p-0.5 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 cursor-pointer opacity-0 group-hover/subcard:opacity-100 transition-opacity"
            title="Đổi tên"
          >
            <Edit2 className="w-2.5 h-2.5" />
          </button>
          {onDrillDown && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDrillDown(subZone.id);
              }}
              className="p-0.5 rounded hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 cursor-pointer"
              title="Chia ô tiếp bên trong (Cấp L3)"
            >
              <Layers className="w-2.5 h-2.5 text-[#78C841]" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(subZone.id);
              }}
              className="p-0.5 rounded hover:bg-red-50 text-zinc-400 hover:text-red-500 cursor-pointer"
              title="Xóa vùng con này"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>

      {/* Footer: Coordinate tag & L3 depth info */}
      <div className="flex items-center justify-between text-[7px] font-mono font-bold text-zinc-600 mt-1 pr-3.5">
        <span className="bg-zinc-100 px-1 py-0.2 rounded">
          {area.colSpan}c×{area.rowSpan}r
        </span>
        {subZone.subZones && subZone.subZones.length > 0 && (
          <span className="text-[#14532D] bg-emerald-100 px-1 py-0.2 rounded font-extrabold">
            {subZone.subZones.length} L3
          </span>
        )}
      </div>

      {/* 2. BOTTOM-RIGHT Corner Resize Handle (se) */}
      <div
        data-sub-resize="se"
        onMouseDown={(e) => {
          e.stopPropagation();
          onStartResize?.(subZone.id, 'se', e);
        }}
        className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded bg-white/90 border border-zinc-300 text-zinc-600 hover:text-[#78C841] hover:border-[#78C841] cursor-se-resize shadow-2xs hover:scale-110 active:scale-95 transition-transform flex items-center justify-center z-30 pointer-events-auto"
        title="Kéo góc dưới-phải để co giãn vùng con"
      >
        <div className="w-2 h-2 border-r-2 border-b-2 border-current rounded-br-[1px]" />
      </div>
    </div>
  );
};
