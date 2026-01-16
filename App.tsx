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
  { key: "front", title: "Chính diện", suffix: "Góc chụp chính diện, ngang tầm mắt, thấy rõ toàn bộ bố cục tổng thể." },
  { key: "left", title: "Trái", suffix: "Góc chụp từ bên trái, thấy rõ chiều sâu và các lớp bố cục." },
  { key: "low", title: "Dưới", suffix: "Góc chụp thấp từ bên dưới nhìn lên, nhấn mạnh độ cao và không gian." },
  { key: "top", title: "Trên", suffix: "Góc chụp từ trên xuống (top-down), thấy rõ layout hardscape và vị trí cây." },
];

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: typeof OPTIONS.shape }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <div style={{ fontSize: 12, color: "#374151", fontWeight: 600 }}>{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "10px 12px",
          borderRadius: 12,
          border: "1px solid #d1d5db",
          background: "#ffffff",
          color: "#111827",
          fontSize: 14,
          outline: "none",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#16a34a";
          e.target.style.boxShadow = "0 0 0 4px rgba(22,163,74,0.15)";
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
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ fontSize: 12, color: "#374151", fontWeight: 600 }}>{label}</div>
      <div style={{ display: "grid", gap: 8 }}>
        {options.map((o) => {
          const checked = values.includes(o.value);
          return (
            <label
              key={o.value}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                borderRadius: 12,
                border: "1px solid #d1d5db",
                background: checked ? "#f0fdf4" : "white",
                cursor: "pointer",
              }}
            >
              <input type="checkbox" checked={checked} onChange={() => onToggle(o.value)} />
              <span style={{ fontSize: 14, color: "#111827" }}>{o.label}</span>
            </label>
          );
        })}
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
    ].filter(Boolean).join(" ");
  }, [shape, frame, theme, hardscape, plants, density, lighting, mood, aspect, gundamMain]);

  const togglePlant = (v: string) => {
    setPlants((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  };

  async function render4() {
    for (const v of VIEWS) {
      setLoading((p) => ({ ...p, [v.key]: true }));

      const prompt = `${basePrompt} ${v.suffix} Tỉ lệ ảnh ${aspect}.`;

      try {
        const res = await fetch("/api/render-terrarium", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, aspect }),
        });

        const data = await res.json();
        if (res.ok && data.imageUrl) {
          setImages((p) => ({ ...p, [v.key]: data.imageUrl }));
          console.log(`Successfully rendered ${v.key} using model: ${data.model || 'unknown'}`);
        } else {
          console.error(`Render error for ${v.key}:`, data);
          // Show error in the image slot
          setImages((p) => ({ ...p, [v.key]: `ERROR: ${data.error || 'Unknown error'}` }));
        }
      } catch (error: any) {
        console.error(`Render error for ${v.key}:`, error);
        setImages((p) => ({ ...p, [v.key]: `ERROR: ${error.message || 'Network error'}` }));
      } finally {
        setLoading((p) => ({ ...p, [v.key]: false }));
      }
    }
  }

  return (
    <>
      <style>{`
        body {
          color: #111827;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        }
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          background: #16a34a;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          background: #16a34a;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
      <div style={{ height: "100vh", display: "grid", gridTemplateColumns: "380px 1fr", background: "#f6f7fb" }}>
      <aside style={{ 
        padding: 16, 
        borderRight: "1px solid #e5e7eb", 
        background: "#ffffff", 
        overflow: "auto",
        border: "1px solid #e5e7eb",
        borderRadius: "0 16px 16px 0",
        boxShadow: "0 6px 18px rgba(17,24,39,0.06)",
      }}>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 12, color: "#111827" }}>Terrarium Idea Builder</div>

        <div style={{ display: "grid", gap: 12 }}>
          <Select label="Hình dáng hồ" value={shape} onChange={setShape} options={OPTIONS.shape} />

          <Select label="Vật liệu khung" value={frame} onChange={setFrame} options={OPTIONS.frame} />

          <Select label="Chủ đề" value={theme} onChange={setTheme} options={OPTIONS.theme} />

          <Select label="Hardscape chính" value={hardscape} onChange={setHardscape} options={OPTIONS.hardscape} />

          <CheckboxList label="Thực vật (chọn nhiều)" values={plants} onToggle={togglePlant} options={OPTIONS.plants} />

          <label style={{ display: "grid", gap: 6 }}>
            <div style={{ fontSize: 12, color: "#374151", fontWeight: 600 }}>Mật độ cây: {density}%</div>
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
            gap: 10, 
            alignItems: "center", 
            padding: "8px 10px", 
            border: "1px solid #d1d5db", 
            borderRadius: 12,
            background: "#ffffff",
          }}>
            <input type="checkbox" checked={gundamMain} onChange={(e) => setGundamMain(e.target.checked)} />
            <span style={{ fontSize: 14, color: "#111827" }}>Gundam là điểm nhấn chính</span>
          </label>

          <Select label="Ánh sáng" value={lighting} onChange={setLighting} options={OPTIONS.lighting} />

          <Select label="Mood" value={mood} onChange={setMood} options={OPTIONS.mood} />

          <Select label="Tỉ lệ ảnh" value={aspect} onChange={setAspect} options={OPTIONS.aspect} />

          <button
            onClick={() => navigator.clipboard.writeText(basePrompt)}
            style={{ 
              padding: "12px 14px", 
              borderRadius: 14, 
              border: "1px solid #16a34a", 
              background: "#16a34a", 
              color: "white", 
              fontWeight: 800, 
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#15803d";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(22,163,74,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#16a34a";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Copy Prompt
          </button>

          <button
            onClick={render4}
            style={{ 
              padding: "12px 14px", 
              borderRadius: 14, 
              border: "1px solid #0ea5e9", 
              background: "#0ea5e9", 
              color: "white", 
              fontWeight: 800, 
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#0284c7";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(14,165,233,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#0ea5e9";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Render 4 góc
          </button>
        </div>
      </aside>

      <main style={{ padding: 18, overflow: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {VIEWS.map((v) => (
            <div 
              key={v.key} 
              style={{ 
                border: "1px solid #e5e7eb", 
                borderRadius: 16, 
                background: "#ffffff", 
                overflow: "hidden",
                boxShadow: "0 6px 18px rgba(17,24,39,0.06)",
              }}
            >
              <div style={{ 
                padding: "10px 12px", 
                fontSize: 14, 
                fontWeight: 700, 
                color: "#111827",
                background: "#fafafa",
                borderBottom: "1px solid #eef2f7",
              }}>
                {v.title}
              </div>
              <div style={{ height: 260, background: "#f6f7fb", display: "grid", placeItems: "center", position: "relative" }}>
                {images[v.key as keyof typeof images] ? (
                  images[v.key as keyof typeof images].startsWith('ERROR:') ? (
                    <div style={{ color: "#dc2626", fontSize: 12, padding: 12, textAlign: "center" }}>
                      {images[v.key as keyof typeof images]}
                    </div>
                  ) : (
                    <img src={images[v.key as keyof typeof images]} alt={v.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  )
                ) : (
                  <div style={{ color: "#6b7280", fontSize: 13 }}>Chưa có ảnh</div>
                )}
                {loading[v.key as keyof typeof loading] && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.65)", display: "grid", placeItems: "center", fontWeight: 800, color: "#111827" }}>
                    Rendering…
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>BASE PROMPT</div>
          <textarea 
            readOnly 
            value={basePrompt} 
            style={{ 
              width: "100%", 
              minHeight: 140, 
              padding: 12, 
              borderRadius: 14, 
              border: "1px solid #d1d5db",
              background: "#ffffff",
              color: "#111827",
              fontSize: 14,
              outline: "none",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#16a34a";
              e.target.style.boxShadow = "0 0 0 4px rgba(22,163,74,0.15)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#d1d5db";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>
      </main>
    </div>
    </>
  );
}
