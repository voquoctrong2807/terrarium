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
    console.log('Received request:', { prompt: prompt?.substring(0, 100) + '...', aspect });

    const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
    if (!apiKey) {
      console.error('Missing API key');
      return res.status(500).json({
        error: "Missing GOOGLE_AI_STUDIO_API_KEY on server"
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Chỉ sử dụng model nano-banana-pro
    const modelName = "nano-banana-pro";
    console.log(`Using model: ${modelName}`);
    
    const model = genAI.getGenerativeModel({ model: modelName });
    
    const result = await model.generateContent([
      {
        text: `Tạo 1 ảnh theo mô tả sau. Tỉ lệ ảnh ${aspect}. ${prompt}`,
      },
    ]);
    
    console.log(`Success with model: ${modelName}`);

    console.log('Response structure:', JSON.stringify(result.response, null, 2).substring(0, 500));

    let imageUrl = null;

    // Try to extract image data from response - check multiple possible structures
    if (result.response?.candidates?.[0]?.content?.parts) {
      for (const part of result.response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          console.log('Found inlineData image');
          break;
        }
        if (part.text) {
          // If model returns text with image URL
          const urlMatch = part.text.match(/https?:\/\/[^\s]+/);
          if (urlMatch) {
            imageUrl = urlMatch[0];
            console.log('Found URL in text:', urlMatch[0]);
            break;
          }
        }
      }
    }

    // Try alternative response structures
    if (!imageUrl && result.response?.text) {
      const urlMatch = result.response.text.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        imageUrl = urlMatch[0];
        console.log('Found URL in response.text');
      }
    }

    if (!imageUrl) {
      console.error('No image found in response. Full response:', JSON.stringify(result.response, null, 2));
      return res.status(501).json({
        error: "Image output mapping needed for your SDK response format.",
        debug: JSON.stringify(result.response, null, 2).substring(0, 2000),
        usedModel: modelName
      });
    }

    console.log('Successfully generated image');
    return res.json({ imageUrl, model: modelName });
  } catch (e) {
    console.error('Render error:', e);
    console.error('Error stack:', e.stack);
    return res.status(500).json({ 
      error: "Render error", 
      detail: String(e),
      stack: e.stack
    });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});

