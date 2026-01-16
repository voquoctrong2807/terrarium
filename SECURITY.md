# 🔒 Security Notice - API Key Leaked

## ⚠️ VẤN ĐỀ

API key của bạn đã bị Google phát hiện là **LEAKED** và đã bị vô hiệu hóa:
```
Error: Your API key was reported as leaked. Please use another API key.
```

## ✅ GIẢI PHÁP

### Bước 1: Tạo API Key Mới

1. Truy cập: https://aistudio.google.com/apikey
2. Click **"Create API Key"**
3. Chọn project hoặc tạo project mới
4. Copy API key mới

### Bước 2: Cập nhật API Key

**Local Development:**
1. Mở file `.env.local` (nếu chưa có thì tạo mới)
2. Cập nhật:
   ```env
   GOOGLE_AI_STUDIO_API_KEY=YOUR_NEW_API_KEY_HERE
   ```
3. **KHÔNG commit file này lên GitHub!**

**Vercel Deployment:**
1. Vào Vercel Dashboard → Project Settings → Environment Variables
2. Xóa API key cũ (nếu có)
3. Thêm API key mới:
   - Name: `GOOGLE_AI_STUDIO_API_KEY`
   - Value: `YOUR_NEW_API_KEY_HERE`
   - Environment: Production, Preview, Development
4. Re-deploy project

### Bước 3: Kiểm tra Bảo mật

✅ **Đã được bảo vệ:**
- File `.env.local` đã có trong `.gitignore` (dòng `*.local`)
- API key không được hardcode trong code
- Chỉ đọc từ environment variables

⚠️ **Cần lưu ý:**
- **KHÔNG** commit `.env.local` lên GitHub
- **KHÔNG** hardcode API key trong code
- **KHÔNG** chia sẻ API key công khai
- Nếu đã commit API key vào git history, cần xóa và tạo key mới

## 🛡️ Best Practices

1. **Luôn dùng Environment Variables:**
   ```javascript
   const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
   ```

2. **Gitignore đúng cách:**
   ```
   *.local
   .env.local
   .env
   ```

3. **Kiểm tra trước khi commit:**
   ```bash
   git diff
   # Đảm bảo không có API key trong diff
   ```

4. **Rotate API keys định kỳ:**
   - Nếu nghi ngờ leak, tạo key mới ngay
   - Xóa key cũ sau khi đã cập nhật xong

## 📝 Checklist

- [ ] Tạo API key mới từ Google AI Studio
- [ ] Cập nhật `.env.local` (local)
- [ ] Cập nhật Vercel Environment Variables (production)
- [ ] Test lại ứng dụng
- [ ] Xóa API key cũ (nếu có thể)
- [ ] Kiểm tra git history không có API key

---

**Lưu ý:** API key cũ đã bị vô hiệu hóa vĩnh viễn, không thể sử dụng lại.

