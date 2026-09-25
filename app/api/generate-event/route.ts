import { NextRequest, NextResponse } from "next/server";
import { EventStudioSpec, PRESET_STYLES } from "@/lib/studioTypes";

const SYSTEM_PROMPT = `You are an expert event page architect. Extract structured event data from unstructured text and return ONLY valid JSON matching this exact schema. Be creative and fill in ALL missing details with realistic, context-aware content.

Return this exact JSON structure:
{
  "content": {
    "title": "event name",
    "slug": "url-safe-slug",
    "tagline": "punchy 1-line tagline",
    "date": "human readable date",
    "time": "event time",
    "venue": "location",
    "badges": ["3-5 short badge labels"],
    "ctaText": "CTA button text",
    "countdownISO": "ISO 8601 datetime",
    "about": "2-3 sentence description",
    "highlights": [{"icon":"emoji","title":"string","description":"string"}],
    "schedule": [{"time":"string","title":"string","description":"string","speaker":"string","tag":"string"}],
    "registration": {"fee":"string","deadline":"string","formUrl":"#register","perks":["string"]},
    "contacts": [{"name":"string","role":"string","contact":"string"}],
    "faqs": [{"question":"string","answer":"string"}]
  },
  "styling": {
    "colors": {
      "primaryAccent": "hex color",
      "secondaryAccent": "hex color",
      "backgroundType": "solid|mesh-gradient|glass-dark|aurora",
      "surfaceColor": "rgba color",
      "textColor": "hex color"
    },
    "typography": {"fontHeading":"Google Font name","fontBody":"Inter","fontSizeScale":1.0},
    "visualStyle": {"borderStyle":"sharp|rounded-xl|pill|glassmorphism","shadowIntensity":"none|soft|medium|strong","glowEffects":true},
    "animations": {"animationSpeed":"subtle|energetic","enableFloatingCards":true},
    "preset": "brutalist|cyberpunk|luxe-minimal|festival-vibrant"
  }
}

PRESET SELECTION:
- Hackathon/coding/tech competition → cyberpunk (primaryAccent:#00ff88, backgroundType:mesh-gradient, fontHeading:Syne)
- Cultural/festival/art/music/dance → festival-vibrant (primaryAccent:#f59e0b, backgroundType:aurora, fontHeading:Playfair Display)
- Tech conference/summit/seminar → luxe-minimal (primaryAccent:#06b6d4, backgroundType:glass-dark, fontHeading:Space Grotesk)
- Minimal/editorial/workshop/academic → brutalist (primaryAccent:#f4f4f5, backgroundType:solid, fontHeading:Space Grotesk)

RULES:
- Always generate at least 5 schedule items, 5 FAQs, 4 highlights, 4 perks
- If date is missing, use a date 30 days from today
- Make taglines punchy and exciting
- Return ONLY the JSON, no markdown, no explanation`;

function smartMock(text: string): EventStudioSpec {
  const lower = text.toLowerCase();
  const isHack = lower.includes("hack") || lower.includes("code") || lower.includes("build") || lower.includes("dev");
  const isCult = lower.includes("fest") || lower.includes("cultur") || lower.includes("dance") || lower.includes("music") || lower.includes("art");
  const isTech = lower.includes("conf") || lower.includes("summit") || lower.includes("seminar");

  const preset = isHack ? "cyberpunk" : isCult ? "festival-vibrant" : isTech ? "luxe-minimal" : "brutalist";
  const styling = PRESET_STYLES[preset];

  const words = text.split(/\s+/).slice(0, 6).join(" ");
  const title = words.length > 3 ? words : "Epic Event 2025";
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const future = new Date();
  future.setDate(future.getDate() + 30);
  const dateStr = future.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  if (isHack) {
    return {
      content: {
        title, slug,
        tagline: "48 Hours. Infinite Possibilities. One Winner.",
        date: dateStr, time: "9:00 AM – 9:00 AM (48 hrs)", venue: "Innovation Hub, Tech Campus",
        badges: ["🏆 $10K Prize Pool", "⚡ 48 Hours", "🤝 Team of 4", "🍕 Free Food", "🎓 Mentors"],
        ctaText: "Register Your Team →",
        countdownISO: future.toISOString(),
        about: `${title} is the ultimate 48-hour coding marathon where brilliant minds converge to build the future. Whether you're a seasoned developer or a passionate beginner, this is your arena to innovate, collaborate, and create solutions that matter.`,
        highlights: [
          { icon: "🏆", title: "$10,000 Prize Pool", description: "Compete for massive cash prizes across multiple categories." },
          { icon: "🧠", title: "Expert Mentors", description: "Get guidance from industry veterans at top tech companies." },
          { icon: "🤝", title: "Network & Connect", description: "Meet 500+ developers, designers, and entrepreneurs." },
          { icon: "🚀", title: "Launch Your Idea", description: "Best projects get incubation support and investor introductions." },
        ],
        schedule: [
          { time: "09:00 AM", title: "Registration & Check-in", description: "Arrive, collect your swag bag, and meet fellow hackers.", speaker: "Organizing Team", tag: "LOGISTICS" },
          { time: "10:00 AM", title: "Opening Ceremony", description: "Welcome address, theme reveal, and sponsor introductions.", speaker: "Event Director", tag: "CEREMONY" },
          { time: "11:00 AM", title: "Hacking Begins!", description: "The clock starts. Form teams, brainstorm, and start building.", speaker: "All Participants", tag: "HACKING" },
          { time: "02:00 PM", title: "Mentor Office Hours", description: "Book 15-minute slots with industry mentors.", speaker: "Mentor Panel", tag: "MENTORSHIP" },
          { time: "08:00 PM", title: "Mid-Hack Check-in", description: "Progress updates, team bonding, and midnight snacks.", speaker: "Organizing Team", tag: "CHECKPOINT" },
          { time: "09:00 AM+1", title: "Final Submissions", description: "Submit your project before the deadline.", speaker: "All Teams", tag: "SUBMISSION" },
          { time: "11:00 AM+1", title: "Demo Day & Judging", description: "Present your project to judges in a 3-minute pitch.", speaker: "Judges Panel", tag: "JUDGING" },
        ],
        registration: {
          fee: "Free", deadline: new Date(future.getTime() - 7 * 86400000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
          formUrl: "#register",
          perks: ["🎒 Exclusive Swag Bag", "🍕 Meals & Snacks Included", "☁️ Cloud Credits ($500)", "🏅 Certificate", "🤝 Networking with 500+ Devs"],
        },
        contacts: [
          { name: "Alex Chen", role: "Lead Organizer", contact: "alex@hackathon.dev" },
          { name: "Priya Sharma", role: "Sponsorship", contact: "priya@hackathon.dev" },
        ],
        faqs: [
          { question: "Who can participate?", answer: "Anyone 18+ with a passion for technology! Students, professionals, and hobbyists are all welcome." },
          { question: "Can I participate solo?", answer: "Teams of 2-4 are preferred, but solo participation is allowed." },
          { question: "What should I bring?", answer: "Your laptop, charger, any hardware you plan to use, and your best ideas!" },
          { question: "Are there prizes for all categories?", answer: "Yes! We have prizes for Best Overall, Best UI/UX, Most Innovative, and Best Social Impact." },
          { question: "What tech stack can I use?", answer: "Any technology, framework, or language is allowed." },
        ],
      },
      styling,
    };
  }

  if (isCult) {
    return {
      content: {
        title, slug,
        tagline: "Where Culture Comes Alive — A Celebration of Art, Music & Heritage",
        date: dateStr, time: "5:00 PM – 11:00 PM", venue: "Cultural Arts Center, Main Auditorium",
        badges: ["🎭 Live Performances", "🎨 Art Exhibition", "🍛 Food Festival", "🎵 Live Music", "🏆 Competitions"],
        ctaText: "Get Your Tickets →",
        countdownISO: future.toISOString(),
        about: `${title} is a vibrant celebration of culture, art, and community spirit. Join us for an unforgettable evening of live performances, traditional art, delicious cuisine, and joyful festivities.`,
        highlights: [
          { icon: "🎭", title: "Live Performances", description: "Breathtaking dance, music, and theatrical performances." },
          { icon: "🎨", title: "Art Exhibition", description: "Curated gallery of paintings, sculptures, and digital art." },
          { icon: "🍛", title: "Food Festival", description: "Authentic flavors from 20+ food stalls." },
          { icon: "🏆", title: "Cultural Competitions", description: "Dance, music, and art competitions with exciting prizes." },
        ],
        schedule: [
          { time: "05:00 PM", title: "Gates Open & Art Walk", description: "Explore the art exhibition and food stalls.", speaker: "Curators", tag: "EXHIBITION" },
          { time: "06:00 PM", title: "Opening Ceremony", description: "Traditional lamp lighting and welcome address.", speaker: "Chief Guest", tag: "CEREMONY" },
          { time: "06:30 PM", title: "Classical Dance Performance", description: "A mesmerizing recital by award-winning dancers.", speaker: "Dance Academy", tag: "PERFORMANCE" },
          { time: "07:30 PM", title: "Music Competition Finals", description: "Top 5 finalists compete in vocal and instrumental categories.", speaker: "Music Panel", tag: "COMPETITION" },
          { time: "09:30 PM", title: "Grand Finale & Awards", description: "Prize distribution and closing celebration.", speaker: "Organizing Committee", tag: "AWARDS" },
        ],
        registration: {
          fee: "₹299 / $5", deadline: new Date(future.getTime() - 3 * 86400000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
          formUrl: "#register",
          perks: ["🎟️ Full Event Access", "🍛 Welcome Drink", "🎨 Art Exhibition Entry", "📸 Photo Booth", "🏅 Certificate"],
        },
        contacts: [
          { name: "Meera Nair", role: "Event Coordinator", contact: "meera@culturalfest.in" },
          { name: "Rahul Verma", role: "Volunteer Head", contact: "rahul@culturalfest.in" },
        ],
        faqs: [
          { question: "Is the event open to all age groups?", answer: "Yes! Family-friendly and open to all ages. Children under 5 get free entry." },
          { question: "Can I participate in competitions?", answer: "Register for individual competitions separately. Spots are limited." },
          { question: "Is food included in the ticket price?", answer: "A welcome drink is included. Food stalls are available at additional cost." },
          { question: "Is parking available?", answer: "Yes, free parking is available at the venue." },
          { question: "Can I volunteer?", answer: "We'd love your help! Contact our volunteer head to join the organizing team." },
        ],
      },
      styling,
    };
  }

  // Default: luxe-minimal tech conf
  return {
    content: {
      title, slug,
      tagline: "The Future of Technology Starts Here",
      date: dateStr, time: "9:00 AM – 6:00 PM", venue: "Convention Center, Hall A",
      badges: ["🎤 20+ Speakers", "🌐 Hybrid Event", "🤝 Networking", "🏆 Awards", "📱 Mobile App"],
      ctaText: "Register Now →",
      countdownISO: future.toISOString(),
      about: `${title} brings together the brightest minds in technology for a day of inspiring talks, hands-on workshops, and meaningful connections. Join 1000+ professionals to explore the latest trends.`,
      highlights: [
        { icon: "🎤", title: "World-Class Speakers", description: "Hear from 20+ industry leaders sharing cutting-edge insights." },
        { icon: "🛠️", title: "Hands-On Workshops", description: "Deep-dive into practical workshops on AI, cloud, and DevOps." },
        { icon: "🌐", title: "Global Networking", description: "Connect with 1000+ professionals from across the globe." },
        { icon: "🚀", title: "Product Showcases", description: "Discover the latest tools from leading tech companies." },
      ],
      schedule: [
        { time: "09:00 AM", title: "Registration & Networking Breakfast", description: "Check in and connect with fellow attendees.", speaker: "Organizing Team", tag: "NETWORKING" },
        { time: "10:00 AM", title: "Keynote: The Next Decade of Tech", description: "An inspiring vision of where technology is headed.", speaker: "Dr. Sarah Mitchell, CTO", tag: "KEYNOTE" },
        { time: "11:30 AM", title: "Panel: AI in the Enterprise", description: "Industry leaders discuss practical AI adoption.", speaker: "Panel of 4 CTOs", tag: "PANEL" },
        { time: "01:00 PM", title: "Lunch & Exhibition Hall", description: "Explore sponsor booths and product demos.", speaker: "All Attendees", tag: "BREAK" },
        { time: "02:30 PM", title: "Workshop: Building with LLMs", description: "Hands-on session building production-ready AI applications.", speaker: "James Park, AI Engineer", tag: "WORKSHOP" },
        { time: "05:00 PM", title: "Awards & Closing Keynote", description: "Recognizing innovation and closing remarks.", speaker: "Conference Chair", tag: "CLOSING" },
      ],
      registration: {
        fee: "$299 Early Bird / $499 Regular",
        deadline: new Date(future.getTime() - 7 * 86400000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        formUrl: "#register",
        perks: ["🎟️ Full Conference Access", "☕ Meals & Refreshments", "📚 Speaker Slide Decks", "🎥 Session Recordings", "🏅 Certificate"],
      },
      contacts: [
        { name: "Jordan Lee", role: "Conference Director", contact: "jordan@techconf.io" },
        { name: "Aisha Patel", role: "Sponsorship Manager", contact: "aisha@techconf.io" },
      ],
      faqs: [
        { question: "Is this in-person or virtual?", answer: "It's a hybrid event! Attend in-person or join virtually via our live-stream platform." },
        { question: "What's included in the ticket price?", answer: "Full conference access, all meals, speaker slide decks, session recordings, and networking app access." },
        { question: "Are group discounts available?", answer: "Yes! Groups of 5+ get 20% off, and groups of 10+ get 30% off." },
        { question: "Will sessions be recorded?", answer: "All keynotes and panel sessions will be recorded and available within 48 hours." },
        { question: "Can I get a refund?", answer: "Full refunds are available up to 14 days before the event." },
      ],
    },
    styling,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text || text.trim().length < 5) {
      return NextResponse.json({ error: "Please provide event description text." }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ data: smartMock(text) });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Extract and structure this event information. Be creative with missing details:\n\n${text}` },
        ],
        temperature: 0.7,
        max_tokens: 3500,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ data: smartMock(text) });
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    if (!content) return NextResponse.json({ data: smartMock(text) });

    const parsed = JSON.parse(content);
    return NextResponse.json({ data: parsed });
  } catch (error) {
    console.error("generate-event error:", error);
    return NextResponse.json({ error: "Failed to generate event page." }, { status: 500 });
  }
}
