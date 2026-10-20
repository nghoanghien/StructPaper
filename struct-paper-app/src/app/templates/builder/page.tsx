'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TemplateBuilderView from '@/components/template-builder/TemplateBuilderView';
import {
  UNIVERSAL_PRESETS,
  CUSTOM_BLANK_CANVAS,
  VNUHCM_HEALTH_SCIENCES_MASTER,
} from '@/lib/template-builder/universal-presets';
import { UniversalTemplateSchema } from '@/types/template-builder';

function BuilderContent() {
  const searchParams = useSearchParams();
  const presetKey = searchParams.get('preset');

  const initialSchema: UniversalTemplateSchema = React.useMemo(() => {
    if (presetKey === 'blank' || presetKey === 'custom_blank_canvas') {
      return JSON.parse(JSON.stringify(CUSTOM_BLANK_CANVAS));
    }
    if (presetKey) {
      const found = UNIVERSAL_PRESETS.find((p) => p.id === presetKey);
      if (found) return JSON.parse(JSON.stringify(found));

      // Check localStorage for custom user templates
      if (typeof window !== 'undefined') {
        try {
          const savedStr = localStorage.getItem('structpaper_custom_templates_list');
          if (savedStr) {
            const list: UniversalTemplateSchema[] = JSON.parse(savedStr);
            const custom = list.find((item) => item.id === presetKey);
            if (custom) return JSON.parse(JSON.stringify(custom));
          }
        } catch {}
      }
    }
    return JSON.parse(JSON.stringify(VNUHCM_HEALTH_SCIENCES_MASTER));
  }, [presetKey]);

  const pageParam = searchParams.get('page');
  const initialPage = pageParam && !isNaN(Number(pageParam)) ? Number(pageParam) : 1;

  return <TemplateBuilderView initialSchema={initialSchema} initialPage={initialPage} />;
}

export default function TemplateBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center bg-[#F8F9FA] text-xs font-semibold text-slate-500">
          Đang nạp Trình thiết kế Template StructPaper...
        </div>
      }
    >
      <BuilderContent />
    </Suspense>
  );
}
