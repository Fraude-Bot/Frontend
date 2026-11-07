const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const configuredSiteUrl = import.meta.env.VITE_SITE_URL?.trim();
const configuredProxyTarget = import.meta.env.VITE_API_PROXY_TARGET?.trim()?.replace(
  /\/+$/,
  "",
);

const API_BASE_URL = (configuredApiBaseUrl || "/api").replace(/\/+$/, "");

function portFromHttpUrl(urlString: string): string | null {
  try {
    const url = new URL(
      urlString.includes("://") ? urlString : `http://${urlString}`,
    );
    if (url.port) {
      return url.port;
    }
    return url.protocol === "https:" ? "443" : "80";
  } catch {
    return null;
  }
}

function resolveDevStoragePort(): string {
  const fromProxy = configuredProxyTarget
    ? portFromHttpUrl(configuredProxyTarget)
    : null;
  if (fromProxy) {
    return fromProxy;
  }

  if (configuredApiBaseUrl && /^https?:\/\//i.test(configuredApiBaseUrl)) {
    const fromApiBase = portFromHttpUrl(configuredApiBaseUrl);
    if (fromApiBase) {
      return fromApiBase;
    }
  }

  return "9000";
}

function resolveCdnBaseUrl(): string {
  if (import.meta.env.DEV) {
    return `http://localhost:${resolveDevStoragePort()}/storage/`;
  }

  if (configuredApiBaseUrl && /^https?:\/\//i.test(configuredApiBaseUrl)) {
    const apiUrl = new URL(
      configuredApiBaseUrl.endsWith("/")
        ? configuredApiBaseUrl
        : `${configuredApiBaseUrl}/`,
    );
    return `${apiUrl.origin}/storage/`;
  }

  if (configuredProxyTarget) {
    return `${configuredProxyTarget}/storage/`;
  }

  return `${API_BASE_URL}/storage/`;
}

const CDN_URL = resolveCdnBaseUrl();

const ENVIRONMENT = {
  API_BASE_URL,
  SITE_URL: (
    configuredSiteUrl ||
    (typeof window === "undefined" ? "http://localhost" : window.location.origin)
  ).replace(/\/+$/, ""),
  CDN_URL,
};

function resolveCdnUrl(path: string | null | undefined): string | null {
  if (!path?.trim()) {
    return null;
  }

  const value = path.trim();
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${CDN_URL}${value.replace(/^\/+/, "")}`;
}

const API_ROUTES = {
  public: {
    media: {
      profilePicture: "/public/media/profiles",
    },
    reports: {
      search: "/public/reports/",
      searchByTitle: "/public/reports/search-by-title",
      proofs: "/public/reports/media/proofs",
      createOrganization: "/public/reports/organizations",
      createScammer: "/public/reports/scammers",
    },
    scammers: {
      suggest: "/public/scammers/suggest",
      findById: "/public/scammers/{id}",
      profilePicture: "/public/scammers/{id}/profiles",
      calendar: "/public/scammers/{id}/calendar/{year}",
      contacts: "/public/scammers/{id}/contacts",
      paymentMethods: "/public/scammers/{id}/payment-methods",
      reports: "/public/scammers/{id}/reports",
      organizations: "/public/scammers/{id}/organizations",
      map: "/public/scammers/{id}/map",
    },
    organizations: {
      suggest: "/public/organizations/suggest",
      findById: "/public/organizations/{id}",
      profilePicture: "/public/organizations/{id}/profiles",
      calendar: "/public/organizations/{id}/calendar/{year}",
      contacts: "/public/organizations/{id}/contacts",
      paymentMethods: "/public/organizations/{id}/payment-methods",
      reports: "/public/organizations/{id}/reports",
      scammers: "/public/organizations/{id}/scammers",
      map: "/public/organizations/{id}/map",
    },
  },
} as const;

export { ENVIRONMENT, API_ROUTES, CDN_URL, resolveCdnUrl };
