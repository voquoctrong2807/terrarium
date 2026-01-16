import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/api/render-terrarium', async (req, res) => {
  try {
    const { prompt, aspect = "3:4" } = req.body;
    console.log('Received request:', { prompt: prompt?.substring(0, 100) + '...', aspect });

    const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
    if (!apiKey) {
      console.error('Missing API key');
      return res.status(500).json({
        ok: false,
        error: "Missing GOOGLE_AI_STUDIO_API_KEY"
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Nano Banana Pro = gemini-3-pro-image-preview
    // Cưỡng ép tỉ lệ 3:4 portrait với prompt mạnh
    const fullPrompt = `${prompt}\n\nCRITICAL REQUIREMENTS: Portrait orientation 3:4 aspect ratio. Full tank shot showing entire terrarium from top frame to base. No landscape/horizontal images. No close-up. No cropping. Include complete terrarium in frame. Vertical composition only.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: fullPrompt,
    });

    const parts = response?.candidates?.[0]?.content?.parts ?? [];
    const inline = parts.find((p) => p.inlineData?.data);

    if (!inline?.inlineData?.data) {
      console.error('No image returned. Parts:', JSON.stringify(parts, null, 2));
      return res.status(502).json({
        ok: false,
        error: "No image returned",
        debugParts: parts
      });
    }

    const base64 = inline.inlineData.data; // base64 PNG
    const mime = inline.inlineData.mimeType || "image/png";
    const dataUrl = `data:${mime};base64,${base64}`;

    console.log('Successfully generated image');
    return res.json({ ok: true, imageUrl: dataUrl });
  } catch (e) {
    console.error('Render error:', e);
    console.error('Error stack:', e.stack);
    return res.status(500).json({
      ok: false,
      error: "Render error",
      detail: String(e)
    });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});

