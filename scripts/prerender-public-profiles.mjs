import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

class Html {
  static escape(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }
}

class PrerenderConfig {
  constructor({ feedUrl, siteUrl, apiBaseUrl, outputDir = "dist" }) {
    this.feedUrl = feedUrl;
    this.siteUrl = siteUrl;
    this.apiBaseUrl = apiBaseUrl;
    this.outputDir = outputDir;
  }

  static fromEnv(env = process.env) {
    const feedUrl = env.SEO_PROFILE_FEED_URL;
    if (!feedUrl) return null;

    const siteUrl = env.VITE_SITE_URL?.replace(/\/+$/, "");
    const apiBaseUrl = env.VITE_API_BASE_URL?.replace(/\/+$/, "");
    if (!siteUrl || !apiBaseUrl || !/^https?:\/\//.test(apiBaseUrl)) {
      throw new Error(
        "Profile prerendering requires absolute VITE_SITE_URL and VITE_API_BASE_URL values.",
      );
    }

    return new PrerenderConfig({ feedUrl, siteUrl, apiBaseUrl });
  }
}

class ProfileKind {
  static from(type) {
    return type === "organization" ? new OrganizationKind() : new ScammerKind();
  }
}

class ScammerKind extends ProfileKind {
  type = "scammer";
  pathSegment = "estafadores";
  apiSegment = "scammers";
  reportedAs = "estafador reportado";
  schemaType = "Person";
}

class OrganizationKind extends ProfileKind {
  type = "organization";
  pathSegment = "empresas";
  apiSegment = "organizations";
  reportedAs = "empresa reportada";
  schemaType = "Organization";
}

class PublicProfilePage {
  constructor({ kind, id, profile, siteUrl }) {
    this.kind = kind;
    this.id = id;
    this.profile = profile;
    this.canonicalUrl = `${siteUrl}/${kind.pathSegment}/${id}`;
    this.reports = Number(profile.reports) || 0;
    this.products = Array.isArray(profile.products) ? profile.products : [];
  }

  get name() {
    return this.profile.name;
  }

  get description() {
    return `${this.name}: ${this.kind.reportedAs} con ${this.reports} reportes comunitarios en FraudeBot.`;
  }

  get robots() {
    return this.profile.status ? "index,follow" : "noindex,follow";
  }

  get jsonLd() {
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      name: `${this.name} | FraudeBot`,
      description: this.description,
      url: this.canonicalUrl,
      mainEntity: {
        "@type": this.kind.schemaType,
        name: this.name,
        ...(this.profile.profile_picture
          ? { image: this.profile.profile_picture }
          : {}),
      },
    }).replaceAll("<", "\\u003c");
  }

  get outputPath() {
    return join(this.kind.pathSegment, this.id, "index.html");
  }

  head() {
    const name = Html.escape(this.name);
    const description = Html.escape(this.description);
    const canonicalUrl = Html.escape(this.canonicalUrl);

    return `
    <title>${name}: reportes de fraude | FraudeBot</title>
    <meta name="description" content="${description}" />
    <meta name="robots" content="${this.robots}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:title" content="${name} | FraudeBot" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <script type="application/ld+json">${this.jsonLd}</script>`;
  }

  body() {
    const categories = this.products.length
      ? `<p>Categorías: ${this.products.map((product) => Html.escape(product)).join(", ")}</p>`
      : "";

    return `<main><article><h1>${Html.escape(this.name)}</h1><p>${Html.escape(this.description)}</p>${categories}</article></main>`;
  }

  render(template) {
    return template
      .replace("</head>", `${this.head()}\n  </head>`)
      .replace('<div id="root"></div>', `<div id="root">${this.body()}</div>`);
  }
}

class SitemapEntry {
  constructor(url, lastModified) {
    this.url = url;
    this.lastModified = lastModified;
  }

  toXml() {
    const lastmod = this.lastModified
      ? `\n    <lastmod>${Html.escape(new Date(this.lastModified).toISOString())}</lastmod>`
      : "";

    return `  <url>
    <loc>${Html.escape(this.url)}</loc>${lastmod}
  </url>`;
  }
}

class Sitemap {
  constructor(entries) {
    this.entries = entries;
  }

  toString() {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${this.entries.map((entry) => entry.toXml()).join("\n")}
</urlset>
`;
  }
}

class RobotsTxt {
  constructor(siteUrl) {
    this.siteUrl = siteUrl;
  }

  toString() {
    return `User-agent: *\nAllow: /\nDisallow: /reportar\nDisallow: /api/\nSitemap: ${this.siteUrl}/sitemap.xml\n`;
  }
}

class PublicProfileApi {
  constructor(apiBaseUrl) {
    this.apiBaseUrl = apiBaseUrl;
  }

  async list(feedUrl) {
    const response = await fetch(feedUrl);
    if (!response.ok) {
      throw new Error(`Profile feed failed with HTTP ${response.status}.`);
    }

    const document = await response.json();
    return Array.isArray(document) ? document : (document.data ?? []);
  }

  async find(kind, id) {
    const response = await fetch(
      `${this.apiBaseUrl}/public/${kind.apiSegment}/${id}`,
    );
    if (!response.ok) {
      console.warn(`Skipping ${kind.type} ${id}: HTTP ${response.status}`);
      return null;
    }

    return response.json();
  }
}

class DistDirectory {
  constructor(root) {
    this.root = root;
  }

  async readTemplate() {
    return readFile(join(this.root, "index.html"), "utf8");
  }

  async write(relativePath, contents) {
    const output = join(this.root, relativePath);
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, contents);
  }
}

class ProfilePrerender {
  constructor(config) {
    this.config = config;
    this.api = new PublicProfileApi(config.apiBaseUrl);
    this.dist = new DistDirectory(config.outputDir);
  }

  async run() {
    const template = await this.dist.readTemplate();
    const summaries = await this.api.list(this.config.feedUrl);
    const sitemapEntries = [];

    for (const summary of summaries) {
      const entry = await this.#renderProfile(summary, template);
      if (entry) sitemapEntries.push(entry);
    }

    await this.dist.write("sitemap.xml", new Sitemap(sitemapEntries).toString());
    await this.dist.write(
      "robots.txt",
      new RobotsTxt(this.config.siteUrl).toString(),
    );
    console.log(`Prerendered ${sitemapEntries.length} public profiles.`);
  }

  async #renderProfile(summary, template) {
    const kind = ProfileKind.from(summary.type);
    const id = encodeURIComponent(String(summary.id));
    const profile = await this.api.find(kind, id);
    if (!profile) return null;

    const page = new PublicProfilePage({
      kind,
      id,
      profile,
      siteUrl: this.config.siteUrl,
    });
    await this.dist.write(page.outputPath, page.render(template));

    return new SitemapEntry(
      page.canonicalUrl,
      summary.updatedAt ?? profile.updated_at ?? profile.created_at,
    );
  }
}

const config = PrerenderConfig.fromEnv();
if (!config) {
  console.log("SEO_PROFILE_FEED_URL is not set; skipping profile prerendering.");
  process.exit(0);
}

await new ProfilePrerender(config).run();
