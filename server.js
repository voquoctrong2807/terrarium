import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/api/render-terrarium', async (req, res) => {
  try {
    const { prompt, aspect = "3:4" } = req.body;

    const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "Missing GOOGLE_AI_STUDIO_API_KEY on server"
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // NOTE: Tên model cần đúng theo model bạn có quyền dùng trong AI Studio.
    // Bạn yêu cầu "nano banana pro" — hãy đặt đúng string model tương ứng ở tài khoản bạn.
    const model = genAI.getGenerativeModel({ model: "nano-banana-pro" });

    // PSEUDO: phần trả ảnh tùy SDK phiên bản + model image. Nếu SDK bạn trả base64:
    const result = await model.generateContent([
      {
        text: `Tạo 1 ảnh theo mô tả sau. Tỉ lệ ảnh ${aspect}. ${prompt}`,
      },
    ]);

    // TODO: Map output đúng định dạng từ SDK bạn đang dùng.
    // Ở đây mình trả placeholder để bạn thay đúng field ảnh (base64/url) theo response thật.
    // Ví dụ nếu có base64: const imageBase64 = result.response.candidates[0].content.parts.find(p=>p.inlineData)?.inlineData?.data
    let imageUrl = null;

    // Try to extract image data from response
    if (result.response?.candidates?.[0]?.content?.parts) {
      for (const part of result.response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          break;
        }
        if (part.text) {
          // If model returns text with image URL
          const urlMatch = part.text.match(/https?:\/\/[^\s]+/);
          if (urlMatch) {
            imageUrl = urlMatch[0];
            break;
          }
        }
      }
    }

    if (!imageUrl) {
      return res.status(501).json({
        error: "Image output mapping needed for your SDK response format.",
        debug: JSON.stringify(result.response, null, 2)
      });
    }

    return res.json({ imageUrl });
  } catch (e) {
    console.error('Render error:', e);
    return res.status(500).json({ 
      error: "Render error", 
      detail: String(e) 
    });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});

