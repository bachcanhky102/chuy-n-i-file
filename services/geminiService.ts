import { GoogleGenAI } from "@google/genai";
import { FileData } from "../types";

// Initialize the Gemini API client
// Note: process.env.API_KEY is injected by the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const convertFileToWordContent = async (file: FileData): Promise<string> => {
  try {
    const modelId = 'gemini-2.5-flash'; 

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.mimeType,
              data: file.data
            }
          },
          {
            text: `Bạn là một chuyên gia OCR và chuyển đổi tài liệu văn phòng. 
            Nhiệm vụ: Chuyển đổi toàn bộ nội dung trong hình ảnh/PDF này thành văn bản định dạng phong phú (Rich Text) để người dùng có thể Copy & Paste trực tiếp vào Microsoft Word.

            YÊU CẦU QUAN TRỌNG VỀ ĐỊNH DẠNG:
            1. VĂN BẢN THUẦN TÚY: Không được sử dụng Markdown Code Blocks (ví dụ: \`\`\`markdown ... \`\`\`). Hãy trả về text thô đã định dạng.
            2. CẤU TRÚC:
               - Giữ nguyên các tiêu đề (Heading) sử dụng dấu #.
               - Giữ nguyên định dạng danh sách (List -/1.), in đậm (**text**), in nghiêng (*text*).
            3. BẢNG BIỂU (QUAN TRỌNG):
               - Bắt buộc phải dựng lại thành Markdown Table chuẩn (| Col 1 | Col 2 |).
               - Tuyệt đối không mô tả bảng bằng lời, hãy vẽ lại bảng.
            4. HÌNH ẢNH / BIỂU ĐỒ / SƠ ĐỒ TRONG TÀI LIỆU:
               - Vì bạn là AI văn bản và không thể cắt (crop) file ảnh gốc để trả về file ảnh con.
               - HÃY MÔ TẢ CHI TIẾT hình ảnh đó trong một khối trích dẫn hoặc ngoặc vuông để người dùng biết.
               - Ví dụ: > *[HÌNH ẢNH: Biểu đồ cột thể hiện doanh thu, cột cao nhất là năm 2024 với 50 tỷ]*
               - Nếu là sơ đồ quy trình, hãy chuyển nó thành dạng danh sách các bước hoặc Text Art đơn giản nếu có thể.
            5. CÔNG THỨC TOÁN:
               - Sử dụng định dạng LaTeX đặt trong dấu $.
            6. KHÔNG BÌNH LUẬN THÊM:
               - Không thêm lời dẫn như "Đây là kết quả...", "Dưới đây là nội dung...".
               - Chỉ trả về nội dung chính xác của tài liệu.`
          }
        ]
      }
    });

    let text = response.text || "Không thể trích xuất văn bản từ tài liệu này.";
    
    // Clean up: Remove markdown code fences if Gemini adds them despite instructions
    // This regex removes ```markdown or ``` at the start and ``` at the end
    text = text.replace(/^```[a-z]*\n/i, '').replace(/^```\n/, '').replace(/\n```$/, '');
    
    return text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Đã có lỗi xảy ra khi xử lý tài liệu. Vui lòng kiểm tra lại file hoặc thử lại sau.");
  }
};