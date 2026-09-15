export const SOCIAL_FILTERS = [
  { platform: "Whatsapp", label: "WhatsApp" },
  { platform: "Facebook", label: "Facebook" },
  { platform: "Youtube", label: "YouTube" },
  { platform: "TikTok", label: "TikTok" },
  { platform: "Email", label: "Correo electrónico" },
  { platform: "Cellphone", label: "Celular" },
  { platform: "Telegram", label: "Telegram" },
  { platform: "Instagram", label: "Instagram" },
  { platform: "Webpage", label: "Sitio Web" },
  { platform: "Other", label: "Otro" },
] as const;

const PLATFORM_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  facebook: "Facebook",
  youtube: "YouTube",
  tiktok: "TikTok",
  email: "Email",
  cellphone: "Cellphone",
  telegram: "Telegram",
  instagram: "Instagram",
  webpage: "Webpage",
  url: "Webpage", 
  other: "Otro",
};

export function getPlatformLabel(platform: string): string {
  return PLATFORM_LABELS[platform.toLowerCase()] ?? platform;
}

function digitsOnly(value: string): string {
  return value.replace(/[^\d+]/g, "");
}

function stripAtPrefix(value: string): string {
  return value.replace(/^@/, "");
}

function stripPathSuffix(value: string): string {
  return value.replace(/\/.*$/, "");
}

export function getContactHref(reference: string, platform?: string): string {
  const value = reference.trim();
  const key = platform?.toLowerCase();

  if (!value) {
    return "#";
  }

  if (key === "email") {
    return value.startsWith("mailto:") ? value : `mailto:${value}`;
  }

  if (key === "whatsapp") {
    return `https://wa.me/${digitsOnly(value).replace(/\+/g, "")}`;
  }

  if (key === "telegram") {
    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    const handle = value
      .replace(/^https?:\/\/(www\.)?t\.me\//i, "")
      .replace(/^t\.me\//i, "")
      .replace(/^@/, "");

    return `https://t.me/${handle}`;
  }

  if (key === "instagram") {
    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    const handle = stripPathSuffix(
      stripAtPrefix(
        value.replace(/^https?:\/\/(www\.)?instagram\.com\//i, ""),
      ),
    );

    return `https://www.instagram.com/${handle}`;
  }

  if (key === "tiktok") {
    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    const handle = stripPathSuffix(
      stripAtPrefix(
        value.replace(/^https?:\/\/(www\.)?tiktok\.com\/@?/i, ""),
      ),
    );

    return `https://www.tiktok.com/@${handle}`;
  }

  if (key === "youtube") {
    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    const handle = stripPathSuffix(
      stripAtPrefix(
        value.replace(
          /^https?:\/\/(www\.)?youtube\.com\/(c\/|channel\/|user\/|@)?/i,
          "",
        ),
      ),
    );

    return `https://www.youtube.com/@${handle}`;
  }

  if (key === "facebook") {
    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    const handle = stripPathSuffix(
      stripAtPrefix(
        value.replace(/^https?:\/\/(www\.)?facebook\.com\//i, ""),
      ),
    );

    return `https://www.facebook.com/${handle}`;
  }

  if (key === "cellphone") {
    return `tel:${digitsOnly(value)}`;
  }

  if (value.includes("@") && !value.includes(" ")) {
    return value.startsWith("mailto:") ? value : `mailto:${value}`;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (value.startsWith("www.") || /^[\w.-]+\.[a-z]{2,}([/?#]|$)/i.test(value)) {
    return `https://${value}`;
  }

  return "#";
}
