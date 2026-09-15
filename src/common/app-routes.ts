const APP_ROUTES = {
  home: "/",
  contact: "/contacto",
  search: "/busqueda",
  report: "/reportar",
  scammer: "/estafadores/:id",
  organization: "/empresas/:id",
  reportScammer: "/reportar/estafadores/:id",
  reportOrganization: "/reportar/empresas/:id",
  reportDetail: "/reportes/:id",
} as const;

function scammerPath(id: string) {
  return APP_ROUTES.scammer.replace(":id", id);
}

function organizationPath(id: string) {
  return APP_ROUTES.organization.replace(":id", id);
}

function reportScammerPath(id: string) {
  return APP_ROUTES.reportScammer.replace(":id", id);
}

function reportOrganizationPath(id: string) {
  return APP_ROUTES.reportOrganization.replace(":id", id);
}

function reportPartyPath(id: string, type: "scammer" | "organization") {
  return type === "scammer" ? reportScammerPath(id) : reportOrganizationPath(id);
}

function reportDetailPath(id: string) {
  return APP_ROUTES.reportDetail.replace(":id", id);
}

export {
  APP_ROUTES,
  scammerPath,
  organizationPath,
  reportScammerPath,
  reportOrganizationPath,
  reportPartyPath,
  reportDetailPath,
};
