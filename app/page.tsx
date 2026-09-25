"use client";

import { useState, useRef, useCallback, useId } from "react";
import { EventStudioSpec, sampleStudioSpec } from "@/lib/studioTypes";
import { generateStudioHtml } from "@/lib/exportStudioHtml";
import StudioRenderer from "@/components/StudioRenderer";
import StudioStyleControls from "@/components/StudioStyleControls";

type Viewport = "desktop" | "tablet" | "mobile";
type Tab = "content" | "style" | "json";

const VIEWPORT_WIDTHS: Record<Viewport, string> = {
  desktop: "100%",
  tablet: "834px",
  mobile: "390px",
};

const VIEWPORT_ICONS: Record<Viewport, string> = {
  desktop: "🖥️ Desktop",
  tablet: "📱 iPad",
  mobile: "📲 iPhone",
};

function JsonEditor({ spec, onChange }: { spec: EventStudioSpec; onChange: (s: EventStudioSpec) => void }) {
  const [raw, setRaw] = useState(() => JSON.stringify(spec, null, 2));
  const [error, setError] = useState("");

  const handle = (v: string) => {
    setRaw(v);
    try {
      const parsed = JSON.parse(v);
      if (!parsed.content || !parsed.styling) {
        setError("Spec must have both 'content' and 'styling'.");
        return;
      }
      setError("");
      onChange(parsed);
    } catch {
      setError("Invalid JSON");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {error && <div className="text-red-400 text-xs px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded">⚠ {error}</div>}
      <textarea
        value={raw}
        onChange={(e) => handle(e.target.value)}
        spellCheck={false}
        className="w-full bg-[#0d1117] text-emerald-300 text-xs font-mono p-4 rounded-lg border border-white/10 resize-none focus:outline-none focus:border-emerald-500/50 leading-relaxed"
        style={{ minHeight: "460px" }}
      />
    </div>
  );
}

export default function Home() {
  const [spec, setSpec] = useState<EventStudioSpec>(() => sampleStudioSpec());
  // Bumped whenever the spec is REPLACED wholesale (generate/import/preset),
  // so the JSON editor remounts and re-reads; not bumped on in-editor edits.
  const [specVersion, setSpecVersion] = useState(0);
  const replaceSpec = useCallback((s: EventStudioSpec) => {
    setSpec(s);
    setSpecVersion((v) => v + 1);
  }, []);
  const editorBaseId = useId();
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [tab, setTab] = useState<Tab>("content");
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const setStyling = (styling: EventStudioSpec["styling"]) => setSpec((s) => ({ ...s, styling }));

  const handleGenerate = useCallback(async () => {
    if (!inputText.trim()) {
      setError("Please describe your event first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });
      const json = await res.json();
      if (json.error) {
        setError(json.error);
      } else if (json.data) {
        replaceSpec(json.data);
        setTab("style");
      }
    } catch {
      setError("Failed to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [inputText, replaceSpec]);

  const downloadBlob = (data: string, filename: string, type: string) => {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportHtml = () => {
    downloadBlob(generateStudioHtml(spec), `${spec.content.slug || "event-page"}.html`, "text/html");
  };

  const handleExportJson = () => {
    downloadBlob(JSON.stringify(spec, null, 2), `${spec.content.slug || "event-spec"}.json`, "application/json");
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed.content && parsed.styling) {
          replaceSpec(parsed);
          setError("");
          setTab("style");
        } else {
          setError("That JSON is not a valid Event Studio spec.");
        }
      } catch {
        setError("Could not parse that JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleCopyEmbed = async () => {
    const html = generateStudioHtml(spec);
    const encoded = btoa(unescape(encodeURIComponent(html)));
    const embed = `<iframe src="data:text/html;base64,${encoded}" width="100%" height="800" frameborder="0"></iframe>`;
    await navigator.clipboard.writeText(embed);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-screen bg-[#09090b] text-zinc-100 flex flex-col overflow-hidden">
      {/* TOP NAV */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-white/10 bg-[#09090b]/95 backdrop-blur-md z-50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-sm font-black">⚡</div>
          <div>
            <span className="font-black text-base tracking-tight">EventForge Studio</span>
            <span className="ml-2 text-[10px] bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full font-medium">AI · Copilot · Voice</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept="application/json" onChange={handleImportJson} className="hidden" />
          <button
            onClick={() => fileRef.current?.click()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-zinc-300"
          >
            📤 Import JSON
          </button>
          <button
            onClick={handleExportJson}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-zinc-300"
          >
            {"{ }"} Export Spec
          </button>
          <button
            onClick={handleCopyEmbed}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-zinc-300"
          >
            {copied ? "✓ Copied!" : "🔗 Embed"}
          </button>
          <button
            onClick={handleExportHtml}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all text-black"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)", boxShadow: "0 0 20px rgba(139,92,246,0.3)" }}
          >
            ⬇ Download HTML
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT — CUSTOMIZATION STUDIO DRAWER */}
        <aside className="w-full max-w-[420px] flex-shrink-0 flex flex-col border-r border-white/10 bg-[#0d0d10] overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-white/10 flex-shrink-0">
            {([
              { k: "content" as Tab, label: "✨ Generate" },
              { k: "style" as Tab, label: "� Style" },
              { k: "json" as Tab, label: "{ } JSON" },
            ]).map((t) => (
              <button
                key={t.k}
                onClick={() => setTab(t.k)}
                className={`flex-1 py-3 text-xs font-semibold transition-all ${
                  tab === t.k ? "text-violet-300 border-b-2 border-violet-500 bg-violet-500/5" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {tab === "content" && (
              <div className="flex flex-col gap-5">
                <div>
                  <h1 className="text-lg font-black mb-1">Describe Your Event</h1>
                  <p className="text-zinc-500 text-sm">Paste messy event text — AI extracts and designs the full page, filling in missing details.</p>
                </div>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={"e.g. HackForge 2025 — 48-hour national hackathon at IIT Delhi on March 15-16. Prize pool ₹5L. Teams of 2-4. Free food and accommodation..."}
                  className="w-full bg-[#0a0a0f] text-zinc-200 text-sm p-4 rounded-xl border border-white/10 resize-none focus:outline-none focus:border-violet-500/50 leading-relaxed placeholder:text-zinc-700"
                  rows={9}
                  style={{ minHeight: "200px" }}
                />
                {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">⚠ {error}</p>}
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-bold text-sm text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px]"
                  style={{ background: loading ? "#6b7280" : "linear-gradient(135deg, #8b5cf6, #06b6d4)", boxShadow: loading ? "none" : "0 0 30px rgba(139,92,246,0.4)" }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating your page...
                    </span>
                  ) : (
                    "✨ Generate Event Page"
                  )}
                </button>
                <div className="text-[11px] text-zinc-600 bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2.5 leading-relaxed">
                  Tip: switch to the <span className="text-violet-400 font-semibold">🎨 Style</span> tab for deep design controls — brand colors, live Google Fonts, presets, glow, and more.
                </div>
              </div>
            )}

            {tab === "style" && <StudioStyleControls styling={spec.styling} onChange={setStyling} />}

            {tab === "json" && (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-zinc-500">Edit the raw spec. Changes sync live to the preview. Export or re-import anytime.</p>
                <JsonEditor key={`${editorBaseId}-${specVersion}`} spec={spec} onChange={setSpec} />
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT — PREVIEW */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#060608]">
          <div className="flex items-center justify-between px-5 py-2.5 border-b border-white/10 bg-[#0a0a0d] flex-shrink-0">
            <div className="flex items-center gap-1">
              {(["desktop", "tablet", "mobile"] as Viewport[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setViewport(v)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    viewport === v ? "bg-violet-500/20 text-violet-300 border border-violet-500/30" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                  }`}
                >
                  {VIEWPORT_ICONS[v]}
                </button>
              ))}
            </div>
            <div className="text-xs text-zinc-600 font-mono hidden md:block">
              eventforge.app/{spec.content.slug}
            </div>
          </div>

          <div
            className="flex-1 overflow-auto flex items-start justify-center p-6"
            style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)", backgroundSize: "24px 24px" }}
          >
            <div
              className="transition-all duration-500 overflow-hidden rounded-xl border border-white/10 shadow-2xl bg-black"
              style={{ width: VIEWPORT_WIDTHS[viewport], maxWidth: "100%", boxShadow: "0 0 60px rgba(0,0,0,0.5)" }}
            >
              {/* Browser chrome */}
              <div className="bg-[#1a1a1f] border-b border-white/10 px-4 py-2.5 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 bg-white/5 rounded-md px-3 py-1 text-xs text-zinc-500 font-mono truncate">
                  eventforge.app/{spec.content.slug}
                </div>
              </div>
              <div className="overflow-auto" style={{ height: "calc(100vh - 170px)" }}>
                <StudioRenderer spec={spec} withBots />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
