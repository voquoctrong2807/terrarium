"use client";
import React, { useMemo, useState } from "react";
import { GeminiService } from './geminiService';
import { TerrariumConfig, RenderResult, LoadingPhase } from './types';

const service = new GeminiService();

const OPTIONS = {
  shape: [
    { value: "standing-rect", label: "Hồ đứng chữ nhật" },
    { value: "cube", label: "Hồ cube" },
    { value: "panorama", label: "Hồ panorama (ngang)" },
    { value: "bowl", label: "Hồ bowl (tròn)" },
  ],
  frame: [
    { value: "walnut-wood", label: "Khung gỗ walnut" },
    { value: "black-metal", label: "Khung kim loại đen" },
    { value: "frameless", label: "Kính không khung" },
  ],
  theme: [
    { value: "tropical-forest", label: "Rừng nhiệt đới" },
    { value: "zen-japan", label: "Zen Nhật" },
    { value: "fantasy", label: "Rừng cổ tích" },
    { value: "mountain-rock", label: "Núi đá" },
  ],
  hardscape: [
    { value: "twisted-driftwood", label: "Lũa xoắn (điểm nhấn)" },
    { value: "stone-cliff", label: "Vách đá / đá tai mèo" },
    { value: "root-arch", label: "Vòm rễ / cổng lũa" },
    { value: "mini-waterfall", label: "Thác nước mini" },
  ],
  plants: [
    { value: "moss", label: "Rêu nền" },
    { value: "fern", label: "Dương xỉ" },
    { value: "anthurium", label: "Anthurium (lá gân trắng)" },
    { value: "mini-shrubs", label: "Cây bụi mini" },
    { value: "air-plants", label: "Air plant" },
    { value: "gundam-model", label: "Mô hình Gundam" },
  ],
  lighting: [
    { value: "warm", label: "Vàng ấm" },
    { value: "neutral", label: "Trung tính" },
    { value: "cool", label: "Trắng lạnh" },
  ],
  mood: [
    { value: "calm-zen", label: "Tĩnh lặng / zen" },
    { value: "mysterious", label: "Huyền bí" },
    { value: "luxury", label: "Sang trọng" },
    { value: "wild", label: "Hoang sơ" },
  ],
  aspect: [
    { value: "3:4", label: "3:4" },
    { value: "4:5", label: "4:5" },
    { value: "1:1", label: "1:1" },
    { value: "16:9", label: "16:9" },
  ],
};

const VIEWS = [
  { key: "front", title: "Chính diện", suffix: "Góc chính diện, ngang tầm mắt, full tank shot.", isHero: true },
  { key: "left", title: "Trái", suffix: "Góc trái, vẫn full tank shot, giữ nguyên mọi thứ như ảnh reference.", isHero: false },
  { key: "low", title: "Dưới", suffix: "Góc thấp từ dưới nhìn lên, vẫn full tank shot, giữ nguyên như reference.", isHero: false },
  { key: "top", title: "Trên", suffix: "Góc từ trên xuống nhưng vẫn thấy trọn hồ trong khung (không zoom), giữ nguyên như reference.", isHero: false },
];

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: typeof OPTIONS.shape }) {
  return (
    <label style={{ display: "grid", gap: 4 }}>
      <div style={{ fontSize: 11, color: "#374151", fontWeight: 600 }}>{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "8px 10px",
          height: "38px",
          borderRadius: 10,
          border: "1px solid #d1d5db",
          background: "#ffffff",
          color: "#111827",
          fontSize: 13,
          outline: "none",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#16a34a";
          e.target.style.boxShadow = "0 0 0 3px rgba(22,163,74,0.15)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#d1d5db";
          e.target.style.boxShadow = "none";
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function CheckboxList({ label, values, onToggle, options }: { label: string; values: string[]; onToggle: (v: string) => void; options: typeof OPTIONS.plants }) {
  return (
    <div style={{ display: "grid", gap: 4 }}>
      <div style={{ fontSize: 11, color: "#374151", fontWeight: 600 }}>{label}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {options.map((o) => {
          const checked = values.includes(o.value);
          return (
            <label
              key={o.value}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 8px",
                height: "36px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                background: checked ? "#f0fdf4" : "white",
                cursor: "pointer",
              }}
            >
              <input type="checkbox" checked={checked} onChange={() => onToggle(o.value)} style={{ width: "14px", height: "14px" }} />
              <span style={{ fontSize: 12, color: "#111827" }}>{o.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function PreviewCard({ title, src, loading, onOpen }: { title: string; src: string; loading: boolean; onOpen: (src: string) => void }) {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, background: "white", overflow: "hidden", boxShadow: "0 4px 12px rgba(17,24,39,0.05)", height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ 
        padding: "6px 10px", 
        fontSize: 12, 
        fontWeight: 700, 
        color: "#111827",
        background: "#fafafa",
        borderBottom: "1px solid #eef2f7",
        height: "28px",
        display: "flex",
        alignItems: "center",
      }}>
        {title}
      </div>

      {/* KHUNG DỌC 3:4 với object-contain */}
      <div
        style={{
          width: "100%",
          flex: 1,
          minHeight: 0,
          background: "#f1f5f9",
          position: "relative",
          overflow: "hidden",
          cursor: src && !src.startsWith('ERROR:') ? "zoom-in" : "default",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "8px",
        }}
        onClick={() => src && !src.startsWith('ERROR:') && onOpen(src)}
        title={src && !src.startsWith('ERROR:') ? "Bấm để xem full" : ""}
      >
        <div style={{ 
          width: "100%", 
          aspectRatio: "3 / 4", 
          position: "relative",
          background: "#f1f5f9",
        }}>
          {src ? (
            src.startsWith('ERROR:') ? (
              <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#dc2626", fontSize: 11, padding: 10, textAlign: "center" }}>
                {src}
              </div>
            ) : (
              <img
                src={src}
                alt={title}
                style={{ 
                  width: "100%", 
                  height: "100%", 
                  objectFit: "contain", 
                  display: "block" 
                }}
              />
            )
          ) : (
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#64748b", fontSize: 12 }}>
              Chưa có ảnh
            </div>
          )}

          {loading && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(255,255,255,0.7)",
                display: "grid",
                placeItems: "center",
                fontWeight: 800,
                color: "#111827",
                fontSize: 12,
              }}
            >
              Rendering…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ImageModal({ src, onClose }: { src: string | null; onClose: () => void }) {
  if (!src) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
        display: "grid",
        placeItems: "center",
        zIndex: 9999,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "min(900px, 95vw)",
          maxHeight: "90vh",
          background: "white",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        <img src={src} alt="full" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        <div style={{ padding: 10, display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #e5e7eb", background: "white", fontWeight: 700, cursor: "pointer" }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const [shape, setShape] = useState(OPTIONS.shape[0].value);
  const [frame, setFrame] = useState(OPTIONS.frame[0].value);
  const [theme, setTheme] = useState(OPTIONS.theme[0].value);
  const [hardscape, setHardscape] = useState(OPTIONS.hardscape[0].value);
  const [plants, setPlants] = useState(["moss", "fern"]);
  const [density, setDensity] = useState(70);
  const [lighting, setLighting] = useState("warm");
  const [mood, setMood] = useState("calm-zen");
  const [aspect, setAspect] = useState("3:4");
  const [gundamMain, setGundamMain] = useState(false);

  const [images, setImages] = useState({ front: "", left: "", low: "", top: "" });
  const [loading, setLoading] = useState({ front: false, left: false, low: false, top: false });
  const [activeImg, setActiveImg] = useState<string | null>(null);

  const labelOf = (group: typeof OPTIONS.shape, v: string) => group.find((x) => x.value === v)?.label ?? v;

  const basePrompt = useMemo(() => {
    const plantLabels = plants.map((p) => labelOf(OPTIONS.plants, p)).join(", ");
    const hasGundam = plants.includes("gundam-model");
    const gundamLine = hasGundam
      ? `Mô hình Gundam được đặt như ${gundamMain ? "điểm nhấn chính" : "chi tiết trang trí phụ"}, tỷ lệ hài hòa với cảnh quan, chất liệu mô hình thật, không lấn át thiên nhiên.`
      : "";

    return [
      `Một hồ terrarium ${labelOf(OPTIONS.shape, shape)}, ${labelOf(OPTIONS.frame, frame)}, theo chủ đề ${labelOf(OPTIONS.theme, theme)}.`,
      `Hardscape chính: ${labelOf(OPTIONS.hardscape, hardscape)}. Bố cục có chiều sâu foreground–midground–background rõ ràng.`,
      `Thực vật: ${plantLabels}. Mật độ tổng thể khoảng ${density}%.`,
      gundamLine,
      `Nền hồ gồm đất, sỏi, đá và rêu tự nhiên. Ánh sáng ${labelOf(OPTIONS.lighting, lighting)}, mood ${labelOf(OPTIONS.mood, mood)}.`,
      `Phong cách ảnh: photorealistic, ultra realistic, high detail, texture vật liệu thật, ánh sáng mềm, DOF nông, bố cục gọn gàng, không hoạt hình, không minh họa.`,
      `Cùng một hồ, cùng bố cục, chỉ thay góc chụp.`,
      `Chụp toàn cảnh (wide full view), full tank shot, include entire glass terrarium from top frame to base, centered composition.`,
      `Ảnh dọc portrait 3:4. Full tank shot: thấy trọn hồ terrarium từ viền trên đến chân đế. Bố cục nằm giữa khung. KHÔNG ảnh ngang. KHÔNG cận cảnh. KHÔNG crop. Không chụp cận cảnh, không macro, không close-up, không chỉ chụp phần ngọn, không crop.`,
    ].filter(Boolean).join(" ");
  }, [shape, frame, theme, hardscape, plants, density, lighting, mood, aspect, gundamMain]);

  const togglePlant = (v: string) => {
    setPlants((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  };

  // Nén ảnh trước khi gửi reference
  async function compressDataUrl(dataUrl: string, maxSize: number = 768, quality: number = 0.7): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Scale theo maxSize (chiều dài lớn nhất)
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataUrl;
    });
  }

  async function render4() {
    // Bật loading cùng lúc
    setLoading({ front: true, left: true, low: true, top: true });

    try {
      // STEP 1: Render HERO (front) trước
      const heroView = VIEWS.find(v => v.key === "front")!;
      const heroPrompt = `${basePrompt} ${heroView.suffix} Ảnh dọc portrait tỉ lệ 3:4. Full tank shot: thấy TRỌN hồ terrarium từ viền trên đến chân đế. KHÔNG ảnh ngang. KHÔNG close-up. KHÔNG crop. REQUIRED: portrait orientation 3:4. include entire terrarium. no close-up. no cropping.`;

      const heroRes = await fetch("/api/render-terrarium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: heroPrompt, aspect: "3:4" }),
      });

      const heroText = await heroRes.text();
      let heroData: any = null;
      
      // Kiểm tra nếu response là HTML (payload too large)
      if (heroText.trim().startsWith('<!DOCTYPE html') || heroText.trim().startsWith('<html')) {
        throw new Error('Payload too large / Server limit exceeded');
      }

      try {
        heroData = heroText ? JSON.parse(heroText) : null;
      } catch {
        heroData = null;
      }

      if (!heroRes.ok || !heroData?.ok || !heroData?.imageUrl) {
        throw new Error(`Render HERO failed: ${heroData?.error || 'Unknown error'}`);
      }

      // Lưu HERO image
      setImages((prev) => ({ ...prev, front: heroData.imageUrl }));
      setLoading((prev) => ({ ...prev, front: false }));

      // Nén ảnh HERO trước khi dùng làm reference
      const heroImageUrl = heroData.imageUrl;
      const compressedRef = await compressDataUrl(heroImageUrl, 768, 0.7);

      // STEP 2: Render 3 ảnh còn lại SONG SONG với reference image
      const refViews = VIEWS.filter(v => !v.isHero);
      const refJobs = refViews.map(async (v) => {
        const refPrompt = `${basePrompt} ${v.suffix} GIỮ NGUYÊN 100% bố cục, cây, lũa, đá như ảnh reference. Chỉ thay góc chụp/camera. Không thêm/bớt chi tiết. Ảnh dọc portrait tỉ lệ 3:4. Full tank shot: thấy TRỌN hồ terrarium từ viền trên đến chân đế. KHÔNG ảnh ngang. KHÔNG close-up. KHÔNG crop. REQUIRED: portrait orientation 3:4. include entire terrarium. no close-up. no cropping.`;

        const res = await fetch("/api/render-terrarium", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            prompt: refPrompt, 
            aspect: "3:4",
            referenceImageDataUrl: compressedRef 
          }),
        });

        const text = await res.text();
        
        // Kiểm tra nếu response là HTML (payload too large)
        if (text.trim().startsWith('<!DOCTYPE html') || text.trim().startsWith('<html')) {
          throw new Error('Payload too large / Server limit exceeded');
        }

        let data: any = null;
        try {
          data = text ? JSON.parse(text) : null;
        } catch {
          data = null;
        }

        if (!res.ok || !data?.ok || !data?.imageUrl) {
          throw new Error(`Render ${v.key} failed: ${data?.error || 'Unknown error'}`);
        }

        return { key: v.key, url: data.imageUrl };
      });

      const refResults = await Promise.allSettled(refJobs);

      const nextImages: any = {};
      refResults.forEach((r, index) => {
        if (r.status === "fulfilled") {
          nextImages[r.value.key] = r.value.url;
        } else {
          console.error(r.reason);
          const key = refViews[index].key;
          nextImages[key] = `ERROR: ${r.reason?.message || 'Unknown error'}`;
        }
      });

      setImages((prev) => ({ ...prev, ...nextImages }));
      setLoading({ front: false, left: false, low: false, top: false });
    } catch (error: any) {
      console.error("Render error:", error);
      setImages((prev) => ({ ...prev, front: `ERROR: ${error.message || 'Unknown error'}` }));
      setLoading({ front: false, left: false, low: false, top: false });
    }
  }

  const [showPrompt, setShowPrompt] = useState(false);

  return (
    <>
      <style>{`
        html, body, #root {
          height: 100%;
          overflow: hidden;
          margin: 0;
          padding: 0;
        }
        body {
          color: #111827;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        }
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          height: 5px;
          background: #e5e7eb;
          border-radius: 3px;
          outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: #16a34a;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #16a34a;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
      <div style={{ height: "100vh", display: "grid", gridTemplateColumns: "340px 1fr", background: "#f6f7fb", overflow: "hidden" }}>
      <aside style={{ 
        padding: "12px 14px", 
        borderRight: "1px solid #e5e7eb", 
        background: "#ffffff", 
        overflow: "hidden",
        border: "1px solid #e5e7eb",
        borderRadius: "0 12px 12px 0",
        boxShadow: "0 4px 12px rgba(17,24,39,0.05)",
        display: "flex",
        flexDirection: "column",
      }}>
        <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 10, color: "#111827" }}>Terrarium Idea Builder</div>

        <div style={{ display: "grid", gap: 8, flex: 1, overflow: "hidden", paddingRight: "4px" }}>
          <Select label="Hình dáng hồ" value={shape} onChange={setShape} options={OPTIONS.shape} />

          <Select label="Vật liệu khung" value={frame} onChange={setFrame} options={OPTIONS.frame} />

          <Select label="Chủ đề" value={theme} onChange={setTheme} options={OPTIONS.theme} />

          <Select label="Hardscape chính" value={hardscape} onChange={setHardscape} options={OPTIONS.hardscape} />

          <CheckboxList label="Thực vật (chọn nhiều)" values={plants} onToggle={togglePlant} options={OPTIONS.plants} />

          <label style={{ display: "grid", gap: 4 }}>
            <div style={{ fontSize: 11, color: "#374151", fontWeight: 600 }}>Mật độ cây: {density}%</div>
            <input 
              type="range" 
              min="10" 
              max="100" 
              value={density} 
              onChange={(e) => setDensity(Number(e.target.value))}
              style={{
                accentColor: "#16a34a",
              }}
            />
          </label>

          <label style={{ 
            display: "flex", 
            gap: 8, 
            alignItems: "center", 
            padding: "6px 8px", 
            height: "36px",
            border: "1px solid #d1d5db", 
            borderRadius: 8,
            background: "#ffffff",
          }}>
            <input type="checkbox" checked={gundamMain} onChange={(e) => setGundamMain(e.target.checked)} style={{ width: "14px", height: "14px" }} />
            <span style={{ fontSize: 12, color: "#111827" }}>Gundam là điểm nhấn chính</span>
          </label>

          <Select label="Ánh sáng" value={lighting} onChange={setLighting} options={OPTIONS.lighting} />

          <Select label="Mood" value={mood} onChange={setMood} options={OPTIONS.mood} />

          <Select label="Tỉ lệ ảnh" value={aspect} onChange={setAspect} options={OPTIONS.aspect} />

          <button
            onClick={() => navigator.clipboard.writeText(basePrompt)}
            style={{ 
              padding: "10px 12px", 
              height: "38px",
              borderRadius: 10, 
              border: "1px solid #16a34a", 
              background: "#16a34a", 
              color: "white", 
              fontWeight: 700, 
              fontSize: 13,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#15803d";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#16a34a";
            }}
          >
            Copy Prompt
          </button>

          <button
            onClick={render4}
            style={{ 
              padding: "10px 12px", 
              height: "38px",
              borderRadius: 10, 
              border: "1px solid #0ea5e9", 
              background: "#0ea5e9", 
              color: "white", 
              fontWeight: 700, 
              fontSize: 13,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#0284c7";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#0ea5e9";
            }}
          >
            Render 4 góc
          </button>
        </div>
      </aside>

      <main style={{ padding: 12, overflow: "hidden", display: "flex", flexDirection: "column", height: "100vh" }}>
        <ImageModal src={activeImg} onClose={() => setActiveImg(null)} />
        
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr", 
          gridTemplateRows: "1fr 1fr",
          gap: 12, 
          flex: 1,
          minHeight: 0,
        }}>
          {VIEWS.map((v) => (
            <PreviewCard
              key={v.key}
              title={v.title}
              src={images[v.key as keyof typeof images] || ""}
              loading={!!loading[v.key as keyof typeof loading]}
              onOpen={(src: string) => setActiveImg(src)}
            />
          ))}
        </div>

        <div style={{ marginTop: 8 }}>
          <button
            onClick={() => setShowPrompt(!showPrompt)}
            style={{
              padding: "6px 10px",
              fontSize: 11,
              fontWeight: 600,
              color: "#374151",
              background: "transparent",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            {showPrompt ? "▼" : "▶"} BASE PROMPT
          </button>
          {showPrompt && (
            <textarea 
              readOnly 
              value={basePrompt} 
              style={{ 
                width: "100%", 
                height: "100px",
                marginTop: 6,
                padding: 10, 
                borderRadius: 10, 
                border: "1px solid #d1d5db",
                background: "#ffffff",
                color: "#111827",
                fontSize: 12,
                outline: "none",
                resize: "none",
              }}
            />
          )}
        </div>
      </main>
    </div>
    </>
  );
}
