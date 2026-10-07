const openApiUrl = process.env.OPENAPI_URL;

if (!openApiUrl) {
  throw new Error("Set OPENAPI_URL to the public OpenAPI document URL.");
}

const requiredOperations = new Map([
  ["GET", "/public/reports/"],
  ["POST", "/public/reports/media/profiles"],
  ["POST", "/public/reports/media/proofs"],
  ["POST", "/public/reports/organizations"],
  ["POST", "/public/reports/scammers"],
  ["GET", "/public/scammers/suggest"],
  ["GET", "/public/scammers/{id}"],
  ["GET", "/public/scammers/{id}/calendar/{year}"],
  ["GET", "/public/scammers/{id}/contacts"],
  ["GET", "/public/scammers/{id}/reports"],
  ["GET", "/public/scammers/{id}/map"],
  ["GET", "/public/organizations/suggest"],
  ["GET", "/public/organizations/{id}"],
  ["GET", "/public/organizations/{id}/calendar/{year}"],
  ["GET", "/public/organizations/{id}/contacts"],
  ["GET", "/public/organizations/{id}/reports"],
  ["GET", "/public/organizations/{id}/map"],
].map(([method, path]) => [`${method} ${path}`, { method, path }]));

const response = await fetch(openApiUrl, {
  headers: { accept: "application/json" },
});

if (!response.ok) {
  throw new Error(`OpenAPI request failed with HTTP ${response.status}.`);
}

const document = await response.json();
const missing = [];

for (const { method, path } of requiredOperations.values()) {
  if (!document.paths?.[path]?.[method.toLowerCase()]) {
    missing.push(`${method} ${path}`);
  }
}

if (missing.length > 0) {
  throw new Error(
    `Frontend operations missing from OpenAPI:\n${missing
      .map((operation) => `- ${operation}`)
      .join("\n")}`,
  );
}

console.log(`Validated ${requiredOperations.size} frontend API operations.`);
