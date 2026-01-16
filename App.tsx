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
  { key: "front", title: "Chính diện", suffix: "Chụp chính diện, camera đặt ngang tầm mắt, vuông góc mặt kính trước. Full tank shot.", isHero: true },
  { key: "left", title: "Trái", suffix: "Camera 45 degrees from left, left glass panel visible, parallax effect, perspective shift, not front view. Full tank shot.", isHero: false },
  { key: "low", title: "Dưới", suffix: "Low angle upward perspective, base frame visible, strong perspective distortion, not front view. Full tank shot.", isHero: false },
  { key: "top", title: "Trên", suffix: "Top-down overhead view, top frame visible, bird's eye view, not front view. Full tank shot.", isHero: false },
];

function Select({ label, value, onChange, options, customValue, onCustomChange, placeholder }: { 
  label: string; 
  value: string; 
  onChange: (v: string) => void; 
  options: typeof OPTIONS.shape;
  customValue?: string;
  onCustomChange?: (v: string) => void;
  placeholder?: string;
}) {
  const showCustom = value === "custom";
  const optionsWithCustom = [...options, { value: "custom", label: "Custom" }];
  
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
        {optionsWithCustom.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {showCustom && onCustomChange && (
        <input
          type="text"
          value={customValue || ""}
          onChange={(e) => onCustomChange(e.target.value)}
          placeholder={placeholder}
          style={{
            padding: "8px 10px",
            height: "38px",
            marginTop: 8,
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
        />
      )}
    </label>
  );
}

function CheckboxList({ label, values, onToggle, options, customValue, onCustomChange, placeholder }: { 
  label: string; 
  values: string[]; 
  onToggle: (v: string) => void; 
  options: typeof OPTIONS.plants;
  customValue?: string;
  onCustomChange?: (v: string) => void;
  placeholder?: string;
}) {
  const hasCustom = values.includes("custom");
  const optionsWithCustom = [...options, { value: "custom", label: "Custom" }];
  
  return (
    <div style={{ display: "grid", gap: 4 }}>
      <div style={{ fontSize: 11, color: "#374151", fontWeight: 600 }}>{label}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {optionsWithCustom.map((o) => {
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
      {hasCustom && onCustomChange && (
        <input
          type="text"
          value={customValue || ""}
          onChange={(e) => onCustomChange(e.target.value)}
          placeholder={placeholder}
          style={{
            padding: "8px 10px",
            height: "38px",
            marginTop: 8,
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
        />
      )}
    </div>
  );
}

interface PreviewCardProps {
  title: string;
  src: string;
  loading: boolean;
  progress?: number;
  onOpen: (src: string) => void;
}

const PreviewCard: React.FC<PreviewCardProps> = ({ title, src, loading, progress, onOpen }) => {
  return (
    <div style={{ 
      border: "1px solid #e5e7eb", 
      borderRadius: 16, 
      background: "white", 
      overflow: "hidden", 
      boxShadow: "0 4px 12px rgba(17,24,39,0.05)", 
      height: "100%", 
      display: "flex", 
      flexDirection: "column",
    }}>
      <div style={{ 
        padding: "8px 12px", 
        fontSize: 12, 
        fontWeight: 700, 
        color: "#111827",
        background: "#fafafa",
        borderBottom: "1px solid #eef2f7",
        height: "32px",
        display: "flex",
        alignItems: "center",
      }}>
        {title}
      </div>

      {/* KHUNG DỌC 3:4 với object-contain - RESPONSIVE - KHÔNG ZOOM/CROP */}
      <div
        style={{
          width: "100%",
          flex: 1,
          minHeight: 0,
          background: "#0b1220",
          position: "relative",
          overflow: "visible", // Đổi từ hidden sang visible để không cắt ảnh
          cursor: src && !src.startsWith('ERROR:') ? "zoom-in" : "default",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "4px", // Giảm padding để có thêm không gian
        }}
        onClick={() => src && !src.startsWith('ERROR:') && onOpen(src)}
        title={src && !src.startsWith('ERROR:') ? "Bấm để xem full" : ""}
      >
        {/* Container responsive: fit trong viewport, đảm bảo 3:4, không bị cắt */}
        <div style={{ 
          width: "100%", 
          maxWidth: "100%",
          // Tính toán height dựa trên width để đảm bảo 3:4, nhưng không vượt quá container
          aspectRatio: "3 / 4", 
          position: "relative",
          background: "#0b1220",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
          // Đảm bảo container không vượt quá kích thước có sẵn
          maxHeight: "100%",
          minHeight: 0,
          overflow: "hidden", // Ẩn phần ảnh vượt quá (nếu có) nhưng ảnh vẫn contain đầy đủ
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
                  // Không set width/height = 100% để tránh zoom
                  // Dùng maxWidth/maxHeight để fit trong container
                  maxWidth: "100%",
                  maxHeight: "100%",
                  width: "auto",
                  height: "auto",
                  objectFit: "contain", // Luôn contain để không bị crop
                  objectPosition: "center",
                  display: "block",
                  // Đảm bảo ảnh giữ nguyên tỉ lệ gốc
                  imageRendering: "auto",
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
                background: "rgba(255,255,255,0.85)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                padding: 20,
              }}
            >
              <div style={{ width: "70%", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  flex: 1,
                  height: 10,
                  background: "#e5e7eb",
                  borderRadius: 999,
                  overflow: "hidden",
                  position: "relative",
                }}>
                  <div style={{
                    width: `${progress || 0}%`,
                    height: "100%",
                    background: "#16a34a",
                    borderRadius: 999,
                    transition: "width 0.2s ease",
                  }} />
                </div>
                <div style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#111827",
                  minWidth: 40,
                  textAlign: "right",
                }}>
                  {Math.round(progress || 0)}%
                </div>
              </div>
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
        background: "rgba(0,0,0,0.85)",
        display: "grid",
        placeItems: "center",
        zIndex: 99999,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(92vw, 720px)",
          maxHeight: "min(92vh, calc(92vw * 4 / 3))", // Đảm bảo không vượt quá viewport
          aspectRatio: "3 / 4",
          background: "#000",
          borderRadius: 16,
          overflow: "visible", // Đổi từ hidden sang visible
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
        }}
      >
        <div style={{ 
          flex: 1, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          minHeight: 0,
          padding: "12px", // Giảm padding
          position: "relative",
          overflow: "visible",
        }}>
          <img 
            src={src} 
            alt="full" 
            style={{ 
              // Không set width/height = 100% để tránh zoom
              // Dùng maxWidth/maxHeight để fit trong container
              maxWidth: "100%",
              maxHeight: "100%",
              width: "auto",
              height: "auto",
              objectFit: "contain", // Luôn contain để không bị crop
              objectPosition: "center",
              display: "block",
              // Đảm bảo ảnh giữ nguyên tỉ lệ gốc
              imageRendering: "auto",
            }} 
          />
        </div>
        <div style={{ 
          padding: "12px 16px", 
          display: "flex", 
          justifyContent: "flex-end",
          background: "#000",
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}>
          <button
            onClick={onClose}
            style={{ 
              padding: "10px 20px", 
              borderRadius: 8, 
              border: "1px solid rgba(255,255,255,0.3)", 
              background: "rgba(255,255,255,0.1)", 
              color: "#fff",
              fontWeight: 700, 
              cursor: "pointer",
              fontSize: 14,
            }}
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

  // Custom input states
  const [shapeCustom, setShapeCustom] = useState("");
  const [frameCustom, setFrameCustom] = useState("");
  const [themeCustom, setThemeCustom] = useState("");
  const [hardscapeCustom, setHardscapeCustom] = useState("");
  const [lightingCustom, setLightingCustom] = useState("");
  const [moodCustom, setMoodCustom] = useState("");
  const [plantsCustom, setPlantsCustom] = useState("");

  const [images, setImages] = useState({ front: "", left: "", low: "", top: "" });
  const [loading, setLoading] = useState({ front: false, left: false, low: false, top: false });
  const [progress, setProgress] = useState({ front: 0, left: 0, low: 0, top: 0 });
  const [activeImg, setActiveImg] = useState<string | null>(null);
  const [progressIntervals, setProgressIntervals] = useState<{ [key: string]: NodeJS.Timeout }>({});

  const labelOf = (group: typeof OPTIONS.shape, v: string) => group.find((x) => x.value === v)?.label ?? v;

  // Get effective values (custom or label)
  const effectiveShape = shape === "custom" ? (shapeCustom || "") : labelOf(OPTIONS.shape, shape);
  const effectiveFrame = frame === "custom" ? (frameCustom || "") : labelOf(OPTIONS.frame, frame);
  const effectiveTheme = theme === "custom" ? (themeCustom || "") : labelOf(OPTIONS.theme, theme);
  const effectiveHardscape = hardscape === "custom" ? (hardscapeCustom || "") : labelOf(OPTIONS.hardscape, hardscape);
  const effectiveLighting = lighting === "custom" ? (lightingCustom || "") : labelOf(OPTIONS.lighting, lighting);
  const effectiveMood = mood === "custom" ? (moodCustom || "") : labelOf(OPTIONS.mood, mood);
  
  // Plants: combine checked labels + custom input (comma-separated)
  const checkedPlantLabels = plants.filter(p => p !== "custom").map((p) => labelOf(OPTIONS.plants, p));
  const customPlantsList = plantsCustom ? plantsCustom.split(",").map(s => s.trim()).filter(Boolean) : [];
  const effectivePlants = [...checkedPlantLabels, ...customPlantsList].join(", ");

  const basePrompt = useMemo(() => {
    const hasGundam = plants.includes("gundam-model");
    const gundamLine = hasGundam
      ? `Mô hình Gundam được đặt như ${gundamMain ? "điểm nhấn chính" : "chi tiết trang trí phụ"}, tỷ lệ hài hòa với cảnh quan, chất liệu mô hình thật, không lấn át thiên nhiên.`
      : "";

    return [
      effectiveShape ? `Một hồ terrarium ${effectiveShape}, ${effectiveFrame || ""}, theo chủ đề ${effectiveTheme || ""}.` : "",
      effectiveHardscape ? `Hardscape chính: ${effectiveHardscape}. Bố cục có chiều sâu foreground–midground–background rõ ràng.` : "",
      effectivePlants ? `Thực vật: ${effectivePlants}. Mật độ tổng thể khoảng ${density}%.` : "",
      gundamLine,
      `Nền hồ gồm đất, sỏi, đá và rêu tự nhiên. ${effectiveLighting ? `Ánh sáng ${effectiveLighting}` : ""}${effectiveMood ? `, mood ${effectiveMood}` : ""}.`,
      `Phong cách ảnh: photorealistic, ultra realistic, high detail, texture vật liệu thật, ánh sáng mềm, DOF nông, bố cục gọn gàng, không hoạt hình, không minh họa.`,
      `Cùng một hồ, cùng bố cục, chỉ thay góc chụp.`,
      `Chụp toàn cảnh (wide full view), full tank shot, include entire glass terrarium from top frame to base, centered composition.`,
      `BẮT BUỘC ẢNH DỌC portrait 3:4. Full tank shot: thấy trọn hồ terrarium từ viền trên đến chân đế. Căn giữa. Không cận cảnh. Không crop. Không ảnh ngang.`,
    ].filter(Boolean).join(" ");
  }, [effectiveShape, effectiveFrame, effectiveTheme, effectiveHardscape, effectivePlants, density, effectiveLighting, effectiveMood, gundamMain]);

  const togglePlant = (v: string) => {
    setPlants((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  };

  // Start progress interval for a view
  const startProgress = (viewKey: string) => {
    // Clear existing interval if any
    if (progressIntervals[viewKey]) {
      clearInterval(progressIntervals[viewKey]);
    }
    
    setProgress((prev) => ({ ...prev, [viewKey]: 0 }));
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        const current = prev[viewKey as keyof typeof prev] || 0;
        const increment = Math.random() * 3 + 1; // 1-4%
        const next = Math.min(90, current + increment);
        return { ...prev, [viewKey]: next };
      });
    }, 120);
    
    setProgressIntervals((prev) => ({ ...prev, [viewKey]: interval }));
  };

  // Stop progress and set to 100%
  const stopProgress = (viewKey: string) => {
    if (progressIntervals[viewKey]) {
      clearInterval(progressIntervals[viewKey]);
      setProgressIntervals((prev) => {
        const next = { ...prev };
        delete next[viewKey];
        return next;
      });
    }
    
    setProgress((prev) => ({ ...prev, [viewKey]: 100 }));
    
    setTimeout(() => {
      setLoading((prev) => ({ ...prev, [viewKey]: false }));
    }, 200);
  };

  // Stop progress on error
  const stopProgressError = (viewKey: string) => {
    if (progressIntervals[viewKey]) {
      clearInterval(progressIntervals[viewKey]);
      setProgressIntervals((prev) => {
        const next = { ...prev };
        delete next[viewKey];
        return next;
      });
    }
    
    setLoading((prev) => ({ ...prev, [viewKey]: false }));
    setProgress((prev) => ({ ...prev, [viewKey]: 0 }));
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
    // Bật loading và start progress cùng lúc
    setLoading({ front: true, left: true, low: true, top: true });
    startProgress("front");
    startProgress("left");
    startProgress("low");
    startProgress("top");

    try {
      // STEP 1: Render HERO (front) trước
      const heroView = VIEWS.find(v => v.key === "front")!;
      const heroPrompt = `${basePrompt} ${heroView.suffix} portrait 3:4, full tank shot, include entire terrarium, no cropping, no close-up. REQUIRED: portrait orientation 3:4. include entire terrarium. no close-up. no cropping.`;

      const heroRes = await fetch("/api/render-terrarium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: heroPrompt, aspect: "3:4" }),
      });

      const heroText = await heroRes.text();
      let heroData: any = null;
      
      // Kiểm tra nếu response là HTML (payload too large)
      if (heroText.trim().startsWith('<!DOCTYPE html') || heroText.trim().startsWith('<html')) {
        stopProgressError("front");
        throw new Error('Payload too large / Server limit exceeded');
      }

      try {
        heroData = heroText ? JSON.parse(heroText) : null;
      } catch {
        heroData = null;
      }

      if (!heroRes.ok || !heroData?.ok || !heroData?.imageUrl) {
        stopProgressError("front");
        const errorMsg = heroData?.error || 'Unknown error';
        const errorDetail = heroData?.detail ? ` - ${heroData.detail}` : '';
        const errorType = heroData?.type ? ` [${heroData.type}]` : '';
        throw new Error(`Render HERO failed: ${errorMsg}${errorType}${errorDetail}`);
      }

      // Lưu HERO image và stop progress
      setImages((prev) => ({ ...prev, front: heroData.imageUrl }));
      stopProgress("front");

      // Nén ảnh HERO trước khi dùng làm reference (giảm kích thước để tăng tốc)
      const heroImageUrl = heroData.imageUrl;
      const compressedRef = await compressDataUrl(heroImageUrl, 512, 0.5); // Giảm từ 768px/0.7 xuống 512px/0.5

      // STEP 2: Render 3 ảnh còn lại SONG SONG với reference image
      const refViews = VIEWS.filter(v => !v.isHero);
      const refJobs = refViews.map(async (v) => {
        const angleMap: { [key: string]: string } = {
          left: "LEFT (camera 45 degrees from left, left glass panel visible)",
          low: "LOW (low angle upward perspective, base frame visible)",
          top: "TOP (top-down overhead, top frame visible)"
        };
        const angleName = angleMap[v.key] || v.key.toUpperCase();
        
        // Prompt ngắn gọn hơn để tăng tốc xử lý
        const refPrompt = `Reference scene. Change camera to ${angleName}. ${v.suffix} Keep same terrarium, plants, hardscape. Portrait 3:4, full tank shot.`;

        // Thêm timeout 30s để tránh treo quá lâu
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
        
        const res = await fetch("/api/render-terrarium", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            prompt: refPrompt, 
            aspect: "3:4",
            referenceImageDataUrl: compressedRef 
          }),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        let text: string;
        try {
          text = await res.text();
        } catch (fetchError: any) {
          if (fetchError.name === 'AbortError') {
            stopProgressError(v.key);
            throw new Error('Request timeout (30s exceeded)');
          }
          throw fetchError;
        }
        
        // Kiểm tra nếu response là HTML (payload too large)
        if (text.trim().startsWith('<!DOCTYPE html') || text.trim().startsWith('<html')) {
          stopProgressError(v.key);
          throw new Error('Payload too large / Server limit exceeded');
        }

        let data: any = null;
        try {
          data = text ? JSON.parse(text) : null;
        } catch {
          data = null;
        }

        if (!res.ok || !data?.ok || !data?.imageUrl) {
          stopProgressError(v.key);
          const errorMsg = data?.error || 'Unknown error';
          const errorDetail = data?.detail ? ` - ${data.detail}` : '';
          const errorType = data?.type ? ` [${data.type}]` : '';
          throw new Error(`Render ${v.key} failed: ${errorMsg}${errorType}${errorDetail}`);
        }

        return { key: v.key, url: data.imageUrl };
      });

      const refResults = await Promise.allSettled(refJobs);

      const nextImages: any = {};
      refResults.forEach((r, index) => {
        if (r.status === "fulfilled") {
          nextImages[r.value.key] = r.value.url;
          stopProgress(r.value.key);
        } else {
          console.error(r.reason);
          const key = refViews[index].key;
          nextImages[key] = `ERROR: ${r.reason?.message || 'Unknown error'}`;
          stopProgressError(key);
        }
      });

      setImages((prev) => ({ ...prev, ...nextImages }));
    } catch (error: any) {
      console.error("Render error:", error);
      setImages((prev) => ({ ...prev, front: `ERROR: ${error.message || 'Unknown error'}` }));
      stopProgressError("front");
      stopProgressError("left");
      stopProgressError("low");
      stopProgressError("top");
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
          /* Xử lý viewport scaling trên laptop */
          -webkit-text-size-adjust: 100%;
          text-size-adjust: 100%;
        }
        body {
          color: #111827;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        }
        /* Đảm bảo ảnh luôn contain đầy đủ */
        img {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
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
      <div style={{ height: "100vh", display: "grid", gridTemplateColumns: "clamp(380px, 30vw, 520px) 1fr", background: "#f6f7fb", overflow: "hidden" }}>
      <aside style={{ 
        height: "100vh",
        borderRight: "1px solid #e5e7eb", 
        background: "#ffffff", 
        overflow: "hidden",
        border: "1px solid #e5e7eb",
        borderRadius: "0 12px 12px 0",
        boxShadow: "0 4px 12px rgba(17,24,39,0.05)",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Header - Cố định trên */}
        <div style={{ 
          padding: "12px 14px 10px 14px",
          fontSize: 16, 
          fontWeight: 800, 
          color: "#111827",
          borderBottom: "1px solid #e5e7eb",
        }}>
          Terrarium Idea Builder
        </div>

        {/* ControlsBody - Có thể scroll */}
        <div style={{ 
          flex: 1, 
          overflow: "auto", 
          padding: "12px 14px",
          paddingBottom: "12px",
          paddingRight: "10px",
        }}>
          <div style={{ display: "grid", gap: 10 }}>
            <Select 
              label="Hình dáng hồ" 
              value={shape} 
              onChange={setShape} 
              options={OPTIONS.shape}
              customValue={shapeCustom}
              onCustomChange={setShapeCustom}
              placeholder="VD: hồ lục giác, hồ tam giác, hồ đứng bo góc…"
            />

            <Select 
              label="Vật liệu khung" 
              value={frame} 
              onChange={setFrame} 
              options={OPTIONS.frame}
              customValue={frameCustom}
              onCustomChange={setFrameCustom}
              placeholder="VD: khung tre, khung nhôm trắng, khung inox…"
            />

            <Select 
              label="Chủ đề" 
              value={theme} 
              onChange={setTheme} 
              options={OPTIONS.theme}
              customValue={themeCustom}
              onCustomChange={setThemeCustom}
              placeholder="VD: sa mạc, hang động, cyberpunk…"
            />

            <Select 
              label="Hardscape chính" 
              value={hardscape} 
              onChange={setHardscape} 
              options={OPTIONS.hardscape}
              customValue={hardscapeCustom}
              onCustomChange={setHardscapeCustom}
              placeholder="VD: lũa chữ S, đá vân mây, vách đá dựng…"
            />

            <CheckboxList 
              label="Thực vật (chọn nhiều)" 
              values={plants} 
              onToggle={togglePlant} 
              options={OPTIONS.plants}
              customValue={plantsCustom}
              onCustomChange={setPlantsCustom}
              placeholder="VD: rêu java, trầu bà mini, fittonia, bromeliad…"
            />

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

            <Select 
              label="Ánh sáng" 
              value={lighting} 
              onChange={setLighting} 
              options={OPTIONS.lighting}
              customValue={lightingCustom}
              onCustomChange={setLightingCustom}
              placeholder="VD: ánh sáng xanh dương, spotlight, neon…"
            />

            <Select 
              label="Mood" 
              value={mood} 
              onChange={setMood} 
              options={OPTIONS.mood}
              customValue={moodCustom}
              onCustomChange={setMoodCustom}
              placeholder="VD: u ám, lễ hội, tối giản…"
            />

            <Select label="Tỉ lệ ảnh" value={aspect} onChange={setAspect} options={OPTIONS.aspect} />
          </div>
        </div>

        {/* FooterActions - Cố định dưới, luôn thấy nút */}
        <div style={{ 
          position: "sticky",
          bottom: 0,
          background: "#ffffff",
          padding: "12px 14px",
          borderTop: "1px solid #e5e7eb",
          zIndex: 5,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}>
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
              width: "100%",
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
              width: "100%",
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

      <main style={{ 
        padding: 12, 
        overflow: "visible", // Đổi từ hidden để không cắt ảnh
        display: "flex", 
        flexDirection: "column", 
        height: "100vh",
        maxHeight: "100vh", // Đảm bảo không vượt quá viewport
        boxSizing: "border-box",
      }}>
        <ImageModal src={activeImg} onClose={() => setActiveImg(null)} />
        
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr", 
          gridTemplateRows: "1fr 1fr",
          gap: 12, 
          flex: 1,
          minHeight: 0,
          maxHeight: "100%",
          overflow: "visible", // Không cắt ảnh
          boxSizing: "border-box",
        }}>
          {VIEWS.map((v) => (
            <PreviewCard
              key={v.key}
              title={v.title}
              src={images[v.key as keyof typeof images] || ""}
              loading={!!loading[v.key as keyof typeof loading]}
              progress={progress[v.key as keyof typeof progress] as number | undefined}
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
