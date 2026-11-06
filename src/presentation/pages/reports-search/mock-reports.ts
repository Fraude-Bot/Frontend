export interface TextReportSearchHit {
  id: string;
  displayId: string;
  title: string;
  snippet: string;
}

/** Mock data until the reports text search API exists */
export const MOCK_TEXT_REPORT_HITS: TextReportSearchHit[] = [
  {
    id: "1354",
    displayId: "1354",
    title: "¡Me estafó $2,000 MXN y estoy enojada!",
    snippet:
      "Estoy super enojada, me ofreció un lote de ropa por $2,000 MXN...",
  },
  {
    id: "32",
    displayId: "0032",
    title: "Me pidió anticipo para una renta y se desapareció",
    snippet:
      "Este tipo me pidió un anticipo para apartar una casa que publicó hace d...",
  },
];
