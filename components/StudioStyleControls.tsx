"use client";

import { useEffect } from "react";
import {
  StudioStyling,
  BackgroundType,
  BorderStyle,
  ShadowIntensity,
  AnimationSpeed,
  LayoutPreset,
  PRESET_STYLES,
  GOOGLE_FONTS,
} from "@/lib/studioTypes";

interface Props {
  styling: StudioStyling;
  onChange: (s: StudioStyling) => void;
}

const PRESETS: { key: LayoutPreset; label: string; emoji: string }[] = [
  { key: "brutalist", label: "Brutalist", emoji: "◼" },
  { key: "cyberpunk", label: "Cyberpunk", emoji: "⚡" },
  { key: "luxe-minimal", label: "Luxe Minimal", emoji: "✦" },
  { key: "festival-vibrant", label: "Festival Vibrant", emoji: "🎉" },
];

const BACKGROUNDS: { key: BackgroundType; label: string }[] = [
  { key: "solid", label: "Solid" },
  { key: "mesh-gradient", label: "Mesh Gradient" },
  { key: "glass-dark", label: "Glass Dark" },
  { key: "aurora", label: "Aurora" },
];

const BORDERS: { key: BorderStyle; label: string }[] = [
  { key: "sharp", label: "Sharp" },
  { key: "rounded-xl", label: "Rounded" },
  { key: "pill", label: "Pill" },
  { key: "glassmorphism", label: "Glass" },
];

const SHADOWS: { key: ShadowIntensity; label: string }[] = [
  { key: "none", label: "None" },
  { key: "soft", label: "Soft" },
  { key: "medium", label: "Medium" },
  { key: "strong", label: "Strong" },
];

const SPEEDS: { key: AnimationSpeed; label: string }[] = [
  { key: "subtle", label: "Subtle" },
  { key: "energetic", label: "Energetic" },
];

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 block mb-2">{children}</label>;
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all min-h-[36px] ${
        active
          ? "border-violet-500/60 bg-violet-500/15 text-violet-200"
          : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
      }`}
    >
      {children}
    </button>
  );
}

export default function StudioStyleControls({ styling, onChange }: Props) {
  const { colors, typography, visualStyle, animations } = styling;

  // Live-preview the fonts inside the drawer selectors themselves.
  useEffect(() => {
    const id = "studio-controls-fonts";
    let link = document.getElementById(id) as HTMLLinkElement | null;
    const families = GOOGLE_FONTS.map((f) => `family=${encodeURIComponent(f)}:wght@400;600;800`).join("&");
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
  }, []);

  const setColor = (k: keyof StudioStyling["colors"], v: string) =>
    onChange({ ...styling, colors: { ...colors, [k]: v } });
  const setType = <K extends keyof StudioStyling["typography"]>(k: K, v: StudioStyling["typography"][K]) =>
    onChange({ ...styling, typography: { ...typography, [k]: v } });
  const setVisual = <K extends keyof StudioStyling["visualStyle"]>(k: K, v: StudioStyling["visualStyle"][K]) =>
    onChange({ ...styling, visualStyle: { ...visualStyle, [k]: v } });
  const setAnim = <K extends keyof StudioStyling["animations"]>(k: K, v: StudioStyling["animations"][K]) =>
    onChange({ ...styling, animations: { ...animations, [k]: v } });

  const applyPreset = (key: LayoutPreset) => onChange({ ...PRESET_STYLES[key] });

  return (
    <div className="flex flex-col gap-6 p-4 bg-[#0a0a0f] rounded-xl border border-white/10">
      {/* Aesthetic presets */}
      <div>
        <Label>Aesthetic Preset</Label>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => applyPreset(p.key)}
              className={`px-3 py-2.5 rounded-lg text-xs font-semibold border transition-all text-left min-h-[44px] ${
                styling.preset === p.key
                  ? "border-violet-500/60 bg-violet-500/15 text-violet-200"
                  : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10"
              }`}
            >
              <span className="mr-1.5">{p.emoji}</span>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <Label>Brand Colors</Label>
        <div className="grid grid-cols-2 gap-3">
          <ColorField label="Primary Accent" value={colors.primaryAccent} onChange={(v) => setColor("primaryAccent", v)} />
          <ColorField label="Secondary Accent" value={colors.secondaryAccent} onChange={(v) => setColor("secondaryAccent", v)} />
          <ColorField label="Text Color" value={colors.textColor} onChange={(v) => setColor("textColor", v)} />
          <div>
            <div className="text-[10px] text-zinc-500 mb-1.5">Surface (rgba/hex)</div>
            <input
              value={colors.surfaceColor}
              onChange={(e) => setColor("surfaceColor", e.target.value)}
              className="w-full bg-[#0d0d12] text-zinc-300 text-[11px] font-mono px-2 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-violet-500/50"
              placeholder="rgba(15,15,20,0.9)"
            />
          </div>
        </div>
      </div>

      {/* Background type */}
      <div>
        <Label>Background Style</Label>
        <div className="grid grid-cols-2 gap-2">
          {BACKGROUNDS.map((b) => (
            <Chip key={b.key} active={colors.backgroundType === b.key} onClick={() => setColor("backgroundType", b.key)}>
              {b.label}
            </Chip>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div>
        <Label>Heading Font</Label>
        <FontSelect value={typography.fontHeading} onChange={(v) => setType("fontHeading", v)} />
        <div className="h-3" />
        <Label>Body Font</Label>
        <FontSelect value={typography.fontBody} onChange={(v) => setType("fontBody", v)} />
      </div>

      {/* Font size scale */}
      <div>
        <Label>Font Size Scale · {typography.fontSizeScale.toFixed(2)}×</Label>
        <input
          type="range"
          min={0.8}
          max={1.4}
          step={0.05}
          value={typography.fontSizeScale}
          onChange={(e) => setType("fontSizeScale", parseFloat(e.target.value))}
          className="w-full accent-violet-500"
        />
      </div>

      {/* Border style */}
      <div>
        <Label>Border / Corner Style</Label>
        <div className="grid grid-cols-2 gap-2">
          {BORDERS.map((b) => (
            <Chip key={b.key} active={visualStyle.borderStyle === b.key} onClick={() => setVisual("borderStyle", b.key)}>
              {b.label}
            </Chip>
          ))}
        </div>
      </div>

      {/* Shadow intensity */}
      <div>
        <Label>Shadow Intensity</Label>
        <div className="flex flex-wrap gap-2">
          {SHADOWS.map((s) => (
            <Chip key={s.key} active={visualStyle.shadowIntensity === s.key} onClick={() => setVisual("shadowIntensity", s.key)}>
              {s.label}
            </Chip>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="flex flex-col gap-3">
        <Toggle label="✨ Glow Effects" checked={visualStyle.glowEffects} onChange={(v) => setVisual("glowEffects", v)} />
        <Toggle label="🎈 Floating Cards" checked={animations.enableFloatingCards} onChange={(v) => setAnim("enableFloatingCards", v)} />
      </div>

      {/* Animation speed */}
      <div>
        <Label>Animation Speed</Label>
        <div className="flex flex-wrap gap-2">
          {SPEEDS.map((s) => (
            <Chip key={s.key} active={animations.animationSpeed === s.key} onClick={() => setAnim("animationSpeed", s.key)}>
              {s.label}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  // color input needs a hex; if value is rgba, fall back to a swatch preview only.
  const isHex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
  return (
    <div>
      <div className="text-[10px] text-zinc-500 mb-1.5">{label}</div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={isHex ? value : "#8b5cf6"}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg cursor-pointer border border-white/20 bg-transparent p-0 flex-shrink-0"
          title={label}
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#0d0d12] text-zinc-300 text-[11px] font-mono px-2 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-violet-500/50"
        />
      </div>
    </div>
  );
}

function FontSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const options = Array.from(new Set([value, ...GOOGLE_FONTS]));
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-[#0d0d12] text-zinc-200 text-sm px-3 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-violet-500/50 cursor-pointer"
      style={{ fontFamily: `'${value}', sans-serif` }}
    >
      {options.map((f) => (
        <option key={f} value={f} style={{ fontFamily: `'${f}', sans-serif`, background: "#18181b" }}>
          {f}
        </option>
      ))}
    </select>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all min-h-[44px]"
    >
      <span className="text-xs font-medium text-zinc-300">{label}</span>
      <span
        className={`w-9 h-5 rounded-full relative transition-all ${checked ? "bg-violet-500" : "bg-zinc-700"}`}
      >
        <span
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
          style={{ left: checked ? "18px" : "2px" }}
        />
      </span>
    </button>
  );
}
