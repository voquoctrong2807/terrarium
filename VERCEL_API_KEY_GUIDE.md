# 🔐 Hướng dẫn Thay API Key trên Vercel

## 📋 CÁCH THAY API KEY TRÊN VERCEL

### Bước 1: Truy cập Vercel Dashboard

1. Đăng nhập vào: https://vercel.com
2. Chọn project **terrarium** (hoặc tên project của bạn)

### Bước 2: Vào Environment Variables

1. Click vào tab **"Settings"** (hoặc icon ⚙️)
2. Trong menu bên trái, click **"Environment Variables"**

### Bước 3: Xóa API Key Cũ (nếu có)

1. Tìm biến `GOOGLE_AI_STUDIO_API_KEY` trong danh sách
2. Click icon **"..."** (3 chấm) bên phải
3. Click **"Delete"** để xóa API key cũ

### Bước 4: Thêm API Key Mới

1. Click nút **"Add New"** hoặc **"Add"**
2. Điền thông tin:
   - **Key**: `GOOGLE_AI_STUDIO_API_KEY`
   - **Value**: `AIzaSyDUuz76D2glaoQiKE7XwaMO3K-XlyIRveI` (hoặc API key mới của bạn)
   - **Environment**: 
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
     - (Chọn tất cả 3 môi trường)
3. Click **"Save"**

### Bước 5: Re-deploy Project

Sau khi thêm API key mới, bạn **PHẢI re-deploy** để áp dụng:

**Cách 1: Re-deploy từ Dashboard**
1. Vào tab **"Deployments"**
2. Tìm deployment mới nhất
3. Click icon **"..."** (3 chấm) bên phải
4. Click **"Redeploy"**
5. Chọn **"Use existing Build Cache"** (nếu có)
6. Click **"Redeploy"**

**Cách 2: Push code mới**
```bash
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

### Bước 6: Kiểm tra

1. Đợi deployment hoàn tất (2-3 phút)
2. Truy cập: `https://your-project.vercel.app`
3. Test render ảnh để đảm bảo API key hoạt động

---

## ⚠️ LƯU Ý BẢO MẬT

- ✅ **KHÔNG** commit API key vào code
- ✅ **KHÔNG** chia sẻ API key công khai
- ✅ **KHÔNG** hardcode API key trong file
- ✅ Chỉ dùng Environment Variables trên Vercel
- ✅ Xóa API key cũ sau khi đã cập nhật xong

---

## 🔄 Nếu Cần Tạo API Key Mới

1. Truy cập: https://aistudio.google.com/apikey
2. Click **"Create API Key"**
3. Copy API key mới
4. Làm theo các bước trên để cập nhật trên Vercel

---

**Lưu ý:** Environment Variables chỉ áp dụng sau khi re-deploy. Nếu không re-deploy, API key cũ vẫn được sử dụng.

