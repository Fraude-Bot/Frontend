const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

const CDN_URL = "http://localhost:9000/storage/";

const ENVIRONMENT = {
    API_BASE_URL: (configuredApiBaseUrl || "/api").replace(/\/+$/, ""),
    CDN_URL,
}

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

const API_ROUTES: Record<string, Record<string, Record<string, string>>> = {
    public: {
        reports: {
            search: "/public/reports/",
            profilePicture: "/public/reports/media/profiles",
            proofs: "/public/reports/media/proofs",
            createOrganization: "/public/reports/organizations",
            createScammer: "/public/reports/scammers",
        },
        scammers: {
            suggest: "/public/scammers/suggest",
            findById: "/public/scammers/{id}",
            calendar: "/public/scammers/{id}/calendar/{year}",
            contacts: "/public/scammers/{id}/contacts",
            reports: "/public/scammers/{id}/reports",
            map: "/public/scammers/{id}/map",
        },
        organizations: {
            suggest: "/public/organizations/suggest",
            findById: "/public/organizations/{id}",
            calendar: "/public/organizations/{id}/calendar/{year}",
            contacts: "/public/organizations/{id}/contacts",
            reports: "/public/organizations/{id}/reports",
            map: "/public/organizations/{id}/map",
        },
    },
} as const;

export { ENVIRONMENT, API_ROUTES, CDN_URL, resolveCdnUrl };
