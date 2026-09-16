export interface Subscription {
  id: string;
  name: string;
  price: number;
  billingDate: string; // YYYY-MM-DD
  logo?: string;
  brandColor: string;
  category: string;
  cycle: "monthly" | "yearly"; // Enforce this
}

export interface ServicePreset {
  id: string;
  name: string;
  brandColor: string;
  category: string;
  defaultPrice: number;
  logo: string;
  cycle: "monthly" | "yearly";
}

export const POPULAR_PRESETS: ServicePreset[] = [
  // AI & Tools
  {
    id: "chatgpt",
    name: "ChatGPT Plus",
    brandColor: "#10A37F",
    category: "AI & Tools",
    defaultPrice: 700,
    logo: "https://chatgpt.com/favicon.ico",
    cycle: "monthly",
  },
  {
    id: "claude",
    name: "Claude Pro",
    brandColor: "#D97757",
    category: "AI & Tools",
    defaultPrice: 700,
    logo: "https://claude.ai/images/claude_icon.svg", // Fallback will work if this fails
    cycle: "monthly",
  },
  {
    id: "gemini",
    name: "Google Gemini",
    brandColor: "#4285F4",
    category: "AI & Tools",
    defaultPrice: 750,
    logo: "https://gemini.google.com/favicon.ico",
    cycle: "monthly",
  },
  {
    id: "copilot",
    name: "Microsoft Copilot",
    brandColor: "#00A4EF",
    category: "AI & Tools",
    defaultPrice: 750,
    logo: "https://copilot.microsoft.com/favicon.ico",
    cycle: "monthly",
  },
  {
    id: "midjourney",
    name: "Midjourney",
    brandColor: "#FFFFFF",
    category: "AI & Tools",
    defaultPrice: 350,
    logo: "https://www.midjourney.com/favicon.ico",
    cycle: "monthly",
  },

  // Streaming
  {
    id: "netflix",
    name: "Netflix",
    brandColor: "#E50914",
    category: "Streaming",
    defaultPrice: 419,
    logo: "https://assets.nflxext.com/ffe/siteui/common/icons/nficon2023.ico",
    cycle: "monthly",
  },
  {
    id: "disneyplus",
    name: "Disney+",
    brandColor: "#113CCF",
    category: "Streaming",
    defaultPrice: 289,
    logo: "https://www.hotstar.com/favicon.ico",
    cycle: "monthly",
  },
  {
    id: "youtube_premium",
    name: "YouTube Premium",
    brandColor: "#FF0000",
    category: "Streaming",
    defaultPrice: 179,
    logo: "https://www.youtube.com/s/desktop/f1725515/img/favicon.ico",
    cycle: "monthly",
  },
  {
    id: "amazon_prime",
    name: "Amazon Prime Video",
    brandColor: "#00A8E1",
    category: "Streaming",
    defaultPrice: 149,
    logo: "https://www.amazon.com/favicon.ico",
    cycle: "monthly",
  },
  {
    id: "max",
    name: "Max",
    brandColor: "#002BE7",
    category: "Streaming",
    defaultPrice: 199,
    logo: "https://www.max.com/favicon.ico",
    cycle: "monthly",
  },
  {
    id: "apple_tv",
    name: "Apple TV+",
    brandColor: "#000000",
    category: "Streaming",
    defaultPrice: 249,
    logo: "https://www.apple.com/favicon.ico",
    cycle: "monthly",
  },

  // Music
  {
    id: "spotify",
    name: "Spotify",
    brandColor: "#1DB954",
    category: "Music",
    defaultPrice: 139,
    logo: "https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png",
    cycle: "monthly",
  },
  {
    id: "apple_music",
    name: "Apple Music",
    brandColor: "#FA243C",
    category: "Music",
    defaultPrice: 139,
    logo: "https://www.apple.com/favicon.ico",
    cycle: "monthly",
  },

  // Cloud
  {
    id: "icloud",
    name: "iCloud+",
    brandColor: "#0071E3",
    category: "Cloud",
    defaultPrice: 35,
    logo: "https://www.apple.com/favicon.ico",
    cycle: "monthly",
  },
  {
    id: "google_one",
    name: "Google One",
    brandColor: "#4285F4",
    category: "Cloud",
    defaultPrice: 70,
    logo: "https://one.google.com/favicon.ico",
    cycle: "monthly",
  },
  {
    id: "dropbox",
    name: "Dropbox",
    brandColor: "#0061FF",
    category: "Cloud",
    defaultPrice: 350,
    logo: "https://www.dropbox.com/favicon.ico",
    cycle: "monthly",
  },

  // Productivity
  {
    id: "canva",
    name: "Canva Pro",
    brandColor: "#7D2AE8",
    category: "Productivity",
    defaultPrice: 229,
    logo: "https://www.canva.com/favicon.ico",
    cycle: "monthly",
  },
  {
    id: "microsoft_365",
    name: "Microsoft 365",
    brandColor: "#D83B01",
    category: "Productivity",
    defaultPrice: 289,
    logo: "https://www.microsoft.com/favicon.ico",
    cycle: "monthly",
  },
  {
    id: "notion",
    name: "Notion",
    brandColor: "#000000",
    category: "Productivity",
    defaultPrice: 350,
    logo: "https://www.notion.so/images/favicon.ico",
    cycle: "monthly",
  },
  
  // Developer
  {
    id: "github_copilot",
    name: "GitHub Copilot",
    brandColor: "#171515",
    category: "Developer",
    defaultPrice: 350,
    logo: "https://github.com/favicon.ico",
    cycle: "monthly",
  },
  {
    id: "cursor",
    name: "Cursor",
    brandColor: "#000000",
    category: "Developer",
    defaultPrice: 700,
    logo: "https://cursor.sh/favicon.ico",
    cycle: "monthly",
  },
  {
    id: "vercel",
    name: "Vercel",
    brandColor: "#000000",
    category: "Developer",
    defaultPrice: 700,
    logo: "https://vercel.com/favicon.ico",
    cycle: "monthly",
  }
];

export const CATEGORIES = [
  "AI & Tools",
  "Streaming",
  "Music",
  "Cloud",
  "Productivity",
  "Developer",
  "Other"
];
