"use client";

import { useState, useRef, useCallback, useSyncExternalStore } from "react";
import { EventStudioSpec } from "@/lib/studioTypes";

// Read Web Speech API support via useSyncExternalStore: no setState-in-effect,
// server snapshot returns true (optimistic) so markup matches on hydration.
const emptySubscribe = () => () => {};
const getSpeechSupported = () =>
  typeof window !== "undefined" &&
  Boolean(
    (window as Window & {
      SpeechRecognition?: unknown;
      webkitSpeechRecognition?: unknown;
    }).SpeechRecognition ||
      (window as Window & { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
  );

interface Props {
  spec: EventStudioSpec;
  accent: string;
}

const LANGUAGES = [
  { code: "en-US", label: "English", flag: "🇺🇸" },
  { code: "hi-IN", label: "हिंदी", flag: "🇮🇳" },
  { code: "es-ES", label: "Español", flag: "🇪🇸" },
  { code: "fr-FR", label: "Français", flag: "🇫🇷" },
  { code: "de-DE", label: "Deutsch", flag: "🇩🇪" },
  { code: "zh-CN", label: "中文", flag: "🇨🇳" },
  { code: "ar-SA", label: "العربية", flag: "🇸🇦" },
  { code: "pt-BR", label: "Português", flag: "🇧🇷" },
  { code: "ja-JP", label: "日本語", flag: "🇯🇵" },
  { code: "ko-KR", label: "한국어", flag: "🇰🇷" },
];

const ANNOUNCE_TEMPLATES = [
  (c: EventStudioSpec["content"]) => `Welcome to ${c.title}! The event is on ${c.date} at ${c.time}, held at ${c.venue}.`,
  (c: EventStudioSpec["content"]) => `Registration for ${c.title} is ${c.registration.fee}. Deadline: ${c.registration.deadline}.`,
  (c: EventStudioSpec["content"]) => `${c.title} schedule: ${c.schedule.slice(0, 3).map(s => `${s.time} — ${s.title}`).join(". ")}.`,
];

export default function VoiceBot({ spec, accent }: Props) {
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState("");
  const [lang, setLang] = useState("en-US");
  const [showLangs, setShowLangs] = useState(false);
  const [announceIdx, setAnnounceIdx] = useState(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const supported = useSyncExternalStore(emptySubscribe, getSpeechSupported, () => true);

  const speak = useCallback((text: string, langCode = "en-US") => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = langCode;
    utt.rate = 0.95;
    utt.pitch = 1;
    utt.onstart = () => setSpeaking(true);
    utt.onend = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
  }, []);

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const handleVoiceQuery = useCallback((query: string) => {
    const lower = query.toLowerCase();
    const c = spec.content;
    let answer = `I heard: "${query}". `;

    if (lower.includes("when") || lower.includes("date") || lower.includes("time")) {
      answer += `The event is on ${c.date} at ${c.time}.`;
    } else if (lower.includes("where") || lower.includes("venue") || lower.includes("location")) {
      answer += `The venue is ${c.venue}.`;
    } else if (lower.includes("register") || lower.includes("sign up")) {
      answer += `Registration is ${c.registration.fee}. Deadline is ${c.registration.deadline}.`;
    } else if (lower.includes("schedule") || lower.includes("agenda")) {
      answer += `The schedule starts with: ${c.schedule[0]?.time} — ${c.schedule[0]?.title}.`;
    } else if (lower.includes("contact") || lower.includes("organizer")) {
      answer += `Contact ${c.contacts[0]?.name} at ${c.contacts[0]?.contact}.`;
    } else {
      const faq = c.faqs.find(f => f.question.toLowerCase().split(" ").some(w => lower.includes(w) && w.length > 3));
      answer += faq ? faq.answer : `Please check the event page or contact ${c.contacts[0]?.contact} for more details.`;
    }

    setResult(answer);
    speak(answer, lang);
  }, [spec, lang, speak]);

  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;
    const w = window as Window & {
      SpeechRecognition?: { new (): SpeechRecognition };
      webkitSpeechRecognition?: { new (): SpeechRecognition };
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    let finalTranscript = "";
    recognition.onstart = () => setListening(true);
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let t = "";
      for (let i = 0; i < e.results.length; i++) {
        t += e.results[i][0].transcript;
      }
      finalTranscript = t;
      setTranscript(t);
    };
    recognition.onend = () => {
      setListening(false);
      if (finalTranscript) handleVoiceQuery(finalTranscript);
    };
    recognition.onerror = () => setListening(false);
    recognition.start();
  }, [lang, handleVoiceQuery]);

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const announceNext = () => {
    const text = ANNOUNCE_TEMPLATES[announceIdx](spec.content);
    setResult(text);
    speak(text, lang);
    setAnnounceIdx((announceIdx + 1) % ANNOUNCE_TEMPLATES.length);
  };

  const selectedLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed", bottom: "92px", right: "24px", zIndex: 1000,
          width: "48px", height: "48px", borderRadius: "50%",
          background: `linear-gradient(135deg, #06b6d4, ${accent})`,
          border: "none", cursor: "pointer", fontSize: "1.2rem",
          boxShadow: `0 6px 24px rgba(6,182,212,0.5)`,
          transition: "all 0.3s",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
        title="Voice Translation Bot"
      >
        {open ? "✕" : "🎙️"}
      </button>

      {/* Panel */}
      {open && (
        <div style={{
          position: "fixed", bottom: "152px", right: "24px", zIndex: 998,
          width: "min(340px, calc(100vw - 32px))",
          background: "rgba(9,9,11,0.97)",
          border: "1px solid rgba(6,182,212,0.3)",
          borderRadius: "20px",
          backdropFilter: "blur(20px)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(6,182,212,0.15)",
          overflow: "hidden",
          animation: "voiceSlideIn 0.3s ease",
        }}>
          {/* Header */}
          <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(6,182,212,0.2)", background: "rgba(6,182,212,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "1.2rem" }}>🌐</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#f4f4f5" }}>Voice Translation Bot</div>
                <div style={{ fontSize: "0.7rem", color: "#06b6d4" }}>Speech-to-Text · TTS · Multilingual</div>
              </div>
            </div>
            {/* Language selector */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowLangs(!showLangs)}
                style={{ background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.3)", borderRadius: "8px", padding: "4px 10px", color: "#06b6d4", fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
              >
                {selectedLang.flag} {selectedLang.label} ▾
              </button>
              {showLangs && (
                <div style={{ position: "absolute", right: 0, top: "100%", marginTop: "4px", background: "#18181b", border: "1px solid rgba(6,182,212,0.3)", borderRadius: "12px", overflow: "hidden", zIndex: 10, minWidth: "160px", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
                  {LANGUAGES.map(l => (
                    <button key={l.code} onClick={() => { setLang(l.code); setShowLangs(false); }}
                      style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "8px 14px", background: lang === l.code ? "rgba(6,182,212,0.15)" : "transparent", border: "none", color: lang === l.code ? "#06b6d4" : "#a1a1aa", fontSize: "0.82rem", cursor: "pointer", textAlign: "left" }}>
                      {l.flag} {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {!supported && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "10px 14px", color: "#fca5a5", fontSize: "0.8rem" }}>
                ⚠ Speech recognition not supported in this browser. Use Chrome or Edge for full functionality.
              </div>
            )}

            {/* Transcript display */}
            {(transcript || result) && (
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: "12px", padding: "12px 14px" }}>
                {transcript && <div style={{ fontSize: "0.78rem", color: "#64748b", marginBottom: "6px" }}>🎤 Heard: <span style={{ color: "#94a3b8" }}>{transcript}</span></div>}
                {result && <div style={{ fontSize: "0.82rem", color: "#e2e8f0", lineHeight: 1.55 }}>{result}</div>}
              </div>
            )}

            {/* Controls */}
            <div style={{ display: "flex", gap: "8px" }}>
              {/* Mic button */}
              <button
                onClick={listening ? stopListening : startListening}
                disabled={!supported}
                style={{
                  flex: 1, padding: "12px", borderRadius: "12px", cursor: supported ? "pointer" : "not-allowed",
                  background: listening ? "rgba(239,68,68,0.2)" : "rgba(6,182,212,0.15)",
                  color: listening ? "#f87171" : "#06b6d4",
                  fontSize: "0.85rem", fontWeight: 600, transition: "all 0.2s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                  border: `1px solid ${listening ? "rgba(239,68,68,0.4)" : "rgba(6,182,212,0.3)"}`,
                  animation: listening ? "micPulse 1s ease-in-out infinite" : "none",
                }}
              >
                {listening ? "⏹ Stop" : "🎤 Speak"}
              </button>

              {/* TTS announce button */}
              <button
                onClick={speaking ? stopSpeaking : announceNext}
                style={{
                  flex: 1, padding: "12px", borderRadius: "12px", cursor: "pointer",
                  background: speaking ? "rgba(139,92,246,0.2)" : "rgba(139,92,246,0.15)",
                  color: speaking ? "#a78bfa" : "#8b5cf6",
                  fontSize: "0.85rem", fontWeight: 600, transition: "all 0.2s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                  border: `1px solid ${speaking ? "rgba(139,92,246,0.5)" : "rgba(139,92,246,0.3)"}`,
                }}
              >
                {speaking ? "⏹ Stop" : "🔊 Announce"}
              </button>
            </div>

            {/* Quick announce buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "2px", color: "#475569", textTransform: "uppercase" }}>Quick Announcements</div>
              {["📅 Date & Time", "💰 Registration", "📋 Schedule"].map((label, i) => (
                <button key={i} onClick={() => { const text = ANNOUNCE_TEMPLATES[i](spec.content); setResult(text); speak(text, lang); }}
                  style={{ padding: "8px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8", fontSize: "0.8rem", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes voiceSlideIn { from{opacity:0;transform:translateY(16px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes micPulse { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.4)} 50%{box-shadow:0 0 0 8px rgba(239,68,68,0)} }
      `}</style>
    </>
  );
}
