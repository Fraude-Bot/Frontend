import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const feedUrl = process.env.SEO_PROFILE_FEED_URL;
const siteUrl = process.env.VITE_SITE_URL?.replace(/\/+$/, "");
const apiBaseUrl = process.env.VITE_API_BASE_URL?.replace(/\/+$/, "");

if (!feedUrl) {
  console.log("SEO_PROFILE_FEED_URL is not set; skipping profile prerendering.");
  process.exit(0);
}
if (!siteUrl || !apiBaseUrl || !/^https?:\/\//.test(apiBaseUrl)) {
  throw new Error(
    "Profile prerendering requires absolute VITE_SITE_URL and VITE_API_BASE_URL values.",
  );
}

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const escapeXml = escapeHtml;
const template = await readFile("dist/index.html", "utf8");
const feedResponse = await fetch(feedUrl);
if (!feedResponse.ok) {
  throw new Error(`Profile feed failed with HTTP ${feedResponse.status}.`);
}
const feedDocument = await feedResponse.json();
const profiles = Array.isArray(feedDocument)
  ? feedDocument
  : (feedDocument.data ?? []);
const sitemapEntries = [];

for (const profile of profiles) {
  const type =
    profile.type === "organization" ? "organization" : "scammer";
  const segment = type === "organization" ? "empresas" : "estafadores";
  const apiSegment = type === "organization" ? "organizations" : "scammers";
  const id = encodeURIComponent(String(profile.id));
  const response = await fetch(`${apiBaseUrl}/public/${apiSegment}/${id}`);
  if (!response.ok) {
    console.warn(`Skipping ${type} ${id}: HTTP ${response.status}`);
    continue;
  }

  const data = await response.json();
  const canonical = `${siteUrl}/${segment}/${id}`;
  const reports = Number(data.reports) || 0;
  const products = Array.isArray(data.products) ? data.products : [];
  const description = `${data.name}: ${
    type === "organization" ? "empresa reportada" : "estafador reportado"
  } con ${reports} reportes comunitarios en FraudeBot.`;
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${data.name} | FraudeBot`,
    description,
    url: canonical,
    mainEntity: {
      "@type": type === "organization" ? "Organization" : "Person",
      name: data.name,
      ...(data.profile_picture ? { image: data.profile_picture } : {}),
    },
  }).replaceAll("<", "\\u003c");
  const head = `
    <title>${escapeHtml(data.name)}: reportes de fraude | FraudeBot</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="${data.status ? "index,follow" : "noindex,follow"}" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
    <meta property="og:title" content="${escapeHtml(data.name)} | FraudeBot" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <script type="application/ld+json">${jsonLd}</script>`;
  const body = `<main><article><h1>${escapeHtml(data.name)}</h1><p>${escapeHtml(
    description,
  )}</p>${
    products.length
      ? `<p>Categorías: ${products.map(escapeHtml).join(", ")}</p>`
      : ""
  }</article></main>`;
  const html = template
    .replace("</head>", `${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);
  const output = join("dist", segment, id, "index.html");
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, html);
  sitemapEntries.push({
    url: canonical,
    lastModified: profile.updatedAt ?? data.updated_at ?? data.created_at,
  });
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries
  .map(
    ({ url, lastModified }) => `  <url>
    <loc>${escapeXml(url)}</loc>${
      lastModified
        ? `\n    <lastmod>${escapeXml(new Date(lastModified).toISOString())}</lastmod>`
        : ""
    }
  </url>`,
  )
  .join("\n")}
</urlset>
`;
await writeFile("dist/sitemap.xml", sitemap);
await writeFile(
  "dist/robots.txt",
  `User-agent: *\nAllow: /\nDisallow: /reportar\nDisallow: /api/\nSitemap: ${siteUrl}/sitemap.xml\n`,
);
console.log(`Prerendered ${sitemapEntries.length} public profiles.`);
