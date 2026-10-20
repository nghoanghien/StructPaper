import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_API_KEY = process.env.OPENAI_API_KEY || '';

const DEFAULT_MODEL = 'gpt-5.4-mini';

interface AiExtractRequest {
  action: 'metadata' | 'table' | 'full';
  text: string;
  tableText?: string;
  apiKey?: string;
  model?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: AiExtractRequest = await req.json();
    const apiKey = (body.apiKey && body.apiKey.trim().length > 10) ? body.apiKey.trim() : DEFAULT_API_KEY;
    const model = body.model && body.model.trim() ? body.model.trim() : DEFAULT_MODEL;

    if (!body.text && !body.tableText) {
      return NextResponse.json({ error: 'Thiếu dữ liệu văn bản cần trích xuất' }, { status: 400 });
    }

    if (body.action === 'table') {
      const tablePrompt = `Bạn là chuyên gia trích xuất dữ liệu khoa học. Hãy phân tích đoạn văn bản chứa bảng sau và trả về đúng định dạng JSON:
{
  "caption": "Tiêu đề bảng (ví dụ: Bảng 1: Các xét nghiệm chẩn đoán...)",
  "headers": ["Tên cột 1", "Tên cột 2", ...],
  "rows": [
    ["Giá trị ô 1", "Giá trị ô 2", ...],
    ["Giá trị ô 3", "Giá trị ô 4", ...]
  ]
}

Nội dung bảng:
${(body.tableText || body.text).slice(0, 4000)}`;

      const aiResponse = await callOpenAi(apiKey, model, tablePrompt);
      return NextResponse.json({ success: true, data: aiResponse });
    }

    // Default: action === 'metadata'
    const metadataPrompt = `Bạn là chuyên gia biên tập xuất bản của Đại học Quốc gia Thành phố Hồ Chí Minh (VNUHCM).
Hãy phân tích phần đầu bản thảo khoa học sau và trích xuất cấu trúc dữ liệu JSON chính xác 100%:

{
  "title": "Tiêu đề tiếng Việt chính của bài báo (không bao gồm tên tạp chí, số trang, ngày tháng)",
  "titleEn": "Tiêu đề tiếng Anh (nếu có trong bài, nếu không có để chuỗi rỗng '')",
  "articleType": "Bài nghiên cứu HOẶC Bài tổng quan",
  "journalId": "Một trong 7 mã định danh sau (chọn chính xác theo lĩnh vực chuyên môn):
    - VNUHCM-ARNS: Khoa học Tự nhiên (Toán, Vật lý, Hóa học, Sinh học...)
    - VNUHCM-EBL: Kinh tế, Quản trị, Luật
    - VNUHCM-EES: Khoa học Trái đất & Môi trường, Khí tượng Thủy văn
    - VNUHCM-HS: Khoa học Sức khỏe, Y học, Dược học, Nha khoa
    - VNUHCM-SSH: Khoa học Xã hội và Nhân văn, Văn học, Lịch sử, Ngôn ngữ
    - VNUHCM-ET: Kỹ thuật & Công nghệ (Xây dựng, Cơ khí, Điện tử, CNTT...)
    - VNUHCM-STDJ: Khoa học & Công nghệ tổng hợp",
  "authors": [
    {
      "name": "Họ và tên tác giả (chuẩn hóa tiếng Việt, bỏ số mũ)",
      "affiliationIds": [1],
      "isCorresponding": true/false
    }
  ],
  "affiliations": [
    {
      "id": 1,
      "name": "Tên đầy đủ của Viện, Trường, Khoa, Bộ môn hoặc Đơn vị công tác"
    }
  ],
  "corresponding": {
    "name": "Tên tác giả liên hệ",
    "email": "Email liên hệ chính xác",
    "affiliation": "Đơn vị tác giả liên hệ"
  },
  "abstract": "Nội dung Tóm tắt tiếng Việt",
  "abstractEn": "Nội dung Abstract tiếng Anh (nếu có, không có để '')",
  "keywords": ["Từ khóa tiếng Việt 1", "Từ khóa 2"],
  "keywordsEn": ["Keyword tiếng Anh 1", "Keyword 2"],
  "dates": {
    "received": "Ngày nhận bài (DD-MM-YYYY nếu có)",
    "revised": "Ngày chỉnh sửa (nếu có)",
    "accepted": "Ngày chấp nhận (nếu có)",
    "published": "Ngày đăng (nếu có)"
  },
  "volume": "Tập (nếu có trong header)",
  "issue": "Số (nếu có trong header)",
  "year": "Năm (nếu có trong header)",
  "doi": "Mã DOI (nếu có trong header)",
  "firstPage": 1,
  "lastPage": 10
}

Văn bản bản thảo:
${body.text.slice(0, 6000)}`;

    const aiResponse = await callOpenAi(apiKey, model, metadataPrompt);
    return NextResponse.json({ success: true, data: aiResponse });
  } catch (error: any) {
    console.error('Error in /api/ai-extract:', error);
    return NextResponse.json(
      { error: error.message || 'Lỗi xử lý trích xuất qua OpenAI API' },
      { status: 500 }
    );
  }
}

async function callOpenAi(apiKey: string, model: string, userPrompt: string): Promise<any> {
  const payload = {
    model: model || DEFAULT_MODEL,
    messages: [
      {
        role: 'system',
        content:
          'Bạn là chuyên gia biên tập học thuật của Đại học Quốc gia TP.HCM. Luôn trả lời bằng định dạng JSON hợp lệ duy nhất, không kèm markdown backticks thừa.',
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ],
    response_format: { type: 'json_object' },
    max_completion_tokens: 3500,
  };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    // Fallback attempt: If gpt-5.4-mini parameter or rate limit occurs, try gpt-4o-mini
    if (model !== 'gpt-4o-mini') {
      console.warn(`Calling ${model} failed (${res.status}), attempting fallback to gpt-4o-mini...`);
      return callOpenAi(apiKey, 'gpt-4o-mini', userPrompt);
    }
    throw new Error(`OpenAI API Lỗi (${res.status}): ${errText}`);
  }

  const json = await res.json();
  const rawContent = json.choices?.[0]?.message?.content || '{}';
  return JSON.parse(rawContent);
}
