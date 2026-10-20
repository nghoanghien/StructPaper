'use client';

import React from 'react';
import {
  SemanticElement,
  FloatingElementsDesignRules,
} from '@/types/template-builder';

interface DynamicElementRendererProps {
  element: SemanticElement;
  primaryColor: string;
  floatingRules?: FloatingElementsDesignRules;
}

/**
 * Dynamic Element Renderer for A4 Live Preview
 * Renders individual semantic elements and floating elements with high fidelity
 */
export const DynamicElementRenderer: React.FC<DynamicElementRendererProps> = ({
  element,
  primaryColor,
  floatingRules,
}) => {
  const { type, styling, specialProps } = element;

  const citeRules = floatingRules?.citation;
  const inTextColor = citeRules?.inTextColor || primaryColor || '#2B74B7';
  const inTextWeight = citeRules?.inTextWeight === 'normal' ? 400 : 700;
  const inTextPill = citeRules?.inTextPill ?? false;

  const renderTextWithCitations = (content: string) => {
    if (!content) return null;
    const parts = content.split(/(\[\d+(?:[,\s–-]\s*\d+)*\]|[¹²³⁴⁵⁶⁷⁸⁹⁰*°]+|\([A-Za-z\s&]+,\s*\d{4}\))/g);
    if (parts.length <= 1) return content;
    return parts.map((part, i) => {
      if (/^(\[\d+(?:[,\s–-]\s*\d+)*\]|[¹²³⁴⁵⁶⁷⁸⁹⁰*°]+|\([A-Za-z\s&]+,\s*\d{4}\))$/.test(part)) {
        return (
          <span
            key={i}
            className={`font-sans ${part.startsWith('(') ? 'mx-1' : 'mx-0.5'} ${
              inTextPill ? 'bg-blue-50/80 px-1 py-0.5 rounded border border-blue-200 text-[85%]' : ''
            }`}
            style={{
              fontWeight: inTextWeight,
              color: inTextColor,
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const containerStyle: React.CSSProperties = {
    fontFamily: styling.fontFamily,
    fontSize: `${styling.fontSize}pt`,
    fontWeight:
      styling.fontWeight === 'extrabold'
        ? 800
        : styling.fontWeight === 'black'
          ? 900
          : styling.fontWeight === 'bold'
            ? 700
            : styling.fontWeight === 'semibold'
              ? 600
              : 400,
    fontStyle: styling.fontStyle,
    color: styling.textColor,
    textAlign: styling.textAlign,
    lineHeight: styling.lineHeight,
    backgroundColor:
      styling.backgroundColor === 'transparent' ? 'transparent' : styling.backgroundColor,
    borderLeft:
      styling.borderStyle === 'left-solid'
        ? `${styling.borderWidth}px solid ${styling.borderColor}`
        : styling.borderStyle === 'all-borders'
          ? `${styling.borderWidth}px solid ${styling.borderColor}`
          : 'none',
    borderTop:
      styling.borderStyle === 'all-borders' || styling.borderStyle === 'top-bottom'
        ? `${styling.borderWidth}px solid ${styling.borderColor}`
        : 'none',
    borderBottom:
      styling.borderStyle === 'all-borders' || styling.borderStyle === 'top-bottom'
        ? `${styling.borderWidth}px solid ${styling.borderColor}`
        : 'none',
    borderRight:
      styling.borderStyle === 'all-borders'
        ? `${styling.borderWidth}px solid ${styling.borderColor}`
        : 'none',
    paddingTop: specialProps.isContinuation ? 0 : `${styling.padding.top * 1.5}px`,
    paddingBottom: `${styling.padding.top * 1.5}px`,
    paddingLeft: `${(styling.padding.left || 0) * 1.5}px`,
    paddingRight: `${(styling.padding.right || 0) * 1.5}px`,
    borderRadius: `${styling.borderRadius}px`,
    marginTop: specialProps.isContinuation ? 0 : `${styling.margin.top}px`,
    marginBottom: `${styling.margin.bottom}px`,
  };

  switch (type) {
    case 'article-title':
      return (
        <div style={containerStyle}>
          <h1 className="leading-tight">
            {specialProps.customContentSample ||
              'Nghiên cứu ứng dụng bóc tách cấu trúc OpenXML và tự động dàn trang báo cáo khoa học chuẩn VNUHCM'}
          </h1>
          {specialProps.supportBilingual && (
            <div
              className="mt-1.5 italic text-slate-500 font-serif"
              style={{ fontSize: `${specialProps.bilingualFontSize || 12}pt` }}
            >
              {specialProps.bilingualLabel ||
                'Automated Academic Typesetting and Semantic OpenXML Extraction for VNUHCM Scientific Journals'}
            </div>
          )}
        </div>
      );

    case 'author-block':
      return (
        <div style={containerStyle}>
          {specialProps.customContentSample ? (
            <div className="font-semibold text-[11pt] text-[#2B74B7] leading-snug">
              {specialProps.customContentSample}
            </div>
          ) : (
            <div>
              <span className="font-semibold">Nguyễn Hoàng Nam</span>
              <sup className="text-emerald-700 font-bold ml-0.5">1*</sup>,{' '}
              <span className="font-semibold">Trần Minh Tuấn</span>
              <sup className="text-emerald-700 font-bold ml-0.5">2</sup>,{' '}
              <span className="font-semibold">Lê Thu Hương</span>
              <sup className="text-emerald-700 font-bold ml-0.5">1</sup>
            </div>
          )}
          {specialProps.showAffiliations && !specialProps.customContentSample && (
            <div className="mt-1 text-[8pt] text-slate-500 font-sans space-y-0.5">
              <div>
                <sup>1</sup> Khoa Khoa học & Kỹ thuật Máy tính, Trường Đại học Bách khoa, ĐHQG TP.HCM
              </div>
              <div>
                <sup>2</sup> Viện Khoa học Dữ liệu & Trí tuệ Nhân tạo, ĐHQG TP.HCM
              </div>
              {specialProps.showCorresponding && (
                <div>
                  <sup>*</sup> Tác giả liên hệ: nam.nh@vnuhcm.edu.vn
                </div>
              )}
            </div>
          )}
        </div>
      );

    case 'affiliation-list':
      return (
        <div style={containerStyle} className="font-serif italic text-slate-700 leading-snug">
          {specialProps.affiliations && specialProps.affiliations.length > 0 ? (
            <div className="space-y-0.5">
              {specialProps.affiliations.map((aff) => (
                <div key={aff.id} className="flex items-start gap-1">
                  {aff.index && (
                    <sup className="font-bold font-sans text-slate-500 mr-0.5">{aff.index}</sup>
                  )}
                  <span>
                    {[aff.department, aff.institution, aff.address].filter(Boolean).join(' – ')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div>
              {specialProps.affiliationText ||
                specialProps.customContentSample ||
                'Bộ môn Nội - Khoa Y – Trường Đại học Khoa học Sức khỏe - Đại học Quốc Gia Thành phố Hồ Chí Minh'}
            </div>
          )}
        </div>
      );

    case 'metadata-grid': {
      if (specialProps.metadataLayout === 'sidebar-academic') {
        const historyItems = [
          { label: 'Ngày nhận', value: specialProps.historyReceived || '14-06-2025' },
          { label: 'Ngày sửa đổi', value: specialProps.historyRevised || '10-02-2026' },
          { label: 'Ngày chấp nhận', value: specialProps.historyAccepted || '14-04-2026' },
          { label: 'Ngày đăng', value: specialProps.historyPublished || '07-05-2026' },
        ];

        return (
          <div style={containerStyle} className="space-y-1.5 font-sans text-[6.8pt] leading-tight">
            {/* Affiliation in sidebar */}
            {specialProps.affiliationText && (
              <div className="font-serif italic text-[7pt] text-slate-700 leading-snug border-b border-slate-200 pb-1 mb-1">
                {specialProps.affiliationText}
              </div>
            )}

            {/* Correspondence */}
            <div>
              <div style={{ color: primaryColor }} className="font-bold text-[6.8pt]">
                Liên hệ
              </div>
              <div className="text-slate-800 text-[6.3pt] leading-tight mt-0.5">
                <span className="font-bold">{specialProps.correspondenceAuthor || 'Hà Vũ'}</span>
                {specialProps.correspondenceAffiliation && `, ${specialProps.correspondenceAffiliation}`}
              </div>
              {specialProps.correspondenceEmail && (
                <div className="text-slate-600 text-[6pt] mt-0.5">
                  Email: {specialProps.correspondenceEmail}.
                </div>
              )}
            </div>

            {/* History */}
            <div>
              <div style={{ color: primaryColor }} className="font-bold text-[6.8pt] mb-0.5">
                Lịch sử
              </div>
              <div className="space-y-0.5 text-slate-700 text-[6.3pt]">
                {historyItems.map((h, i) => (
                  <div key={i}>
                    <span style={{ color: primaryColor }}>•</span> {h.label}: {h.value}
                  </div>
                ))}
              </div>
            </div>

            {/* DOI */}
            {specialProps.doiUrl && (
              <div>
                <span style={{ color: primaryColor }} className="font-bold text-[6.8pt]">
                  DOI :{' '}
                </span>
                <span className="font-bold text-slate-800 break-all text-[6.1pt]">
                  {specialProps.doiUrl}
                </span>
              </div>
            )}

            {/* Check for updates badge */}
            {specialProps.badgeImageSrc && (
              <div className="pt-0.5">
                <img
                  src={specialProps.badgeImageSrc}
                  alt="Check for updates"
                  className="w-full max-w-[86px] h-auto object-contain"
                />
              </div>
            )}

            {/* Copyright */}
            {specialProps.copyrightNotice && (
              <div>
                <div style={{ color: primaryColor }} className="font-bold text-[6.8pt]">
                  Bản quyền
                </div>
                <p className="text-[5.6pt] text-slate-600 leading-tight mt-0.5">
                  {specialProps.copyrightNotice}
                </p>
              </div>
            )}

            {/* Publisher Logo */}
            {specialProps.logoImageSrc && (
              <div className="pt-0.5 flex justify-start">
                <img
                  src={specialProps.logoImageSrc}
                  alt="Publisher Logo"
                  className="w-[74px] h-auto object-contain"
                />
              </div>
            )}
          </div>
        );
      }

      const fields = (specialProps.metadataFields || []).filter((f) => f.visible);
      return (
        <div style={containerStyle} className="font-sans space-y-1.5">
          {fields.map((f) => (
            <div key={f.id} className="text-[7.5pt]">
              <span className="font-bold text-slate-700">{f.label}: </span>
              <span className="text-slate-600">{f.defaultValue}</span>
            </div>
          ))}
        </div>
      );
    }

    case 'abstract-box':
      return (
        <div style={containerStyle}>
          {!specialProps.isContinuation && (
            <div
              className="font-bold mb-1 font-sans"
              style={{ color: primaryColor, fontSize: `${styling.fontSize}pt` }}
            >
              {specialProps.abstractLabel || 'TÓM TẮT'}
            </div>
          )}
          <p className="text-justify leading-relaxed">
            {specialProps.customContentSample ||
              'Bài báo này đề xuất giải pháp bóc tách cấu trúc tài liệu DOCX bán cấu trúc và tự động chuyển đổi sang khuôn mẫu xuất bản khoa học 2 cột. Hệ thống kết hợp phân tích cú pháp OpenXML nội bộ với mô hình ngôn ngữ lớn để bảo toàn hoàn chỉnh ảnh đồ họa vector, công thức toán học MathML và mạng lưới trích dẫn tài liệu tham khảo theo quy chuẩn VNUHCM.'}
          </p>
        </div>
      );

    case 'keywords-group':
      return (
        <div style={containerStyle} className="font-sans text-[8.5pt]">
          <span className="font-bold text-slate-800">
            {specialProps.keywordLabel || 'Từ khoá:'}{' '}
          </span>
          <span className="text-slate-700">
            {specialProps.customContentSample ||
              `OpenXML${specialProps.keywordSeparator || ', '}LaTeX XeTeX${specialProps.keywordSeparator || ', '}Dàn trang tự động${specialProps.keywordSeparator || ', '}Bài báo khoa học${specialProps.keywordSeparator || ', '}ĐHQG TP.HCM`}
          </span>
        </div>
      );

    case 'heading':
    case 'section-heading' as any:
    case 'subheading' as any: {
      const headingLevel = specialProps.headingLevel || (element.type === ('subheading' as any) ? 2 : 1);
      const isSub = headingLevel >= 2 || element.id.includes('subheading');

      if (isSub) {
        return (
          <div
            style={{
              marginTop: `${styling.margin.top || 4}px`,
              marginBottom: `${styling.margin.bottom || 2}px`,
            }}
            className="first:mt-0 break-inside-avoid"
          >
            <h3
              style={{
                fontFamily: styling.fontFamily || 'Minion Pro, Times New Roman, serif',
                fontSize: `${styling.fontSize || 8.55}pt`,
                fontWeight: 700,
                color: styling.textColor || '#1A1A1A',
                lineHeight: styling.lineHeight || 1.25,
              }}
            >
              {renderTextWithCitations(specialProps.customContentSample || 'Tiểu mục')}
            </h3>
          </div>
        );
      }

      return (
        <div
          style={{
            marginTop: `${styling.margin.top}px`,
            marginBottom: `${styling.margin.bottom}px`,
          }}
          className="flex items-center gap-1.5 first:mt-0 break-inside-avoid"
        >
          {styling.accentBar && (
            <span
              className="w-1 self-stretch rounded-full shrink-0"
              style={{ backgroundColor: styling.accentBarColor || primaryColor }}
            />
          )}
          <h2
            style={{
              fontFamily: styling.fontFamily,
              fontSize: `${styling.fontSize}pt`,
              fontWeight: 700,
              color: styling.textColor || primaryColor,
              textTransform: styling.textTransform,
            }}
          >
            {specialProps.numberingFormat === 'ROMAN' && 'I. '}
            {specialProps.numberingFormat === 'ARABIC' && '1. '}
            {renderTextWithCitations(specialProps.customContentSample || 'GIỚI THIỆU')}
          </h2>
        </div>
      );
    }

    case 'body-text': {

      const rawText = specialProps.customContentSample;
      const showDropCap = Boolean(styling.dropCap && !specialProps.isContinuation);

      let dropLetter = '';
      let displayCustomText = '';
      if (rawText) {
        if (showDropCap && rawText.length > 0) {
          dropLetter = rawText.charAt(0);
          displayCustomText = rawText.slice(1);
        } else {
          displayCustomText = rawText;
        }
      }

      return (
        <div style={containerStyle}>
          <p
            style={{
              textIndent: specialProps.isContinuation ? 0 : `${(styling.firstLineIndent ?? 4) * 2}px`,
              textAlignLast: specialProps.isFlowSource ? 'justify' : undefined,
            }}
          >
            {rawText ? (
              <>
                {showDropCap && dropLetter && (
                  <span
                    className="float-left text-3xl font-serif font-black mr-1 leading-none"
                    style={{ color: primaryColor }}
                  >
                    {dropLetter}
                  </span>
                )}
                <span>{renderTextWithCitations(displayCustomText)}</span>
              </>
            ) : (
              <>
                {showDropCap && (
                  <span
                    className="float-left text-3xl font-serif font-black mr-1 leading-none"
                    style={{ color: primaryColor }}
                  >
                    V
                  </span>
                )}
                {showDropCap ? 'ăn bản' : 'Văn bản'} khoa học đóng vai trò trung tâm trong công tác công bố và lan toả tri thức học thuật. Các tạp chí thuộc hệ sinh thái Đại học Quốc gia TP.HCM đòi hỏi quy chuẩn dàn trang nghiêm ngặt về số cột, lề trang, font chữ và phong cách trích dẫn.
              </>
            )}
          </p>
        </div>
      );
    }

    case 'table-box': {
      const tableRules = floatingRules?.table;
      const borderMode = specialProps.tableBorderMode || tableRules?.borderMode || 'booktabs';
      const isBooktabs = borderMode === 'booktabs';
      const isGrid = borderMode === 'grid';
      const zebra = specialProps.zebraStriping ?? tableRules?.zebraStriping ?? false;
      const captionPos = specialProps.captionPosition || tableRules?.captionPosition || 'above';
      const captionAbove = captionPos === 'above';

      const captionLabelWeight =
        tableRules?.captionLabelWeight === 'normal'
          ? 400
          : tableRules?.captionLabelWeight === 'semibold'
            ? 600
            : 700;
      const captionLabelColor = tableRules?.captionLabelColor || '#0F172A';
      const captionTextColor = tableRules?.captionTextColor || '#334155';
      const captionTextItalic = tableRules?.captionTextItalic ?? true;
      const headerTextColor = tableRules?.headerTextColor || '#0F172A';
      const dataTextColor = tableRules?.dataTextColor || '#1E293B';
      const dataFontSize = tableRules?.dataFontSize || 7;
      const noteFontSize = tableRules?.noteFontSize || 6.5;
      const noteTextColor = tableRules?.noteTextColor || '#64748B';

      const captionEl = (
        <div className="font-sans text-[7.5pt] leading-tight mb-1">
          <span
            style={{
              fontWeight: captionLabelWeight,
              color: captionLabelColor,
            }}
          >
            {specialProps.captionPrefix || 'Bảng 1'}:
          </span>{' '}
          <span
            style={{
              fontStyle: captionTextItalic ? 'italic' : 'normal',
              color: captionTextColor,
            }}
          >
            {specialProps.captionText || specialProps.customContentSample || 'Độ chính xác phân vùng và thời gian xử lý qua các tập mẫu thử nghiệm'}
          </span>
        </div>
      );

      if (specialProps.tableHeaders && specialProps.tableRows && specialProps.tableRows.length > 0) {
        return (
          <div style={containerStyle} className="w-full my-1 font-sans flex-shrink-0 flex flex-col select-none">
            {captionAbove && captionEl}
            <div className="overflow-x-auto border-t-2 border-b-2 border-slate-900">
              <table className="w-full text-left text-[7.5pt] border-collapse">
                <thead>
                  <tr className="bg-[#E5E5E5] border-b border-slate-400">
                    {specialProps.tableHeaders.map((h, i) => (
                      <th key={i} className="py-1 px-1.5 font-bold text-slate-900" style={{ color: headerTextColor }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {specialProps.tableRows.map((row, idx) => {
                    if (row.isSubheader) {
                      return (
                        <tr key={idx} className="bg-[#E7ECF7] font-bold border-b border-slate-300">
                          <td
                            colSpan={specialProps.tableHeaders?.length || 3}
                            className="py-1 px-1.5"
                            style={{ color: primaryColor }}
                          >
                            {row.subheaderText}
                          </td>
                        </tr>
                      );
                    }
                    return (
                      <tr
                        key={idx}
                        className={`border-b border-slate-200/80 ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-[#E7ECF7]/30'
                        }`}
                      >
                        {row.cols?.map((c, colIdx) => (
                          <td key={colIdx} className="py-1 px-1.5 align-top whitespace-pre-line text-slate-800 leading-snug">
                            {c}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {specialProps.tableSource && (
              <div className="text-[6.8pt] italic text-slate-500 mt-1">
                (Nguồn: {specialProps.tableSource})
              </div>
            )}
            {!captionAbove && <div className="mt-1">{captionEl}</div>}
          </div>
        );
      }

      return (
        <div style={containerStyle} className="my-2 select-none">
          {captionAbove && captionEl}
          <div className="w-full overflow-x-auto">
            <table
              className={`w-full text-left font-serif border-collapse ${
                isBooktabs
                  ? 'border-t-2 border-b-2 border-zinc-900'
                  : isGrid
                    ? 'border border-zinc-300'
                    : 'border-b border-zinc-200'
              }`}
              style={{
                fontSize: `${dataFontSize}pt`,
                color: dataTextColor,
              }}
            >
              <thead>
                <tr
                  className={`${
                    isBooktabs
                      ? 'border-b border-zinc-900 font-bold'
                      : isGrid
                        ? 'border-b border-zinc-300 bg-zinc-100 font-bold'
                        : 'border-b border-zinc-200 font-bold'
                  }`}
                  style={{
                    backgroundColor: specialProps.tableHeaderBackground || tableRules?.headerBackground || undefined,
                  }}
                >
                  <th className="py-1 px-2 font-bold" style={{ color: headerTextColor }}>Mô hình / Phương pháp</th>
                  <th className="py-1 px-1.5 text-center font-bold" style={{ color: headerTextColor }}>Precision</th>
                  <th className="py-1 px-1.5 text-center font-bold" style={{ color: headerTextColor }}>Recall</th>
                  <th className="py-1 px-1.5 text-center font-bold" style={{ color: headerTextColor }}>F1-Score</th>
                  <th className="py-1 px-2 text-right font-bold" style={{ color: headerTextColor }}>Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60" style={{ color: dataTextColor }}>
                <tr className={zebra ? 'bg-zinc-50/70' : ''}>
                  <td className="py-1 px-2 font-medium" style={{ color: dataTextColor }}>Rule-based OpenXML</td>
                  <td className="py-1 px-1.5 text-center">92.4%</td>
                  <td className="py-1 px-1.5 text-center">88.7%</td>
                  <td className="py-1 px-1.5 text-center">90.5%</td>
                  <td className="py-1 px-2 text-right font-mono">142 ms</td>
                </tr>
                <tr className={zebra ? '' : 'bg-zinc-50/40'}>
                  <td className="py-1 px-2 font-medium" style={{ color: dataTextColor }}>LayoutLMv3 (Fine-tuned)</td>
                  <td className="py-1 px-1.5 text-center">96.8%</td>
                  <td className="py-1 px-1.5 text-center">95.2%</td>
                  <td className="py-1 px-1.5 text-center">96.0%</td>
                  <td className="py-1 px-2 text-right font-mono">850 ms</td>
                </tr>
                <tr className={zebra ? 'bg-zinc-50/70' : ''}>
                  <td className="py-1 px-2 font-bold text-emerald-800">StructPaper Hybrid (Ours)</td>
                  <td className="py-1 px-1.5 text-center font-bold text-emerald-800">98.5%</td>
                  <td className="py-1 px-1.5 text-center font-bold text-emerald-800">97.9%</td>
                  <td className="py-1 px-1.5 text-center font-bold text-emerald-800">98.2%</td>
                  <td className="py-1 px-2 text-right font-mono font-bold text-emerald-800">285 ms</td>
                </tr>
              </tbody>
            </table>
          </div>
          {specialProps.tableFootnote && (
            <div
              className="mt-1 italic font-serif"
              style={{
                fontSize: `${noteFontSize}pt`,
                color: noteTextColor,
              }}
            >
              {specialProps.tableFootnote}
            </div>
          )}
          {!captionAbove && <div className="mt-1">{captionEl}</div>}
        </div>
      );
    }

    case 'figure-box': {
      const figRules = floatingRules?.figure;
      const captionPos = specialProps.captionPosition || figRules?.captionPosition || 'below';
      const captionAbove = captionPos === 'above';
      const hasSubfigures = specialProps.figureSubfigures ?? figRules?.showSubfiguresSupport ?? false;

      const captionLabelWeight =
        figRules?.captionLabelWeight === 'normal'
          ? 400
          : figRules?.captionLabelWeight === 'semibold'
            ? 600
            : 700;
      const captionLabelColor = figRules?.captionLabelColor || primaryColor || '#0F172A';
      const captionTextColor = figRules?.captionTextColor || '#334155';
      const captionTextItalic = figRules?.captionTextItalic ?? true;
      const sourceFontSize = figRules?.sourceFontSize || 6.5;
      const sourceTextColor = figRules?.sourceTextColor || '#64748B';

      const captionEl = (
        <div className="font-sans text-[7.8pt] leading-tight mt-1 text-left">
          <span
            style={{
              fontWeight: captionLabelWeight,
              color: captionLabelColor,
            }}
          >
            {specialProps.captionPrefix || `Hình ${specialProps.figureNumber || 1}`}:
          </span>{' '}
          <span
            style={{
              fontWeight: 700,
              fontStyle: captionTextItalic ? 'italic' : 'normal',
              color: captionTextColor,
            }}
          >
            {specialProps.captionText || specialProps.customContentSample || 'Sơ đồ luồng xử lý và trích xuất cấu trúc văn bản học thuật'}
          </span>
          {specialProps.figureSource && (
            <div
              className="mt-0.5 italic text-slate-500"
              style={{
                fontSize: `${sourceFontSize}pt`,
                color: sourceTextColor,
              }}
            >
              (Nguồn: {specialProps.figureSource})
            </div>
          )}
        </div>
      );

      if (specialProps.figureImageSrc) {
        return (
          <div
            style={containerStyle}
            className="w-full bg-[#E7ECF7] rounded-none p-2 mb-2 flex flex-col items-center flex-shrink-0 select-none"
          >
            {captionAbove && captionEl}
            <div className="w-full flex-1 flex items-center justify-center bg-white p-1 overflow-hidden">
              <img
                src={specialProps.figureImageSrc}
                alt={specialProps.captionText || 'Figure'}
                className="w-full h-full object-contain rounded-none block max-h-[110mm]"
              />
            </div>
            {!captionAbove && captionEl}
          </div>
        );
      }

      return (
        <div style={containerStyle} className="my-2 select-none">
          {captionAbove && <div className="mb-1">{captionEl}</div>}
          {hasSubfigures ? (
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex flex-col items-center justify-center min-h-[80px]">
                <svg className="w-full h-14 text-slate-600" viewBox="0 0 160 55" fill="none">
                  <path d="M 10 45 Q 50 15, 90 30 T 150 10" stroke="#2563EB" strokeWidth="2" fill="none" />
                  <circle cx="90" cy="30" r="3" fill="#2563EB" />
                  <line x1="10" y1="45" x2="150" y2="45" stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 2" />
                </svg>
                <span className="text-[6.5pt] font-bold text-slate-600 mt-0.5">(a) Độ chính xác theo Epoch</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex flex-col items-center justify-center min-h-[80px]">
                <svg className="w-full h-14 text-slate-600" viewBox="0 0 160 55" fill="none">
                  <path d="M 10 15 Q 50 40, 90 20 T 150 45" stroke="#78C841" strokeWidth="2" fill="none" />
                  <circle cx="90" cy="20" r="3" fill="#78C841" />
                  <line x1="10" y1="45" x2="150" y2="45" stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 2" />
                </svg>
                <span className="text-[6.5pt] font-bold text-slate-600 mt-0.5">(b) Hàm mất mát Loss</span>
              </div>
            </div>
          ) : (
            <div className="w-full p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/90 flex flex-col items-center justify-center min-h-[95px]">
              <svg className="w-44 h-16 text-slate-600" viewBox="0 0 200 70" fill="none">
                <rect x="10" y="15" width="45" height="38" rx="4" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
                <text x="32" y="38" fontSize="8" fill="#334155" textAnchor="middle" fontWeight="bold">DOCX</text>
                <path d="M 55 34 L 75 34" stroke="#78C841" strokeWidth="2" />
                <rect x="75" y="10" width="50" height="48" rx="4" fill="#DCFCE7" stroke="#78C841" strokeWidth="1.5" />
                <text x="100" y="32" fontSize="7.5" fill="#14532D" textAnchor="middle" fontWeight="bold">Parser</text>
                <text x="100" y="44" fontSize="6.5" fill="#14532D" textAnchor="middle">OpenXML</text>
                <path d="M 125 34 L 145 34" stroke="#78C841" strokeWidth="2" />
                <rect x="145" y="15" width="45" height="38" rx="4" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1.5" />
                <text x="167" y="38" fontSize="8" fill="#1E40AF" textAnchor="middle" fontWeight="bold">PDF 2-Col</text>
              </svg>
            </div>
          )}
          {!captionAbove && captionEl}
        </div>
      );
    }

    case 'equation-box': {
      const eqRules = floatingRules?.equation;
      const numberingFormat = eqRules?.numberingFormat || '(1)';
      const eqNum = specialProps.equationNumber || (numberingFormat === 'none' ? '' : numberingFormat);
      const latex = specialProps.equationLatex || '\\mathcal{L}_{total} = \\alpha \\mathcal{L}_{struct} + \\beta \\mathcal{L}_{sem} + \\gamma \\|\\mathbf{W}\\|_2^2';
      const numberWeight = eqRules?.numberWeight === 'normal' ? 400 : 700;
      const numberColor = eqRules?.numberColor || '#334155';

      return (
        <div style={containerStyle} className="my-2 px-3 py-1 flex items-center justify-between font-serif select-none">
          <div className="flex-1 text-center italic text-[9pt] tracking-wide text-zinc-900 overflow-x-auto">
            {latex.includes('\\') ? (
              <span>
                ℒ<sub>total</sub> = α · ℒ<sub>struct</sub> + β · ℒ<sub>sem</sub> + γ · ||<strong>W</strong>||<sub>2</sub><sup>2</sup>
              </span>
            ) : (
              <span>{latex}</span>
            )}
          </div>
          <span
            className="font-sans shrink-0 ml-3 text-[8pt]"
            style={{
              fontWeight: numberWeight,
              color: numberColor,
            }}
          >
            {eqNum}
          </span>
        </div>
      );
    }

    case 'code-algorithm': {
      const title = specialProps.algorithmTitle || 'Thuật toán 1: Trích xuất phân vùng tài liệu';
      const showLineNos = specialProps.showLineNumbers ?? floatingRules?.codeAlgorithm?.showLineNumbers ?? true;
      return (
        <div style={containerStyle} className="my-2 text-left font-mono select-none">
          <div className="border-t-2 border-b border-zinc-900 py-0.5 font-bold font-sans text-[7.5pt] text-zinc-900 flex items-center justify-between">
            <span>{title}</span>
            <span className="text-[6.5pt] text-zinc-500 font-mono font-normal">[{specialProps.codeLanguage || 'Pseudocode'}]</span>
          </div>
          {specialProps.algorithmInputs && (
            <div className="pt-0.5 text-[6.5pt] text-zinc-700 font-sans">
              <strong>Input:</strong> {specialProps.algorithmInputs}
            </div>
          )}
          {specialProps.algorithmOutputs && (
            <div className="text-[6.5pt] text-zinc-700 font-sans pb-0.5 border-b border-zinc-200">
              <strong>Output:</strong> {specialProps.algorithmOutputs}
            </div>
          )}
          <div className="py-1 text-[6.5pt] leading-relaxed space-y-0.5 text-zinc-800">
            <div>{showLineNos && <span className="text-zinc-400 select-none mr-2">1:</span>}Initialize Grid matrix <em>G</em> with columns <em>C</em> and rows <em>R</em></div>
            <div>{showLineNos && <span className="text-zinc-400 select-none mr-2">2:</span>}<strong>for each</strong> paragraph <em>p</em> in Document <strong>do</strong></div>
            <div className="pl-3">{showLineNos && <span className="text-zinc-400 select-none mr-2">3:</span>}<em>zone</em> ← ClassifySemanticZone(<em>p</em>)</div>
            <div className="pl-3">{showLineNos && <span className="text-zinc-400 select-none mr-2">4:</span>}AssignToGridArea(<em>zone</em>, <em>G</em>)</div>
            <div>{showLineNos && <span className="text-zinc-400 select-none mr-2">5:</span>}<strong>return</strong> Compiled Layout <em>G</em></div>
          </div>
          <div className="border-b-2 border-zinc-900" />
        </div>
      );
    }

    case 'link-box': {
      if (specialProps.showQrCode && (specialProps.qrImageSrc || specialProps.qrCaption)) {
        return (
          <div style={containerStyle} className="flex flex-col items-center justify-start text-center pt-1 select-none font-sans">
            <div className="w-[66px] h-[66px] relative mb-1.5 border border-slate-300 rounded-none bg-white p-1">
              <img
                src={specialProps.qrImageSrc || '/demo-assets/id630/qr-code.png'}
                alt="QR Code"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-[6.2pt] text-slate-500 leading-tight font-sans text-center max-w-[125px]">
              {specialProps.qrCaption || 'Use your smartphone to scan this QR code and download this article'}
            </p>
          </div>
        );
      }

      const linkType = specialProps.linkType || 'doi';
      const label = specialProps.linkLabel || (linkType === 'doi' ? 'DOI' : 'Repository');
      const url = specialProps.linkUrl || 'https://doi.org/10.32508/stdj.v28i2.1234';
      const showQr = specialProps.showQrCode ?? floatingRules?.linkDoi?.showQrCodeOnPrint ?? true;
      return (
        <div style={containerStyle} className="my-1.5 select-none">
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 font-sans">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-bold shrink-0">
                ↗
              </span>
              <div className="min-w-0">
                <div className="text-[7pt] font-bold text-slate-700 uppercase tracking-wider">{label}</div>
                <div className="text-[7pt] text-blue-600 font-mono truncate">{url}</div>
              </div>
            </div>
            {showQr && (
              <div className="shrink-0 flex items-center gap-1 bg-white p-1 rounded-md border border-slate-200 shadow-2xs" title="Mã QR bản in">
                <svg className="w-5 h-5 text-slate-800" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm10 0h3v3h-3v-3zm5 0h3v3h-3v-3zm-5 5h3v3h-3v-3zm5 0h3v3h-3v-3z" />
                </svg>
              </div>
            )}
          </div>
        </div>
      );
    }

    case 'biography-box': {
      const author = specialProps.authorName || 'TS. Nguyễn Hoàng Nam';
      const showPhoto = specialProps.showAuthorPhoto ?? floatingRules?.biography?.showAuthorPhoto ?? true;
      const bio = specialProps.bioText || specialProps.customContentSample || 'Nhận bằng Tiến sĩ Khoa học Máy tính tại ĐHQG TP.HCM. Hướng nghiên cứu chuyên sâu về bóc tách cấu trúc và hệ thống xuất bản học thuật.';
      return (
        <div style={containerStyle} className="my-2 select-none flex items-start gap-2.5 font-sans">
          {showPhoto && (
            <div className="w-10 h-12 rounded-md bg-slate-200 border border-slate-300 flex flex-col items-center justify-center text-slate-400 shrink-0 shadow-2xs">
              <span className="text-base">👤</span>
            </div>
          )}
          <div className="flex-1 text-[7pt] leading-snug">
            <span className="font-bold text-slate-900">{author}: </span>
            <span className="text-slate-700">{bio}</span>
          </div>
        </div>
      );
    }

    case 'divider-line':
      return (
        <div style={containerStyle} className="my-2 select-none">
          <hr className="border-t border-slate-300 w-full" />
        </div>
      );

    case 'callout-box':
      return (
        <div style={containerStyle}>
          <div className="font-bold mb-1 flex items-center gap-1 text-[9pt]" style={{ color: styling.borderColor }}>
            <span>{specialProps.calloutTitle || '⚡ Điểm nhấn nghiên cứu'}</span>
          </div>
          <div className="whitespace-pre-wrap text-[8.5pt] leading-snug">
            {specialProps.customContentSample || 'Nội dung điểm nhấn mang tính đột phá.'}
          </div>
        </div>
      );

    case 'custom-field':
      return (
        <div style={containerStyle}>
          <div className="font-bold text-[8.5pt] text-slate-800 mb-0.5">{element.name}:</div>
          <div className="text-[8.5pt] text-slate-600 leading-snug">
            {specialProps.customContentSample || 'Nội dung chi tiết được định nghĩa tùy ý.'}
          </div>
        </div>
      );

    case 'references-block': {
      const citeRules = floatingRules?.citation;
      const isApa = citeRules?.citationStyle === 'apa' || citeRules?.citationStyle === 'harvard';
      const isSuper = citeRules?.inTextFormat === 'superscript';
      const showDoi = citeRules?.showDoiInBibliography ?? true;
      const hangingPx = (citeRules?.hangingIndent ?? 5) * 2;

      const refLabelWeight = citeRules?.refLabelWeight === 'normal' ? 400 : 700;
      const refLabelColor = citeRules?.refLabelColor || primaryColor || '#0F172A';
      const refTextColor = citeRules?.refTextColor || styling.textColor;
      const doiColor = citeRules?.doiColor || primaryColor || '#2563EB';
      const doiUnderline = citeRules?.doiUnderline ? 'underline' : 'no-underline';

      if (specialProps.referenceItems && specialProps.referenceItems.length > 0) {
        return (
          <div style={containerStyle}>
            <div className="font-bold uppercase text-[9.5pt] mb-1.5 font-sans" style={{ color: primaryColor }}>
              {specialProps.referenceHeadingText || 'TÀI LIỆU THAM KHẢO'}
            </div>
            <div className="space-y-1">
              {specialProps.referenceItems.map((ref, idx) => (
                <div key={idx} className="flex items-start gap-1 text-[7.4pt] leading-[1.22] mb-1 text-left font-sans text-slate-800">
                  <span style={{ color: primaryColor }} className="font-bold flex-shrink-0 font-sans w-4 text-right">
                    {ref.num}.
                  </span>
                  <div className="flex-1">
                    <span>{ref.text} </span>
                    {ref.url && (
                      <span style={{ color: primaryColor }} className="underline break-all font-sans font-semibold">
                        {ref.url}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      return (
        <div style={containerStyle}>
          <div className="font-bold uppercase text-[9pt] mb-2" style={{ color: primaryColor }}>
            {specialProps.referenceHeadingText || 'Tài liệu tham khảo'}
          </div>
          <div
            className="space-y-1.5"
            style={{
              fontFamily: citeRules?.fontFamily || styling.fontFamily || 'Times New Roman',
              fontSize: citeRules?.fontSize ? `${citeRules.fontSize}pt` : `${styling.fontSize}pt`,
              color: refTextColor,
            }}
          >
            <div style={{ paddingLeft: `${hangingPx}px`, textIndent: `-${hangingPx}px` }}>
              {isApa ? (
                <span>
                  Nguyen, H. N., & Tran, M. T. (2025). Automated Academic Typesetting from DOCX Documents. <em>Sci. Tech. Dev. J.</em>, 28(2), 112–124.
                </span>
              ) : (
                <span>
                  <span style={{ fontWeight: refLabelWeight, color: refLabelColor }}>
                    {isSuper ? '1. ' : '[1] '}
                  </span>
                  Nguyen, H. N., & Tran, M. T., &ldquo;Automated Academic Typesetting from DOCX Documents,&rdquo; <em>Sci. Tech. Dev. J.</em>, vol. 28, no. 2, pp. 112–124, 2025.
                </span>
              )}
              {showDoi && (
                <span
                  className={`ml-1 font-mono text-[7pt] ${doiUnderline}`}
                  style={{ color: doiColor }}
                >
                  https://doi.org/10.32508/stdj.v28i2.1234
                </span>
              )}
            </div>

            <div style={{ paddingLeft: `${hangingPx}px`, textIndent: `-${hangingPx}px` }}>
              {isApa ? (
                <span>
                  VNU-HCM Publishing House. (2024). <em>Guidelines for Scientific Paper Formatting and Citation Standards</em>. VNUHCM Press.
                </span>
              ) : (
                <span>
                  <span style={{ fontWeight: refLabelWeight, color: refLabelColor }}>
                    {isSuper ? '2. ' : '[2] '}
                  </span>
                  VNU-HCM Publishing House, <em>Guidelines for Scientific Paper Formatting and Citation Standards</em>, VNUHCM Press, 2024.
                </span>
              )}
              {showDoi && (
                <span
                  className={`ml-1 font-mono text-[7pt] ${doiUnderline}`}
                  style={{ color: doiColor }}
                >
                  https://doi.org/10.32508/vnuhcm.guide.2024
                </span>
              )}
            </div>
          </div>
        </div>
      );
    }

    case 'custom-composite': {
      const subItems = specialProps.subItems || [];
      const layout = specialProps.compositeLayout || 'stacked';

      if (layout === 'inline') {
        return (
          <div style={containerStyle} className="leading-relaxed">
            {subItems.map((item) => (
              <span
                key={item.id}
                style={{
                  fontFamily: item.styling.fontFamily,
                  fontSize: `${item.styling.fontSize || styling.fontSize}pt`,
                  fontWeight:
                    item.styling.fontWeight === 'bold'
                      ? 700
                      : item.styling.fontWeight === 'semibold'
                        ? 600
                        : 400,
                  fontStyle: item.styling.fontStyle || 'normal',
                  color: item.styling.textColor || styling.textColor,
                  textTransform: item.styling.textTransform || 'none',
                  marginRight: '4px',
                }}
              >
                {item.defaultValue}
                {item.kind === 'constant' && (item.styling.suffix || ' ')}
              </span>
            ))}
          </div>
        );
      }

      if (layout === 'split-cols') {
        return (
          <div style={containerStyle} className="grid grid-cols-[30%_1fr] gap-2 items-baseline">
            <div className="space-y-1 border-r border-slate-200/90 pr-2">
              {subItems
                .filter((i) => i.kind === 'constant')
                .map((item) => (
                  <div
                    key={item.id}
                    style={{
                      fontFamily: item.styling.fontFamily,
                      fontSize: `${item.styling.fontSize || styling.fontSize}pt`,
                      fontWeight: item.styling.fontWeight === 'bold' ? 700 : 600,
                      color: item.styling.textColor || styling.textColor,
                      textTransform: item.styling.textTransform || 'none',
                    }}
                  >
                    {item.defaultValue}
                  </div>
                ))}
            </div>
            <div className="space-y-1 pl-1">
              {subItems
                .filter((i) => i.kind === 'variable')
                .map((item) => (
                  <div
                    key={item.id}
                    style={{
                      fontFamily: item.styling.fontFamily,
                      fontSize: `${item.styling.fontSize || styling.fontSize}pt`,
                      fontWeight: 400,
                      color: item.styling.textColor || styling.textColor,
                    }}
                  >
                    {item.defaultValue}
                  </div>
                ))}
            </div>
          </div>
        );
      }

      return (
        <div style={containerStyle} className="space-y-1">
          {subItems.map((item) => (
            <div
              key={item.id}
              style={{
                fontFamily: item.styling.fontFamily,
                fontSize: `${item.styling.fontSize || styling.fontSize}pt`,
                fontWeight:
                  item.styling.fontWeight === 'bold'
                    ? 700
                    : item.styling.fontWeight === 'semibold'
                      ? 600
                      : 400,
                fontStyle: item.styling.fontStyle || 'normal',
                color: item.styling.textColor || styling.textColor,
                textTransform: item.styling.textTransform || 'none',
              }}
            >
              {item.defaultValue}
            </div>
          ))}
        </div>
      );
    }

    case 'custom-block': {
      const content = specialProps.customContentSample || '';
      const colonIdx = content.indexOf(': ');
      const isCitationStrip = element.id.includes('cite_strip') || content.toLowerCase().includes('trích dẫn');

      return (
        <div style={containerStyle} className="leading-snug select-text">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {colonIdx !== -1 && colonIdx < 30 ? (
                <span>
                  <strong className="font-bold text-slate-900">{content.slice(0, colonIdx + 1)}</strong>
                  <span> {content.slice(colonIdx + 2)}</span>
                </span>
              ) : (
                <span>{content || element.name}</span>
              )}
            </div>
          </div>
          {isCitationStrip && (
            <div className="flex justify-end pr-0.5 mt-0.5">
              <span style={{ color: primaryColor }} className="font-bold text-[9pt] font-sans">
                1
              </span>
            </div>
          )}
        </div>
      );
    }

    default:
      return (
        <div style={containerStyle}>
          <div className="text-xs font-semibold">{element.name}</div>
        </div>
      );
  }
};
