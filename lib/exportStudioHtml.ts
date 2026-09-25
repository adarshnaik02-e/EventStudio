import {
  EventStudioSpec,
  getBorderRadius,
  getShadow,
  getBackground,
} from "./studioTypes";

/** Escape text for safe insertion into HTML element content. */
function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Escape for a double-quoted HTML attribute. */
function escAttr(s: unknown): string {
  return esc(s).replace(/'/g, "&#39;");
}

export function generateStudioHtml(spec: EventStudioSpec): string {
  const { content: c, styling: st } = spec;
  const accent = st.colors.primaryAccent;
  const accent2 = st.colors.secondaryAccent;
  const text = st.colors.textColor;
  const surface = st.colors.surfaceColor;
  const bg = getBackground(st.colors.backgroundType, accent, accent2);
  const radius = getBorderRadius(st.visualStyle.borderStyle);
  const cardRadius = radius === "999px" ? "20px" : radius;
  const shadow = getShadow(st.visualStyle.shadowIntensity, accent);
  const glow = st.visualStyle.glowEffects;
  const scale = st.typography.fontSizeScale || 1;
  const floaty = st.animations.enableFloatingCards;
  const glassBlur =
    st.colors.backgroundType === "glass-dark" || st.visualStyle.borderStyle === "glassmorphism";

  const headingFont = st.typography.fontHeading;
  const bodyFont = st.typography.fontBody;
  const fontsQuery = Array.from(new Set([headingFont, bodyFont]))
    .map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700;800;900`)
    .join("&");

  const pillRadius = radius === "0px" ? "0px" : "999px";
  const glowText = glow ? `text-shadow:0 0 24px ${accent}66;` : "";

  const badges = (c.badges || [])
    .map((b) => `<span class="badge">${esc(b)}</span>`)
    .join("");

  const highlights = (c.highlights || [])
    .map(
      (h, i) => `
      <div class="card float" style="animation-delay:${i * 0.25}s">
        <div style="font-size:2.4rem;margin-bottom:14px">${esc(h.icon)}</div>
        <div class="card-title">${esc(h.title)}</div>
        <div class="muted" style="font-size:0.94rem;line-height:1.6">${esc(h.description)}</div>
      </div>`
    )
    .join("");

  const schedule = (c.schedule || [])
    .map(
      (s) => `
      <div class="card sched">
        <div class="sched-time">${esc(s.time)}</div>
        <div style="flex:1;min-width:200px">
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:6px">
            <span class="card-title" style="margin:0">${esc(s.title)}</span>
            ${s.tag ? `<span class="tag">${esc(s.tag)}</span>` : ""}
          </div>
          <div class="muted" style="font-size:0.92rem;margin-bottom:6px">${esc(s.description)}</div>
          ${s.speaker ? `<div style="font-size:0.85rem;color:${accent}">👤 ${esc(s.speaker)}</div>` : ""}
        </div>
      </div>`
    )
    .join("");

  const perks = (c.registration?.perks || [])
    .map((p) => `<li>✓ ${esc(p)}</li>`)
    .join("");

  const faqs = (c.faqs || [])
    .map(
      (f, i) => `
      <div class="card faq-item">
        <button class="faq-q" onclick="toggleFaq(${i})">
          <span>${esc(f.question)}</span>
          <span class="faq-icon" id="fi-${i}">+</span>
        </button>
        <div class="faq-a" id="fa-${i}">${esc(f.answer)}</div>
      </div>`
    )
    .join("");

  const contacts = (c.contacts || [])
    .map(
      (ct) => `
      <div class="card" style="text-align:center">
        <div class="avatar">${esc(ct.name.charAt(0))}</div>
        <div class="card-title" style="margin:0">${esc(ct.name)}</div>
        <div style="color:${accent};font-size:0.85rem;margin:4px 0">${esc(ct.role)}</div>
        <div class="muted" style="font-size:0.85rem">${esc(ct.contact)}</div>
      </div>`
    )
    .join("");

  // JSON for the embedded offline copilot (safe: closing-tag sequence escaped).
  const specJson = JSON.stringify(spec).replace(/</g, "\\u003c");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(c.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?${fontsQuery}&display=swap" rel="stylesheet">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  :root { --accent:${accent}; --accent2:${accent2}; --text:${text}; --surface:${surface}; }
  html { font-size:${scale * 100}%; }
  body { font-family:'${bodyFont}',sans-serif; background:${bg}; color:${text}; min-height:100vh; overflow-x:hidden; position:relative; }
  h1,h2,h3 { font-family:'${headingFont}',sans-serif; }
  .wrap { max-width:1180px; margin:0 auto; padding:0 24px; }
  .glow-orb { position:absolute; border-radius:50%; filter:blur(120px); pointer-events:none; }
  .orb1 { top:-120px; left:-120px; width:460px; height:460px; background:${accent}; opacity:0.18; ${floaty ? "animation:float 9s ease-in-out infinite;" : ""} }
  .orb2 { bottom:-140px; right:-100px; width:380px; height:380px; background:${accent2}; opacity:0.16; ${floaty ? "animation:float 11s ease-in-out infinite reverse;" : ""} }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
  .card { background:${surface}; border:1px solid ${accent}2a; border-radius:${cardRadius}; box-shadow:${shadow}; ${glassBlur ? "backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);" : ""} padding:26px; }
  .card-title { font-family:'${headingFont}',sans-serif; font-size:1.15rem; font-weight:700; margin-bottom:8px; }
  .muted { opacity:0.72; }
  .float { ${floaty ? "animation:float 7s ease-in-out infinite;" : ""} }
  section { padding:72px 24px; position:relative; z-index:1; }
  .section-label { font-size:0.72rem; letter-spacing:3px; text-transform:uppercase; color:${accent}; margin-bottom:10px; }
  .section-title { font-size:clamp(1.7rem,4vw,2.8rem); font-weight:800; margin-bottom:28px; }
  /* Hero */
  .hero { min-height:92vh; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:96px 24px 72px; position:relative; z-index:1; }
  .badges { display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-bottom:28px; }
  .badge { border-radius:${pillRadius}; padding:6px 15px; font-size:0.8rem; font-weight:600; background:${accent}18; border:1px solid ${accent}44; color:${accent}; }
  .hero h1 { font-weight:900; line-height:1.05; font-size:clamp(2.6rem,7vw,5.5rem); margin-bottom:18px; background:linear-gradient(135deg,${text} 0%,${accent} 60%,${accent2} 100%); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; ${glowText} }
  .tagline { font-size:clamp(1.05rem,2.4vw,1.5rem); opacity:0.8; max-width:640px; margin:0 auto 32px; }
  .meta { display:flex; flex-wrap:wrap; gap:18px; justify-content:center; margin-bottom:40px; opacity:0.85; }
  .cta { border-radius:${pillRadius}; display:inline-block; padding:16px 42px; font-weight:800; font-size:1rem; text-decoration:none; color:#08080a; background:linear-gradient(135deg,${accent},${accent2}); ${glow ? `box-shadow:0 0 40px ${accent}66;` : `box-shadow:${shadow};`} transition:transform .3s; }
  .cta:hover { transform:translateY(-3px) scale(1.02); }
  /* Countdown */
  .cd { display:flex; gap:16px; justify-content:center; margin-top:56px; flex-wrap:wrap; }
  .cd-item { min-width:84px; text-align:center; padding:16px 20px; }
  .cd-num { font-family:'${headingFont}',sans-serif; font-size:2.2rem; font-weight:900; color:${accent}; ${glowText} }
  .cd-label { font-size:0.7rem; letter-spacing:2px; text-transform:uppercase; opacity:0.6; margin-top:4px; }
  /* Schedule */
  .sched { display:flex; gap:22px; flex-wrap:wrap; margin-bottom:14px; padding:22px 24px; }
  .sched-time { min-width:92px; font-weight:800; color:${accent}; font-family:'${headingFont}',sans-serif; }
  .tag { padding:3px 10px; border-radius:${radius === "0px" ? "0" : "6px"}; font-size:0.68rem; font-weight:700; letter-spacing:1px; background:${accent2}22; color:${accent2}; }
  /* Registration */
  .reg-card { max-width:560px; margin:0 auto; text-align:center; padding:40px; }
  .reg-fee { font-family:'${headingFont}',sans-serif; font-size:2.6rem; font-weight:900; color:${accent}; margin:10px 0; ${glowText} }
  .perks { list-style:none; text-align:left; margin:0 0 24px; }
  .perks li { padding:10px 0; border-bottom:1px solid ${accent}18; opacity:0.85; font-size:0.94rem; }
  /* FAQ */
  .faq-list { max-width:800px; display:flex; flex-direction:column; gap:12px; }
  .faq-item { padding:0; overflow:hidden; }
  .faq-q { width:100%; padding:18px 22px; background:transparent; border:none; color:${text}; font-family:'${bodyFont}',sans-serif; font-weight:600; font-size:0.98rem; display:flex; justify-content:space-between; align-items:center; cursor:pointer; text-align:left; }
  .faq-icon { color:${accent}; font-size:1.3rem; transition:transform .3s; }
  .faq-icon.open { transform:rotate(45deg); }
  .faq-a { max-height:0; overflow:hidden; padding:0 22px; opacity:0.72; line-height:1.7; font-size:0.92rem; transition:all .3s; }
  .faq-a.open { max-height:400px; padding:0 22px 18px; }
  .avatar { width:68px; height:68px; border-radius:50%; margin:0 auto 14px; display:flex; align-items:center; justify-content:center; font-size:1.6rem; background:${accent}1a; border:2px solid ${accent}; }
  .grid { display:grid; gap:20px; }
  .grid-hl { grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); }
  .grid-ct { grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); max-width:640px; margin:0 auto; }
  footer { padding:40px 24px; text-align:center; opacity:0.5; font-size:0.85rem; border-top:1px solid ${accent}18; }
  /* Bots */
  .fab { position:fixed; right:24px; border:none; cursor:pointer; border-radius:50%; display:flex; align-items:center; justify-content:center; z-index:1000; transition:all .3s; }
  .fab-chat { bottom:24px; width:56px; height:56px; font-size:1.4rem; background:linear-gradient(135deg,${accent},${accent2}); box-shadow:0 8px 32px ${accent}66; }
  .fab-voice { bottom:92px; width:48px; height:48px; font-size:1.2rem; background:linear-gradient(135deg,${accent2},${accent}); box-shadow:0 6px 24px ${accent2}66; }
  .panel { position:fixed; right:24px; z-index:999; width:min(360px,calc(100vw - 32px)); background:rgba(10,10,14,0.97); border:1px solid ${accent}33; border-radius:20px; backdrop-filter:blur(20px); box-shadow:0 24px 80px rgba(0,0,0,0.6); overflow:hidden; display:none; }
  .panel.open { display:flex; flex-direction:column; }
  #chatPanel { bottom:92px; max-height:520px; }
  #voicePanel { bottom:152px; }
  .panel-head { padding:14px 18px; border-bottom:1px solid ${accent}22; background:${accent}12; font-weight:700; font-size:0.9rem; }
  .msgs { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:10px; max-height:320px; }
  .msg { max-width:85%; padding:10px 14px; font-size:0.85rem; line-height:1.5; }
  .msg.u { align-self:flex-end; background:linear-gradient(135deg,${accent},${accent2}); color:#08080a; border-radius:16px 16px 4px 16px; }
  .msg.a { align-self:flex-start; background:rgba(255,255,255,0.06); border:1px solid ${accent}22; border-radius:16px 16px 16px 4px; white-space:pre-wrap; }
  .chat-in { display:flex; gap:8px; padding:12px 16px; border-top:1px solid ${accent}22; }
  .chat-in input, .chat-in select { flex:1; background:rgba(255,255,255,0.06); border:1px solid ${accent}22; border-radius:12px; padding:10px 12px; color:${text}; font-size:0.85rem; outline:none; }
  .chat-in button { width:40px; border-radius:12px; border:none; cursor:pointer; background:linear-gradient(135deg,${accent},${accent2}); font-size:1rem; }
  .vbtn { padding:10px 12px; border-radius:10px; border:1px solid ${accent}33; background:${accent}12; color:${accent}; font-size:0.82rem; cursor:pointer; text-align:left; }
  @media (max-width:640px){ .sched{flex-direction:column;gap:8px} }
</style>
</head>
<body>
<div class="glow-orb orb1"></div>
<div class="glow-orb orb2"></div>

<section class="hero">
  <div class="badges">${badges}</div>
  <h1>${esc(c.title)}</h1>
  <p class="tagline">${esc(c.tagline)}</p>
  <div class="meta"><span>📅 ${esc(c.date)}</span><span>⏰ ${esc(c.time)}</span><span>📍 ${esc(c.venue)}</span></div>
  <a class="cta" href="${escAttr(c.registration?.formUrl || "#register")}">${esc(c.ctaText || "Register Now →")}</a>
  <div class="cd" id="cd">
    <div class="card cd-item float"><div class="cd-num" id="cd-d">00</div><div class="cd-label">Days</div></div>
    <div class="card cd-item float"><div class="cd-num" id="cd-h">00</div><div class="cd-label">Hours</div></div>
    <div class="card cd-item float"><div class="cd-num" id="cd-m">00</div><div class="cd-label">Minutes</div></div>
    <div class="card cd-item float"><div class="cd-num" id="cd-s">00</div><div class="cd-label">Seconds</div></div>
  </div>
</section>

<section class="wrap">
  <div class="section-label">About the Event</div>
  <h2 class="section-title">What is ${esc(c.title)}?</h2>
  <p class="muted" style="max-width:760px;line-height:1.7;margin-bottom:40px;font-size:1.08rem">${esc(c.about)}</p>
  <div class="grid grid-hl">${highlights}</div>
</section>

<section class="wrap">
  <div class="section-label">Schedule</div>
  <h2 class="section-title">Event Timeline</h2>
  ${schedule}
</section>

<section class="wrap" style="text-align:center">
  <div class="section-label">Registration</div>
  <h2 class="section-title">Secure Your Spot</h2>
  <div class="card reg-card">
    <div class="muted" style="font-size:0.9rem">Registration Fee</div>
    <div class="reg-fee">${esc(c.registration?.fee)}</div>
    <div class="muted" style="font-size:0.9rem;margin-bottom:20px">Deadline: <strong style="color:${text}">${esc(c.registration?.deadline)}</strong></div>
    <ul class="perks">${perks}</ul>
    <a class="cta" style="display:block" href="${escAttr(c.registration?.formUrl || "#register")}">${esc(c.ctaText || "Register Now →")}</a>
  </div>
</section>

<section class="wrap">
  <div class="section-label">FAQ</div>
  <h2 class="section-title">Frequently Asked Questions</h2>
  <div class="faq-list">${faqs}</div>
</section>

<section class="wrap" style="text-align:center">
  <div class="section-label">Contact</div>
  <h2 class="section-title">Get in Touch</h2>
  <div class="grid grid-ct">${contacts}</div>
</section>

<footer>© ${new Date().getFullYear()} ${esc(c.title)}. Crafted with EventForge Studio.</footer>

<!-- Voice Bot -->
<button class="fab fab-voice" onclick="togglePanel('voicePanel')" title="Voice Bot">🎙️</button>
<div class="panel" id="voicePanel">
  <div class="panel-head">🌐 Voice Translation Bot</div>
  <div style="padding:14px 16px;display:flex;flex-direction:column;gap:10px">
    <select id="voiceLang" class="vbtn" style="width:100%">
      <option value="en-US">🇺🇸 English</option>
      <option value="hi-IN">🇮🇳 हिंदी</option>
      <option value="es-ES">🇪🇸 Español</option>
      <option value="fr-FR">🇫🇷 Français</option>
      <option value="de-DE">🇩🇪 Deutsch</option>
      <option value="zh-CN">🇨🇳 中文</option>
      <option value="ar-SA">🇸🇦 العربية</option>
      <option value="ja-JP">🇯🇵 日本語</option>
    </select>
    <div id="voiceResult" class="msg a" style="max-width:100%;display:none"></div>
    <div style="display:flex;gap:8px">
      <button class="vbtn" style="flex:1" id="micBtn" onclick="startMic()">🎤 Speak</button>
      <button class="vbtn" style="flex:1" onclick="announce()">🔊 Announce</button>
    </div>
    <button class="vbtn" onclick="speakText(dateLine())">📅 Read Date & Time</button>
    <button class="vbtn" onclick="speakText(regLine())">💰 Read Registration</button>
  </div>
</div>

<!-- Copilot -->
<button class="fab fab-chat" onclick="togglePanel('chatPanel')" title="Ask AI Copilot">🤖</button>
<div class="panel" id="chatPanel">
  <div class="panel-head">🤖 AI Event Copilot · ${esc(c.title)}</div>
  <div class="msgs" id="msgs"></div>
  <div class="chat-in">
    <input id="chatInput" placeholder="Ask about the event..." onkeydown="if(event.key==='Enter')sendChat()">
    <button onclick="sendChat()">↑</button>
  </div>
</div>

<script>
  var SPEC = ${specJson};
  var C = SPEC.content;

  /* Countdown */
  function tick(){
    var t = new Date(C.countdownISO).getTime() - Date.now();
    if (t < 0) t = 0;
    var d = Math.floor(t/86400000), h = Math.floor((t%86400000)/3600000), m = Math.floor((t%3600000)/60000), s = Math.floor((t%60000)/1000);
    document.getElementById('cd-d').textContent = String(d).padStart(2,'0');
    document.getElementById('cd-h').textContent = String(h).padStart(2,'0');
    document.getElementById('cd-m').textContent = String(m).padStart(2,'0');
    document.getElementById('cd-s').textContent = String(s).padStart(2,'0');
  }
  tick(); setInterval(tick,1000);

  /* FAQ */
  function toggleFaq(i){
    document.getElementById('fa-'+i).classList.toggle('open');
    document.getElementById('fi-'+i).classList.toggle('open');
  }

  function togglePanel(id){
    var p = document.getElementById(id);
    p.classList.toggle('open');
    if (id === 'chatPanel' && p.classList.contains('open') && !document.getElementById('msgs').children.length) {
      addMsg('a', "Hi! I'm your " + C.title + " assistant. Ask me about the schedule, registration, or anything else!");
    }
  }

  /* Offline copilot: answers strictly from spec */
  function answer(q){
    var l = q.toLowerCase();
    if (/when|date|time|start/.test(l)) return "The event is on " + C.date + " at " + C.time + " at " + C.venue + ".";
    if (/where|venue|location/.test(l)) return "The event is held at " + C.venue + ".";
    if (/register|sign up|join|ticket|fee|cost|price/.test(l)) return "Registration is " + C.registration.fee + ". Deadline: " + C.registration.deadline + ". Perks include: " + C.registration.perks.join(", ") + ".";
    if (/food|lunch|meal|eat|snack/.test(l)) { var f = C.registration.perks.filter(function(p){return /food|meal|snack|lunch/i.test(p)}); return f.length ? "Yes — " + f.join(", ") + "." : "Food details aren't listed. Contact " + (C.contacts[0] ? C.contacts[0].contact : "the organizers") + "."; }
    if (/prize|win|award/.test(l)) { var p = C.registration.perks.filter(function(x){return /prize|award/i.test(x)}); return p.length ? p.join(", ") : "See the highlights for prize details."; }
    if (/schedule|agenda|program|when.*happen/.test(l)) return "Schedule:\\n" + C.schedule.slice(0,5).map(function(s){return "• " + s.time + " — " + s.title}).join("\\n");
    if (/contact|organi|help|reach/.test(l)) return "Contacts:\\n" + C.contacts.map(function(ct){return "• " + ct.name + " (" + ct.role + "): " + ct.contact}).join("\\n");
    var faq = C.faqs.filter(function(f){ return f.question.toLowerCase().split(' ').some(function(w){ return w.length>3 && l.indexOf(w)>=0 }); })[0];
    if (faq) return faq.answer;
    return "I don't have that detail. Please contact " + (C.contacts[0] ? C.contacts[0].contact : "the organizers") + ".";
  }
  function addMsg(role, text){
    var d = document.createElement('div');
    d.className = 'msg ' + role; d.textContent = text;
    document.getElementById('msgs').appendChild(d);
    d.scrollIntoView({behavior:'smooth'});
  }
  function sendChat(){
    var inp = document.getElementById('chatInput'); var q = inp.value.trim(); if(!q) return;
    addMsg('u', q); inp.value='';
    setTimeout(function(){ addMsg('a', answer(q)); }, 300);
  }

  /* Voice: TTS + speech recognition */
  function speakText(t){
    if(!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(t);
    u.lang = document.getElementById('voiceLang').value; u.rate = 0.95;
    var r = document.getElementById('voiceResult'); r.style.display='block'; r.textContent = t;
    window.speechSynthesis.speak(u);
  }
  function dateLine(){ return "Welcome to " + C.title + ". The event is on " + C.date + " at " + C.time + ", held at " + C.venue + "."; }
  function regLine(){ return "Registration for " + C.title + " is " + C.registration.fee + ". Deadline is " + C.registration.deadline + "."; }
  function announce(){ speakText(dateLine()); }
  function startMic(){
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SR){ speakText("Speech recognition is not supported in this browser. Please use Chrome or Edge."); return; }
    var rec = new SR(); rec.lang = document.getElementById('voiceLang').value; rec.interimResults = false;
    var btn = document.getElementById('micBtn'); btn.textContent = '● Listening...';
    rec.onresult = function(e){
      var q = e.results[0][0].transcript;
      var a = answer(q);
      var r = document.getElementById('voiceResult'); r.style.display='block'; r.textContent = '🎤 ' + q + '\\n\\n' + a;
      speakText(a);
    };
    rec.onend = function(){ btn.textContent = '🎤 Speak'; };
    rec.onerror = function(){ btn.textContent = '🎤 Speak'; };
    rec.start();
  }
</script>
</body>
</html>`;
}
