export type BackgroundType = "solid" | "mesh-gradient" | "glass-dark" | "aurora";
export type BorderStyle = "sharp" | "rounded-xl" | "pill" | "glassmorphism";
export type ShadowIntensity = "none" | "soft" | "medium" | "strong";
export type AnimationSpeed = "subtle" | "energetic";
export type LayoutPreset = "brutalist" | "cyberpunk" | "luxe-minimal" | "festival-vibrant";

export interface StudioStyling {
  colors: {
    primaryAccent: string;
    secondaryAccent: string;
    backgroundType: BackgroundType;
    surfaceColor: string;
    textColor: string;
  };
  typography: {
    fontHeading: string;
    fontBody: string;
    fontSizeScale: number;
  };
  visualStyle: {
    borderStyle: BorderStyle;
    shadowIntensity: ShadowIntensity;
    glowEffects: boolean;
  };
  animations: {
    animationSpeed: AnimationSpeed;
    enableFloatingCards: boolean;
  };
  preset: LayoutPreset;
}

export interface StudioContent {
  title: string;
  slug: string;
  tagline: string;
  date: string;
  time: string;
  venue: string;
  badges: string[];
  ctaText: string;
  countdownISO: string;
  about: string;
  highlights: { icon: string; title: string; description: string }[];
  schedule: { time: string; title: string; description: string; speaker: string; tag: string }[];
  registration: { fee: string; deadline: string; formUrl: string; perks: string[] };
  contacts: { name: string; role: string; contact: string }[];
  faqs: { question: string; answer: string }[];
}

export interface EventStudioSpec {
  content: StudioContent;
  styling: StudioStyling;
}

export const PRESET_STYLES: Record<LayoutPreset, StudioStyling> = {
  "brutalist": {
    colors: { primaryAccent: "#f4f4f5", secondaryAccent: "#ef4444", backgroundType: "solid", surfaceColor: "#18181b", textColor: "#f4f4f5" },
    typography: { fontHeading: "Space Grotesk", fontBody: "Inter", fontSizeScale: 1.1 },
    visualStyle: { borderStyle: "sharp", shadowIntensity: "none", glowEffects: false },
    animations: { animationSpeed: "subtle", enableFloatingCards: false },
    preset: "brutalist",
  },
  "cyberpunk": {
    colors: { primaryAccent: "#00ff88", secondaryAccent: "#7c3aed", backgroundType: "mesh-gradient", surfaceColor: "rgba(13,17,23,0.85)", textColor: "#e2e8f0" },
    typography: { fontHeading: "Syne", fontBody: "Inter", fontSizeScale: 1.0 },
    visualStyle: { borderStyle: "sharp", shadowIntensity: "strong", glowEffects: true },
    animations: { animationSpeed: "energetic", enableFloatingCards: true },
    preset: "cyberpunk",
  },
  "luxe-minimal": {
    colors: { primaryAccent: "#d4af37", secondaryAccent: "#c0c0c0", backgroundType: "glass-dark", surfaceColor: "rgba(15,15,20,0.9)", textColor: "#f8f8f0" },
    typography: { fontHeading: "Playfair Display", fontBody: "Inter", fontSizeScale: 1.0 },
    visualStyle: { borderStyle: "glassmorphism", shadowIntensity: "soft", glowEffects: true },
    animations: { animationSpeed: "subtle", enableFloatingCards: false },
    preset: "luxe-minimal",
  },
  "festival-vibrant": {
    colors: { primaryAccent: "#f59e0b", secondaryAccent: "#f43f5e", backgroundType: "aurora", surfaceColor: "rgba(45,27,105,0.65)", textColor: "#fff7ed" },
    typography: { fontHeading: "Clash Display", fontBody: "Inter", fontSizeScale: 1.05 },
    visualStyle: { borderStyle: "pill", shadowIntensity: "medium", glowEffects: true },
    animations: { animationSpeed: "energetic", enableFloatingCards: true },
    preset: "festival-vibrant",
  },
};

export const GOOGLE_FONTS = [
  "Inter", "Syne", "Space Grotesk", "Playfair Display",
  "Clash Display", "DM Sans", "Outfit", "Raleway",
  "Bebas Neue", "Josefin Sans", "Nunito", "Poppins",
];

export function getBorderRadius(style: BorderStyle): string {
  switch (style) {
    case "sharp": return "0px";
    case "rounded-xl": return "16px";
    case "pill": return "999px";
    case "glassmorphism": return "16px";
    default: return "12px";
  }
}

export function getShadow(intensity: ShadowIntensity, accent: string): string {
  switch (intensity) {
    case "none": return "none";
    case "soft": return `0 4px 20px rgba(0,0,0,0.2)`;
    case "medium": return `0 8px 32px rgba(0,0,0,0.35), 0 0 20px ${accent}22`;
    case "strong": return `0 16px 48px rgba(0,0,0,0.5), 0 0 40px ${accent}44`;
    default: return "none";
  }
}

export function getBackground(type: BackgroundType, primary: string, secondary: string): string {
  // Only hex accents are safe to blend as low-opacity tints; skip for rgba/other.
  const isHex = (c: string) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c);
  const p = isHex(primary) ? `${primary}14` : "transparent"; // ~8% alpha
  const s = isHex(secondary) ? `${secondary}14` : "transparent";
  switch (type) {
    case "solid":
      return "#09090b";
    case "mesh-gradient":
      return `radial-gradient(at 15% 20%, ${p} 0px, transparent 55%), radial-gradient(at 85% 75%, ${s} 0px, transparent 55%), linear-gradient(135deg, #0a0a0f 0%, #0d1117 50%, #0a0f1a 100%)`;
    case "glass-dark":
      return `radial-gradient(at 70% 10%, ${p} 0px, transparent 50%), linear-gradient(135deg, #0f0f14 0%, #1a1a2e 50%, #0f0f14 100%)`;
    case "aurora":
      return `radial-gradient(at 20% 25%, ${p} 0px, transparent 50%), radial-gradient(at 80% 65%, ${s} 0px, transparent 50%), linear-gradient(135deg, #1a0a2e 0%, #2d1b69 40%, #1a0a2e 100%)`;
    default:
      return "#09090b";
  }
}

/** A ready-to-render sample spec used to seed the studio on first load. */
export function sampleStudioSpec(): EventStudioSpec {
  const future = new Date();
  future.setDate(future.getDate() + 30);
  const dateStr = future.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const deadline = new Date(future.getTime() - 7 * 86400000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  return {
    content: {
      title: "HackForge 2025",
      slug: "hackforge-2025",
      tagline: "48 Hours. Infinite Possibilities. One Winner.",
      date: dateStr,
      time: "9:00 AM – 9:00 AM (48 hrs)",
      venue: "Innovation Hub, Tech Campus",
      badges: ["🏆 $10K Prize Pool", "⚡ 48 Hours", "🤝 Team of 4", "🍕 Free Food", "🎓 Mentors"],
      ctaText: "Register Your Team →",
      countdownISO: future.toISOString(),
      about: "HackForge 2025 is the ultimate 48-hour coding marathon where brilliant minds converge to build the future. Whether you're a seasoned developer or a passionate beginner, this is your arena to innovate, collaborate, and create solutions that matter.",
      highlights: [
        { icon: "🏆", title: "$10,000 Prize Pool", description: "Compete for massive cash prizes across multiple categories." },
        { icon: "🧠", title: "Expert Mentors", description: "Get guidance from industry veterans at top tech companies." },
        { icon: "🤝", title: "Network & Connect", description: "Meet 500+ developers, designers, and entrepreneurs." },
        { icon: "🚀", title: "Launch Your Idea", description: "Best projects get incubation support and investor intros." },
      ],
      schedule: [
        { time: "09:00 AM", title: "Registration & Check-in", description: "Arrive, collect your swag bag, and meet fellow hackers.", speaker: "Organizing Team", tag: "LOGISTICS" },
        { time: "10:00 AM", title: "Opening Ceremony", description: "Welcome address, theme reveal, and sponsor introductions.", speaker: "Event Director", tag: "CEREMONY" },
        { time: "11:00 AM", title: "Hacking Begins!", description: "The clock starts. Form teams, brainstorm, and start building.", speaker: "All Participants", tag: "HACKING" },
        { time: "02:00 PM", title: "Mentor Office Hours", description: "Book 15-minute slots with industry mentors.", speaker: "Mentor Panel", tag: "MENTORSHIP" },
        { time: "09:00 AM+1", title: "Final Submissions", description: "Submit your project before the deadline.", speaker: "All Teams", tag: "SUBMISSION" },
        { time: "11:00 AM+1", title: "Demo Day & Judging", description: "Present your project to judges in a 3-minute pitch.", speaker: "Judges Panel", tag: "JUDGING" },
      ],
      registration: {
        fee: "Free",
        deadline,
        formUrl: "#register",
        perks: ["🎒 Exclusive Swag Bag", "🍕 Meals & Snacks Included", "☁️ Cloud Credits ($500)", "🏅 Certificate", "🤝 Networking with 500+ Devs"],
      },
      contacts: [
        { name: "Alex Chen", role: "Lead Organizer", contact: "alex@hackforge.dev" },
        { name: "Priya Sharma", role: "Sponsorship", contact: "priya@hackforge.dev" },
      ],
      faqs: [
        { question: "Who can participate?", answer: "Anyone 18+ with a passion for technology! Students, professionals, and hobbyists are all welcome." },
        { question: "Can I participate solo?", answer: "Teams of 2-4 are preferred, but solo participation is allowed." },
        { question: "What should I bring?", answer: "Your laptop, charger, any hardware you plan to use, and your best ideas!" },
        { question: "Are meals provided?", answer: "Yes! All meals and snacks are included for the full 48 hours." },
        { question: "What tech stack can I use?", answer: "Any technology, framework, or language is allowed." },
      ],
    },
    styling: PRESET_STYLES["cyberpunk"],
  };
}
