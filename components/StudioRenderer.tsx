"use client";

import { useEffect, useMemo, useState } from "react";
import {
  EventStudioSpec,
  getBorderRadius,
  getShadow,
  getBackground,
} from "@/lib/studioTypes";
import AICopilot from "./AICopilot";
import VoiceBot from "./VoiceBot";

interface Props {
  spec: EventStudioSpec;
  /** When true, renders the interactive Copilot + Voice bots (preview + live page). */
  withBots?: boolean;
}

/** Inject a Google Fonts stylesheet for the chosen heading/body fonts, live. */
function useGoogleFonts(fonts: string[]) {
  useEffect(() => {
    const families = Array.from(new Set(fonts.filter(Boolean)))
      .map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700;800;900`)
      .join("&");
    if (!families) return;
    const id = "studio-google-fonts";
    let link = document.getElementById(id) as HTMLLinkElement | null;
    const href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = href;
  }, [fonts]);
}

function useCountdown(iso: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const target = new Date(iso).getTime();
  const diff = Math.max(0, target - now);
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000),
    secs: Math.floor((diff % 60000) / 1000),
    done: diff <= 0,
  };
}

export default function StudioRenderer({ spec, withBots = true }: Props) {
  const { content, styling } = spec;
  const { colors, typography, visualStyle, animations } = styling;

  useGoogleFonts([typography.fontHeading, typography.fontBody]);
  const cd = useCountdown(content.countdownISO);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const accent = colors.primaryAccent;
  const accent2 = colors.secondaryAccent;
  const radius = getBorderRadius(visualStyle.borderStyle);
  const shadow = getShadow(visualStyle.shadowIntensity, accent);
  const bg = getBackground(colors.backgroundType, accent, accent2);
  const scale = typography.fontSizeScale || 1;
  const glow = visualStyle.glowEffects;
  const energetic = animations.animationSpeed === "energetic";
  const floaty = animations.enableFloatingCards;

  const headingFont = `'${typography.fontHeading}', sans-serif`;
  const bodyFont = `'${typography.fontBody}', sans-serif`;

  const surface = colors.surfaceColor;
  const border = visualStyle.borderStyle === "sharp" ? `1px solid ${accent}33` : `1px solid ${accent}2a`;
  const glassBlur = colors.backgroundType === "glass-dark" || visualStyle.borderStyle === "glassmorphism";

  const cardStyle = useMemo<React.CSSProperties>(
    () => ({
      background: surface,
      border,
      borderRadius: radius === "999px" ? "20px" : radius,
      boxShadow: shadow,
      backdropFilter: glassBlur ? "blur(14px)" : undefined,
      WebkitBackdropFilter: glassBlur ? "blur(14px)" : undefined,
    }),
    [surface, border, radius, shadow, glassBlur]
  );

  const pill = (extra?: React.CSSProperties): React.CSSProperties => ({
    borderRadius: radius === "0px" ? "0px" : "999px",
    ...extra,
  });

  const glowText: React.CSSProperties = glow
    ? { textShadow: `0 0 24px ${accent}66` }
    : {};

  const animDur = energetic ? "0.45s" : "0.9s";
  const floatAnim = floaty ? `studioFloat ${energetic ? "4s" : "7s"} ease-in-out infinite` : "none";

  return (
    <div
      style={{
        background: bg,
        color: colors.textColor,
        fontFamily: bodyFont,
        minHeight: "100%",
        overflowX: "hidden",
        position: "relative",
        fontSize: `${scale}rem`,
      }}
    >
      {/* Ambient glows / aurora */}
      {(colors.backgroundType === "aurora" || colors.backgroundType === "mesh-gradient" || glow) && (
        <>
          <div
            aria-hidden
            style={{
              position: "absolute", top: "-120px", left: "-120px", width: "460px", height: "460px",
              background: accent, filter: "blur(120px)", opacity: 0.18, borderRadius: "50%",
              pointerEvents: "none", animation: floaty ? `studioFloat 9s ease-in-out infinite` : "none",
            }}
          />
          <div
            aria-hidden
            style={{
              position: "absolute", bottom: "-140px", right: "-100px", width: "380px", height: "380px",
              background: accent2, filter: "blur(120px)", opacity: 0.16, borderRadius: "50%",
              pointerEvents: "none", animation: floaty ? `studioFloat 11s ease-in-out infinite reverse` : "none",
            }}
          />
        </>
      )}

      {/* HERO */}
      <section
        style={{
          minHeight: "92vh", display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", textAlign: "center", padding: "96px 24px 72px", position: "relative", zIndex: 1,
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", marginBottom: "28px" }}>
          {content.badges?.map((b, i) => (
            <span
              key={i}
              style={{
                ...pill(),
                padding: "6px 15px", fontSize: "0.8rem", fontWeight: 600,
                background: `${accent}18`, border: `1px solid ${accent}44`, color: accent,
                animation: floaty ? `studioFloat ${4 + (i % 3)}s ease-in-out ${i * 0.2}s infinite` : "none",
              }}
            >
              {b}
            </span>
          ))}
        </div>

        <h1
          style={{
            fontFamily: headingFont, fontWeight: 900, lineHeight: 1.05,
            fontSize: "clamp(2.6rem, 7vw, 5.5rem)", margin: "0 0 18px",
            background: `linear-gradient(135deg, ${colors.textColor} 0%, ${accent} 60%, ${accent2} 100%)`,
            WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent",
            ...glowText,
          }}
        >
          {content.title}
        </h1>

        <p style={{ fontSize: "clamp(1.05rem, 2.4vw, 1.5rem)", opacity: 0.8, maxWidth: "640px", margin: "0 auto 32px", fontFamily: bodyFont }}>
          {content.tagline}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "18px", justifyContent: "center", marginBottom: "40px", opacity: 0.85 }}>
          <span>📅 {content.date}</span>
          <span>⏰ {content.time}</span>
          <span>📍 {content.venue}</span>
        </div>

        <a
          href={content.registration?.formUrl || "#register"}
          style={{
            ...pill(),
            display: "inline-block", padding: "16px 42px", fontWeight: 800, fontSize: "1rem",
            textDecoration: "none", color: "#08080a",
            background: `linear-gradient(135deg, ${accent}, ${accent2})`,
            boxShadow: glow ? `0 0 40px ${accent}66` : shadow,
            transition: `transform ${animDur}`,
          }}
        >
          {content.ctaText || "Register Now →"}
        </a>

        {/* Countdown */}
        {!cd.done && (
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", marginTop: "56px", flexWrap: "wrap" }}>
            {[
              { n: cd.days, l: "Days" },
              { n: cd.hours, l: "Hours" },
              { n: cd.mins, l: "Minutes" },
              { n: cd.secs, l: "Seconds" },
            ].map((u, i) => (
              <div key={i} style={{ ...cardStyle, padding: "16px 20px", minWidth: "84px", textAlign: "center", animation: floatAnim, animationDelay: `${i * 0.3}s` }}>
                <div style={{ fontFamily: headingFont, fontSize: "2.2rem", fontWeight: 900, color: accent, ...glowText }}>
                  {String(u.n).padStart(2, "0")}
                </div>
                <div style={{ fontSize: "0.7rem", letterSpacing: "2px", textTransform: "uppercase", opacity: 0.6, marginTop: "4px" }}>{u.l}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ABOUT + HIGHLIGHTS */}
      <Section title="About the Event" heading={`What is ${content.title}?`} accent={accent} headingFont={headingFont}>
        <p style={{ opacity: 0.78, maxWidth: "760px", lineHeight: 1.7, marginBottom: "40px", fontSize: "1.08rem" }}>{content.about}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
          {content.highlights?.map((h, i) => (
            <div key={i} style={{ ...cardStyle, padding: "26px", animation: floatAnim, animationDelay: `${i * 0.25}s` }}>
              <div style={{ fontSize: "2.4rem", marginBottom: "14px" }}>{h.icon}</div>
              <div style={{ fontFamily: headingFont, fontSize: "1.15rem", fontWeight: 700, marginBottom: "8px" }}>{h.title}</div>
              <div style={{ opacity: 0.7, fontSize: "0.94rem", lineHeight: 1.6 }}>{h.description}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* SCHEDULE */}
      <Section title="Schedule" heading="Event Timeline" accent={accent} headingFont={headingFont}>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {content.schedule?.map((s, i) => (
            <div key={i} style={{ ...cardStyle, padding: "22px 24px", display: "flex", gap: "22px", flexWrap: "wrap" }}>
              <div style={{ minWidth: "92px", fontWeight: 800, color: accent, fontFamily: headingFont }}>{s.time}</div>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", marginBottom: "6px" }}>
                  <span style={{ fontFamily: headingFont, fontWeight: 700, fontSize: "1.05rem" }}>{s.title}</span>
                  {s.tag && (
                    <span style={{ padding: "3px 10px", borderRadius: radius === "0px" ? 0 : "6px", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "1px", background: `${accent2}22`, color: accent2 }}>
                      {s.tag}
                    </span>
                  )}
                </div>
                <div style={{ opacity: 0.7, fontSize: "0.92rem", marginBottom: "6px" }}>{s.description}</div>
                {s.speaker && <div style={{ fontSize: "0.85rem", color: accent }}>👤 {s.speaker}</div>}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* REGISTRATION */}
      <Section title="Registration" heading="Secure Your Spot" accent={accent} headingFont={headingFont} center>
        <div style={{ ...cardStyle, padding: "40px", maxWidth: "560px", margin: "0 auto", textAlign: "center", boxShadow: glow ? `0 0 60px ${accent}44` : shadow }}>
          <div style={{ opacity: 0.6, fontSize: "0.9rem" }}>Registration Fee</div>
          <div style={{ fontFamily: headingFont, fontSize: "2.6rem", fontWeight: 900, color: accent, margin: "10px 0", ...glowText }}>{content.registration?.fee}</div>
          <div style={{ opacity: 0.7, fontSize: "0.9rem", marginBottom: "20px" }}>
            Deadline: <strong style={{ color: colors.textColor }}>{content.registration?.deadline}</strong>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", textAlign: "left" }}>
            {content.registration?.perks?.map((p, i) => (
              <li key={i} style={{ padding: "10px 0", borderBottom: `1px solid ${accent}18`, opacity: 0.85, fontSize: "0.94rem" }}>✓ {p}</li>
            ))}
          </ul>
          <a
            href={content.registration?.formUrl || "#register"}
            style={{ ...pill(), display: "block", padding: "15px", fontWeight: 800, textDecoration: "none", color: "#08080a", background: `linear-gradient(135deg, ${accent}, ${accent2})`, boxShadow: glow ? `0 0 30px ${accent}55` : "none" }}
          >
            {content.ctaText || "Register Now →"}
          </a>
        </div>
      </Section>

      {/* FAQ */}
      {content.faqs?.length > 0 && (
        <Section title="FAQ" heading="Frequently Asked Questions" accent={accent} headingFont={headingFont}>
          <div style={{ maxWidth: "800px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {content.faqs.map((f, i) => (
              <div key={i} style={{ ...cardStyle, overflow: "hidden" }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: "100%", padding: "18px 22px", background: "transparent", border: "none", color: colors.textColor, fontFamily: bodyFont, fontWeight: 600, fontSize: "0.98rem", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", textAlign: "left" }}
                >
                  <span>{f.question}</span>
                  <span style={{ color: accent, fontSize: "1.3rem", transition: `transform ${animDur}`, transform: openFaq === i ? "rotate(45deg)" : "none" }}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: "0 22px 18px", opacity: 0.72, lineHeight: 1.7, fontSize: "0.92rem" }}>{f.answer}</div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* CONTACTS */}
      {content.contacts?.length > 0 && (
        <Section title="Contact" heading="Get in Touch" accent={accent} headingFont={headingFont} center>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", maxWidth: "640px", margin: "0 auto" }}>
            {content.contacts.map((c, i) => (
              <div key={i} style={{ ...cardStyle, padding: "26px", textAlign: "center" }}>
                <div style={{ width: "68px", height: "68px", borderRadius: "50%", margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", background: `${accent}1a`, border: `2px solid ${accent}` }}>
                  {c.name.charAt(0)}
                </div>
                <div style={{ fontFamily: headingFont, fontWeight: 700 }}>{c.name}</div>
                <div style={{ color: accent, fontSize: "0.85rem", margin: "4px 0" }}>{c.role}</div>
                <div style={{ opacity: 0.65, fontSize: "0.85rem" }}>{c.contact}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      <footer style={{ padding: "40px 24px", textAlign: "center", opacity: 0.5, fontSize: "0.85rem", borderTop: `1px solid ${accent}18` }}>
        © {new Date().getFullYear()} {content.title}. Crafted with EventForge Studio.
      </footer>

      {withBots && (
        <>
          <AICopilot spec={spec} accent={accent} />
          <VoiceBot spec={spec} accent={accent} />
        </>
      )}

      <style>{`
        @keyframes studioFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
      `}</style>
    </div>
  );
}

function Section({
  title,
  heading,
  accent,
  headingFont,
  center,
  children,
}: {
  title: string;
  heading: string;
  accent: string;
  headingFont: string;
  center?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section style={{ padding: "72px 24px", position: "relative", zIndex: 1, maxWidth: "1180px", margin: "0 auto", textAlign: center ? "center" : "left" }}>
      <div style={{ fontSize: "0.72rem", letterSpacing: "3px", textTransform: "uppercase", color: accent, marginBottom: "10px" }}>{title}</div>
      <h2 style={{ fontFamily: headingFont, fontSize: "clamp(1.7rem, 4vw, 2.8rem)", fontWeight: 800, marginBottom: "28px" }}>{heading}</h2>
      {children}
    </section>
  );
}
