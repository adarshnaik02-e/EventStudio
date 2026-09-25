"use client";

import { useState, useRef, useEffect } from "react";
import { EventStudioSpec } from "@/lib/studioTypes";

interface Message {
  role: "user" | "assistant";
  text: string;
}

interface Props {
  spec: EventStudioSpec;
  accent: string;
}

const SUGGESTED = [
  "When does the event start?",
  "Is food provided?",
  "How do I register?",
  "What are the prizes?",
];

export default function AICopilot({ spec, accent }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: `Hi! I'm your ${spec.content.title} assistant. Ask me anything about the event — schedule, registration, prizes, or anything else! 🎉` },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const buildContext = () => {
    const c = spec.content;
    return `You are a helpful event assistant for "${c.title}". Answer questions ONLY based on the event details below. Be friendly, concise, and accurate.

EVENT DETAILS:
- Title: ${c.title}
- Date: ${c.date}
- Time: ${c.time}
- Venue: ${c.venue}
- About: ${c.about}
- Registration Fee: ${c.registration.fee}
- Registration Deadline: ${c.registration.deadline}
- Perks: ${c.registration.perks.join(", ")}

SCHEDULE:
${c.schedule.map(s => `  ${s.time}: ${s.title} — ${s.description} (${s.speaker})`).join("\n")}

HIGHLIGHTS:
${c.highlights.map(h => `  ${h.icon} ${h.title}: ${h.description}`).join("\n")}

FAQs:
${c.faqs.map(f => `  Q: ${f.question}\n  A: ${f.answer}`).join("\n")}

CONTACTS:
${c.contacts.map(ct => `  ${ct.name} (${ct.role}): ${ct.contact}`).join("\n")}

If you don't know the answer from the event details, say "I don't have that information — please contact the organizers at ${c.contacts[0]?.contact || "the event team"}."`;
  };

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      if (!apiKey) {
        // Smart local fallback
        const lower = text.toLowerCase();
        let reply = "I don't have that specific information. Please contact the organizers for more details.";
        const c = spec.content;

        if (lower.includes("when") || lower.includes("date") || lower.includes("time") || lower.includes("start")) {
          reply = `The event is on **${c.date}** at **${c.time}** at ${c.venue}.`;
        } else if (lower.includes("where") || lower.includes("venue") || lower.includes("location")) {
          reply = `The event is held at **${c.venue}**.`;
        } else if (lower.includes("register") || lower.includes("sign up") || lower.includes("join")) {
          reply = `Registration is **${c.registration.fee}**. Deadline: ${c.registration.deadline}. Click the registration button on the page to sign up!`;
        } else if (lower.includes("food") || lower.includes("eat") || lower.includes("lunch") || lower.includes("meal")) {
          const foodPerk = c.registration.perks.find(p => p.toLowerCase().includes("food") || p.toLowerCase().includes("meal") || p.toLowerCase().includes("snack"));
          reply = foodPerk ? `Yes! ${foodPerk} is included.` : `Food details aren't specified — please check with the organizers at ${c.contacts[0]?.contact}.`;
        } else if (lower.includes("prize") || lower.includes("win") || lower.includes("award")) {
          const prizePerk = c.registration.perks.find(p => p.toLowerCase().includes("prize") || p.toLowerCase().includes("award"));
          reply = prizePerk ? `${prizePerk}` : `Check the highlights section for prize details, or contact ${c.contacts[0]?.contact}.`;
        } else if (lower.includes("schedule") || lower.includes("agenda") || lower.includes("program")) {
          reply = `Here's the schedule:\n${c.schedule.slice(0, 4).map(s => `• **${s.time}** — ${s.title}`).join("\n")}\n...and more! Check the full schedule on the page.`;
        } else if (lower.includes("contact") || lower.includes("organizer") || lower.includes("help")) {
          reply = `Contact the organizers:\n${c.contacts.map(ct => `• **${ct.name}** (${ct.role}): ${ct.contact}`).join("\n")}`;
        } else {
          const faq = c.faqs.find(f => f.question.toLowerCase().split(" ").some(w => lower.includes(w) && w.length > 3));
          if (faq) reply = faq.answer;
        }

        setTimeout(() => {
          setMessages(prev => [...prev, { role: "assistant", text: reply }]);
          setLoading(false);
        }, 600);
        return;
      }

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: buildContext() },
            ...messages.map(m => ({ role: m.role, content: m.text })),
            { role: "user", content: text },
          ],
          temperature: 0.5,
          max_tokens: 300,
        }),
      });

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't get an answer right now.";
      setMessages(prev => [...prev, { role: "assistant", text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed", bottom: "24px", right: "24px", zIndex: 1000,
          width: "56px", height: "56px", borderRadius: "50%",
          background: `linear-gradient(135deg, ${accent}, #7c3aed)`,
          border: "none", cursor: "pointer", fontSize: "1.4rem",
          boxShadow: `0 8px 32px ${accent}66, 0 0 0 0 ${accent}44`,
          transition: "all 0.3s",
          animation: open ? "none" : "copilotPulse 2s ease-in-out infinite",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
        title="Ask AI Copilot"
      >
        {open ? "✕" : "🤖"}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: "fixed", bottom: "92px", right: "24px", zIndex: 999,
          width: "min(380px, calc(100vw - 32px))",
          maxHeight: "520px",
          background: "rgba(9,9,11,0.97)",
          border: `1px solid ${accent}33`,
          borderRadius: "20px",
          backdropFilter: "blur(20px)",
          boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 40px ${accent}22`,
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          animation: "copilotSlideIn 0.3s ease",
        }}>
          {/* Header */}
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${accent}22`, background: `linear-gradient(135deg, ${accent}15, #7c3aed15)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: `linear-gradient(135deg, ${accent}, #7c3aed)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>🤖</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#f4f4f5" }}>AI Event Copilot</div>
                <div style={{ fontSize: "0.72rem", color: accent, display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                  Online · {spec.content.title}
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", maxHeight: "300px" }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "85%", padding: "10px 14px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: m.role === "user" ? `linear-gradient(135deg, ${accent}, #7c3aed)` : "rgba(255,255,255,0.06)",
                  color: "#f4f4f5", fontSize: "0.85rem", lineHeight: 1.55,
                  border: m.role === "assistant" ? `1px solid ${accent}22` : "none",
                  whiteSpace: "pre-wrap",
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", gap: "4px", padding: "10px 14px", background: "rgba(255,255,255,0.06)", borderRadius: "16px 16px 16px 4px", width: "fit-content", border: `1px solid ${accent}22` }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: accent, display: "inline-block", animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div style={{ padding: "0 16px 8px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {SUGGESTED.map((s, i) => (
                <button key={i} onClick={() => send(s)} style={{ background: `${accent}15`, border: `1px solid ${accent}33`, color: accent, borderRadius: "999px", padding: "5px 12px", fontSize: "11px", cursor: "pointer", transition: "all 0.2s", fontWeight: 500 }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: "12px 16px", borderTop: `1px solid ${accent}22`, display: "flex", gap: "8px" }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send(input)}
              placeholder="Ask anything about the event..."
              style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: `1px solid ${accent}22`, borderRadius: "12px", padding: "10px 14px", color: "#f4f4f5", fontSize: "0.85rem", outline: "none" }}
            />
            <button
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              style={{ width: "40px", height: "40px", borderRadius: "12px", background: input.trim() ? `linear-gradient(135deg, ${accent}, #7c3aed)` : "rgba(255,255,255,0.06)", border: "none", cursor: input.trim() ? "pointer" : "default", fontSize: "1rem", transition: "all 0.2s", flexShrink: 0 }}
            >
              ↑
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes copilotPulse { 0%,100%{box-shadow:0 8px 32px ${accent}66,0 0 0 0 ${accent}44} 50%{box-shadow:0 8px 32px ${accent}88,0 0 0 12px ${accent}00} }
        @keyframes copilotSlideIn { from{opacity:0;transform:translateY(20px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes dotBounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
      `}</style>
    </>
  );
}
