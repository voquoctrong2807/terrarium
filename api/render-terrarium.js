import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  // Chỉ cho phép POST
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const { prompt, aspect = "3:4", referenceImageDataUrl } = req.body;
    console.log('Received request:', { 
      prompt: prompt?.substring(0, 100) + '...', 
      aspect, 
      hasReference: !!referenceImageDataUrl 
    });

    const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
    if (!apiKey) {
      console.error('Missing API key');
      return res.status(500).json({
        ok: false,
        error: "Missing GOOGLE_AI_STUDIO_API_KEY"
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Cưỡng ép tỉ lệ 3:4 portrait với prompt mạnh
    const fullPrompt = `${prompt}\n\nCRITICAL REQUIREMENTS: Portrait orientation 3:4 aspect ratio. Full tank shot showing entire terrarium from top frame to base. No landscape/horizontal images. No close-up. No cropping. Include complete terrarium in frame. Vertical composition only.`;

    let response;
    
    if (referenceImageDataUrl) {
      // MULTIMODAL: có reference image
      const dataUrlMatch = referenceImageDataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!dataUrlMatch) {
        return res.status(400).json({
          ok: false,
          error: "Invalid referenceImageDataUrl format"
        });
      }

      const mimeType = dataUrlMatch[1] || "image/png";
      const base64Data = dataUrlMatch[2];

      console.log('Using reference image for multimodal generation');

      response = await ai.models.generateContent({
        model: "gemini-3-pro-image-preview",
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data
                }
              },
              {
                text: fullPrompt
              }
            ]
          }
        ],
      });
    } else {
      // TEXT-ONLY: không có reference (tạo HERO)
      response = await ai.models.generateContent({
        model: "gemini-3-pro-image-preview",
        contents: fullPrompt,
      });
    }

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

    const base64 = inline.inlineData.data;
    const mime = inline.inlineData.mimeType || "image/png";
    const dataUrl = `data:${mime};base64,${base64}`;

    console.log('Successfully generated image');
    return res.status(200).json({ ok: true, imageUrl: dataUrl });
  } catch (e) {
    console.error('Render error:', e);
    console.error('Error message:', e?.message || String(e));
    console.error('Error stack:', e?.stack);
    console.error('Error name:', e?.name);
    
    const errorDetail = e?.message || String(e);
    const errorType = e?.name || 'UnknownError';
    
    return res.status(500).json({
      ok: false,
      error: "Render error",
      detail: errorDetail,
      type: errorType
    });
  }
}

