type ProfileSeoProps = {
  id: string;
  name: string;
  type: "scammer" | "organization";
  reports: number;
  categories: string[];
  active: boolean;
  createdAt: Date;
  image?: string | null;
};

function ProfileSeo({
  id,
  name,
  type,
  reports,
  categories,
  active,
  createdAt,
  image,
}: ProfileSeoProps) {
  const kind = type === "scammer" ? "estafador reportado" : "empresa reportada";
  const path = type === "scammer" ? `/estafadores/${id}` : `/empresas/${id}`;
  const canonicalUrl = new URL(path, window.location.origin).toString();
  const description = `${name}: ${kind} con ${reports} ${
    reports === 1 ? "reporte comunitario" : "reportes comunitarios"
  } en FraudeBot.${
    categories.length > 0 ? ` Categorías: ${categories.join(", ")}.` : ""
  }`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${name} | FraudeBot`,
    description,
    url: canonicalUrl,
    dateCreated: createdAt.toISOString(),
    mainEntity: {
      "@type": type === "organization" ? "Organization" : "Person",
      name,
      ...(image ? { image } : {}),
      additionalProperty: {
        "@type": "PropertyValue",
        name: "Reportes comunitarios",
        value: reports,
      },
    },
  };

  return (
    <>
      <title>{`${name}: reportes de fraude | FraudeBot`}</title>
      <meta name="description" content={description} />
      <meta
        name="robots"
        content={active ? "index,follow,max-image-preview:large" : "noindex,follow"}
      />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:type" content="profile" />
      <meta property="og:title" content={`${name} | FraudeBot`} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content="summary_large_image" />
      <script type="application/ld+json">
        {JSON.stringify(structuredData).replace(/</g, "\\u003c")}
      </script>
    </>
  );
}

export default ProfileSeo;
