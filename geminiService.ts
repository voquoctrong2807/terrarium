import { TerrariumConfig, RenderResult } from "./types";

export class GeminiService {
  private constructBasePrompt(config: TerrariumConfig): string {
    const plantsStr = config.plants.length > 0 ? config.plants.join(", ") : "rêu và dương xỉ tự nhiên";
    const gundamDesc = config.plants.includes("Gundam model") 
      ? `Mô hình Gundam: được đặt như một yếu tố trang trí ${config.gundamFocus ? 'điểm nhấn chính' : 'phụ'}, tỷ lệ hài hòa với cảnh quan, không lấn át bố cục tự nhiên.`
      : "";

    return `Một hồ terrarium ${config.shape}, khung ${config.frame}, phong cách ${config.theme}. 
      Bố cục bên trong gồm hardscape chính là ${config.hardscape}, sắp xếp có chiều sâu rõ ràng foreground – midground – background. 
      Hệ thực vật gồm ${plantsStr}, mật độ tổng thể khoảng ${config.density}%. 
      ${gundamDesc}
      Nền hồ gồm đất, sỏi, đá và rêu tự nhiên. 
      Ánh sáng ${config.lighting}, mood tổng thể ${config.mood}. 
      Phong cách hình ảnh siêu chân thực, photorealistic, high detail, texture vật liệu thật, ánh sáng mềm, độ sâu trường ảnh nông, bố cục gọn gàng, không hoạt hình.`;
  }

  async renderAngles(config: TerrariumConfig, onUpdate: (partial: Partial<RenderResult>) => void): Promise<void> {
    const basePrompt = this.constructBasePrompt(config);
    onUpdate({ basePrompt });

    const angleModifiers = {
      front: "Góc chụp chính diện, ngang tầm mắt, thấy rõ toàn bộ hồ terrarium và bố cục tổng thể.",
      left: "Góc chụp từ bên trái, nhấn mạnh chiều sâu, các lớp hardscape và cây theo trục ngang.",
      low: "Góc chụp thấp từ bên dưới nhìn lên (low angle), tạo cảm giác không gian và chiều cao của bố cục.",
      top: "Góc chụp từ trên xuống (top-down), thấy rõ layout hardscape, vị trí cây và mô hình Gundam trong tổng thể."
    };

    const keys = Object.keys(angleModifiers) as (keyof typeof angleModifiers)[];

    // Call API route instead of direct SDK
    await Promise.all(keys.map(async (key) => {
      try {
        const fullPrompt = `${basePrompt} ${angleModifiers[key]}`;
        const imageUrl = await this.generateImage(fullPrompt, config.aspectRatio);
        onUpdate({ [key]: imageUrl });
      } catch (error) {
        console.error(`Error rendering angle ${key}:`, error);
        onUpdate({ [key]: 'ERROR' });
      }
    }));
  }

  private async generateImage(prompt: string, aspectRatio: string): Promise<string> {
    const res = await fetch("/api/render-terrarium", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, aspect: aspectRatio }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to generate image");
    }

    if (!data.imageUrl) {
      throw new Error("No image URL returned from API");
    }

    return data.imageUrl;
  }
}
