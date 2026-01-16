# Hướng dẫn Deploy lên Vercel

## ⚠️ LƯU Ý QUAN TRỌNG

Project này có **2 phần**:
- **Frontend**: Vite + React (port 3000)
- **Backend**: Express API server (port 3001)

Vercel hỗ trợ deploy frontend và backend (serverless functions), nhưng cần cấu hình đúng.

---

## 📋 BƯỚC 1: Chuẩn bị

### 1.1. Tạo file `vercel.json`

Tạo file `vercel.json` ở root project với nội dung:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    }
  ]
}
```

### 1.2. Cập nhật `package.json` - thêm build script cho Vercel

Đảm bảo có script `build`:

```json
{
  "scripts": {
    "build": "vite build"
  }
}
```

### 1.3. Cập nhật `vite.config.ts` - sửa proxy cho production

Trong `vite.config.ts`, sửa proxy để không dùng localhost trong production:

```typescript
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: mode === 'development' ? {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
        },
      } : undefined, // Không dùng proxy trong production
    },
    // ... rest of config
  };
});
```

### 1.4. Cập nhật `server.js` - thêm export cho Vercel

Thêm vào cuối file `server.js`:

```javascript
// Export handler cho Vercel serverless
export default app;
```

**HOẶC** nếu dùng CommonJS, thêm:

```javascript
// Export handler cho Vercel serverless
module.exports = app;
```

---

## 📋 BƯỚC 2: Deploy trên Vercel

### 2.1. Đăng nhập Vercel

1. Truy cập: https://vercel.com
2. Đăng nhập bằng GitHub account
3. Authorize Vercel truy cập GitHub repos

### 2.2. Import Project

1. Click **"Add New..."** → **"Project"**
2. Chọn repository: `voquoctrong2807/terrarium`
3. Click **"Import"**

### 2.3. Cấu hình Project

#### Framework Preset:
- Chọn: **"Other"** hoặc **"Vite"**

#### Root Directory:
- Để trống (root)

#### Build Command:
```
npm run build
```

#### Output Directory:
```
dist
```

#### Install Command:
```
npm install
```

### 2.4. Environment Variables

Thêm biến môi trường:

1. Click **"Environment Variables"**
2. Thêm:
   - **Name**: `GOOGLE_AI_STUDIO_API_KEY`
   - **Value**: `AIza.......................` (hoặc API key của bạn)
   - **Environment**: Chọn tất cả (Production, Preview, Development)

3. Click **"Save"**

### 2.5. Deploy

1. Click **"Deploy"**
2. Đợi build hoàn tất (2-3 phút)
3. Kiểm tra logs nếu có lỗi

---

## 📋 BƯỚC 3: Kiểm tra sau khi deploy

### 3.1. Test API endpoint

Truy cập: `https://your-project.vercel.app/api/render-terrarium`

Nếu thấy lỗi 404 hoặc 500, kiểm tra:
- Environment variables đã set chưa
- `vercel.json` đã đúng chưa
- Serverless function đã build chưa

### 3.2. Test Frontend

Truy cập: `https://your-project.vercel.app`

Kiểm tra:
- UI load được không
- Click "Render 4 góc" xem API có hoạt động không

---

## 🔧 TROUBLESHOOTING

### Lỗi: "Cannot find module '@vercel/node'"

**Giải pháp**: Cài đặt package:

```bash
npm install --save-dev @vercel/node
```

### Lỗi: API route trả về 404

**Nguyên nhân**: Route không match hoặc serverless function chưa được tạo.

**Giải pháp**:
1. Kiểm tra `vercel.json` routes
2. Đảm bảo `server.js` export đúng
3. Re-deploy

### Lỗi: "Missing GOOGLE_AI_STUDIO_API_KEY"

**Giải pháp**: 
1. Vào Vercel Dashboard → Project Settings → Environment Variables
2. Thêm `GOOGLE_AI_STUDIO_API_KEY`
3. Re-deploy

### Lỗi: Build failed

**Kiểm tra**:
- Logs trong Vercel Dashboard
- `package.json` có script `build` không
- Dependencies đã install đúng chưa

---

## 🎯 CÁCH 2: Deploy riêng Frontend + Backend (Khuyến nghị)

Nếu cách trên không hoạt động, có thể:

### Frontend (Vercel):
- Deploy như Vite app bình thường
- API calls sẽ gọi đến backend riêng

### Backend (Railway/Render/Heroku):
- Deploy Express server riêng
- Update frontend API URL trong `vite.config.ts` hoặc dùng env variable

---

## 📝 NOTES

- Vercel có giới hạn function execution time (10s free, 60s pro)
- Nếu render ảnh mất > 10s, có thể cần upgrade plan
- Có thể dùng Vercel Edge Functions để tối ưu
- Environment variables cần re-deploy sau khi thay đổi

---

## ✅ CHECKLIST

- [ ] Tạo `vercel.json`
- [ ] Cập nhật `vite.config.ts` (bỏ proxy trong production)
- [ ] Cập nhật `server.js` (export handler)
- [ ] Thêm `GOOGLE_AI_STUDIO_API_KEY` vào Vercel Environment Variables
- [ ] Deploy trên Vercel
- [ ] Test API endpoint
- [ ] Test Frontend UI
- [ ] Test render ảnh

---

**Chúc bạn deploy thành công! 🚀**

