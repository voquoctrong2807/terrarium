# 🌿 Terrarium Idea Builder

Ứng dụng AI tạo ảnh terrarium từ nhiều góc nhìn khác nhau, sử dụng Google Gemini AI (gemini-3-pro-image-preview) để generate ảnh theo yêu cầu.

## ✨ Tính năng

- **Tạo 4 góc nhìn**: Chính diện, Trái, Dưới, Trên
- **Tùy chỉnh đầy đủ**: Hình dáng hồ, vật liệu khung, chủ đề, hardscape, thực vật, ánh sáng, mood
- **Custom inputs**: Nhập tùy chỉnh cho mọi option (hình dáng, khung, chủ đề, hardscape, ánh sáng, mood, thực vật)
- **Progress bar**: Hiển thị % tiến độ render cho từng ảnh
- **HERO + REF flow**: Render ảnh chính diện trước, sau đó dùng làm reference để render 3 góc còn lại đảm bảo đồng nhất
- **Portrait 3:4**: Tất cả ảnh được generate ở tỉ lệ dọc 3:4
- **Full tank shot**: Ảnh luôn hiển thị trọn hồ terrarium, không crop

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm hoặc yarn
- Google AI Studio API key

### Installation

1. **Clone repository:**
   ```bash
   git clone https://github.com/voquoctrong2807/terrarium.git
   cd terrarium
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Tạo file `.env.local`** trong thư mục root:
   ```env
   GOOGLE_AI_STUDIO_API_KEY=AIzaSy...YOUR_KEY...
   ```
   
   **Lưu ý:** File `.env.local` đã có trong `.gitignore` và sẽ không được commit.

4. **Chạy ứng dụng:**
   ```bash
   npm run dev:all
   ```
   
   Hoặc chạy riêng trong 2 terminal:
   ```bash
   # Terminal 1: Vite dev server (port 3000)
   npm run dev
   
   # Terminal 2: API server (port 3001)
   npm run dev:server
   ```

5. **Mở browser:**
   ```
   http://localhost:3000
   ```

## 📁 Cấu trúc Project

```
terrarium/
├── api/
│   └── render-terrarium.js    # Vercel serverless function
├── App.tsx                    # Main React component
├── server.js                  # Express API server (local dev)
├── vite.config.ts             # Vite configuration
├── vercel.json                # Vercel deployment config
├── package.json
└── README.md
```

## 🎨 Sử dụng

1. **Chọn các tùy chọn:**
   - Hình dáng hồ (đứng chữ nhật, cube, panorama, bowl, hoặc Custom)
   - Vật liệu khung (gỗ walnut, kim loại đen, không khung, hoặc Custom)
   - Chủ đề (rừng nhiệt đới, Zen Nhật, rừng cổ tích, núi đá, hoặc Custom)
   - Hardscape chính (lũa xoắn, vách đá, vòm rễ, thác nước, hoặc Custom)
   - Thực vật (chọn nhiều, có thể thêm Custom)
   - Mật độ cây (slider 10-100%)
   - Ánh sáng (vàng ấm, trung tính, trắng lạnh, hoặc Custom)
   - Mood (tĩnh lặng, huyền bí, sang trọng, hoang sơ, hoặc Custom)

2. **Click "Render 4 góc":**
   - Ảnh chính diện (HERO) sẽ được render trước
   - Sau đó 3 ảnh còn lại (Trái, Dưới, Trên) sẽ render song song với reference từ HERO
   - Progress bar hiển thị % tiến độ cho từng ảnh

3. **Xem ảnh full:**
   - Click vào bất kỳ ảnh preview nào để xem full screen
   - Modal hiển thị ảnh ở tỉ lệ dọc 3:4

4. **Copy prompt:**
   - Click "Copy Prompt" để copy prompt đã build sẵn

## 🌐 Deploy lên Vercel

Xem hướng dẫn chi tiết trong file [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)

### Tóm tắt:

1. **Import project** trên Vercel từ GitHub repo
2. **Cấu hình:**
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Thêm Environment Variable:**
   - `GOOGLE_AI_STUDIO_API_KEY` = API key của bạn
4. **Deploy**

**Lưu ý:** Vercel free plan có giới hạn function execution time 10s. Nếu render mất > 10s, có thể cần upgrade plan.

## 🔧 API

### Endpoint: `/api/render-terrarium`

**Method:** POST

**Request Body:**
```json
{
  "prompt": "string",
  "aspect": "3:4",
  "referenceImageDataUrl": "data:image/jpeg;base64,..." // Optional
}
```

**Response:**
```json
{
  "ok": true,
  "imageUrl": "data:image/png;base64,..."
}
```

**Error Response:**
```json
{
  "ok": false,
  "error": "Error message",
  "detail": "Error detail",
  "type": "ErrorType"
}
```

## ⚙️ Tối ưu hóa

- **Reference image compression**: Tự động nén xuống 512px, quality 0.5 để tăng tốc
- **Prompt optimization**: Prompt ngắn gọn cho reference-based images
- **Timeout**: 30s timeout cho mỗi request để tránh treo
- **Parallel rendering**: 3 ảnh reference render song song

## 🐛 Troubleshooting

### Lỗi: "Missing GOOGLE_AI_STUDIO_API_KEY"
- Kiểm tra file `.env.local` đã tạo chưa
- Đảm bảo API key đúng format

### Lỗi: "Render error" hoặc timeout
- Kiểm tra API key còn valid không
- Kiểm tra quota/rate limit của Google AI Studio
- Thử giảm kích thước reference image (trong code)

### Lỗi: "Payload too large"
- Reference image đã được tự động nén, nhưng nếu vẫn lỗi, có thể cần giảm thêm kích thước

### Ảnh không đồng nhất
- Đảm bảo HERO render thành công trước
- Kiểm tra reference image đã được nén và gửi đúng chưa

## 📝 Scripts

- `npm run dev` - Chạy Vite dev server (port 3000)
- `npm run dev:server` - Chạy Express API server (port 3001)
- `npm run dev:all` - Chạy cả frontend và backend cùng lúc
- `npm run build` - Build production
- `npm run preview` - Preview production build

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Backend:** Express.js, Node.js
- **AI:** Google Gemini AI (@google/genai)
- **Model:** gemini-3-pro-image-preview (Nano Banana Pro)
- **Deployment:** Vercel (frontend + serverless functions)

## 📄 License

MIT

## 👤 Author

[voquoctrong2807](https://github.com/voquoctrong2807)

---

**Chúc bạn tạo được những terrarium đẹp! 🌿✨**
