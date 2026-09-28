const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

const ENVIRONMENT = {
    API_BASE_URL: (configuredApiBaseUrl || "/api").replace(/\/+$/, ""),
}

const API_ROUTES: Record<string, Record<string, Record<string, string>>> = {
    public: {
        reports: {
            search: "/public/reports/",
            profilePicture: "/public/reports/media/profiles",
            proofs: "/public/reports/media/proofs",
        },
        scammers: {
            findById: "/public/scammers/{id}",
            calendar: "/public/scammers/{id}/calendar/{year}",
            contacts: "/public/scammers/{id}/contacts",
            reports: "/public/scammers/{id}/reports",
            map: "/public/scammers/{id}/map",
        },
        organizations: {
            findById: "/public/organizations/{id}",
            calendar: "/public/organizations/{id}/calendar/{year}",
            contacts: "/public/organizations/{id}/contacts",
            reports: "/public/organizations/{id}/reports",
            map: "/public/organizations/{id}/map",
        },
    },
} as const;

export { ENVIRONMENT, API_ROUTES };
