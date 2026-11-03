export interface Contact {
  label: string;
  value: string;
}

export interface ReportProfile {
  id: string;
  name: string;
  type: string;
  reportDate: string;
  status: string;
  reports: number;
  location: string;
  categories: string[];
  description: string;
  contacts: Contact[];
}

import type { StoredProfilePicture } from "@/application/models/stored-profile-picture.model";

export type ProfilePictureUploadResult = StoredProfilePicture;

export type ReportHeroProps = {
  id: string;
  name: string;
  type: string;
  partyType: "scammer" | "organization";
  reportDate: Date;
  status: string;
  reports: number;
  categories: string[];
  profilePicture?: string | null;
  onProfilePictureChange?: (result: ProfilePictureUploadResult) => void;
};

const reportTabsBeforeAssociations = [
  "General",
  "Reportes",
  "Contactos",
  "Métodos de pago",
] as const;

const reportTabsAfterAssociations = ["Mapa", "Soporte"] as const;

export const associationTabByParty = {
  scammer: "Empresas",
  organization: "Estafadores",
} as const;

export type ReportTab =
  | (typeof reportTabsBeforeAssociations)[number]
  | (typeof associationTabByParty)[keyof typeof associationTabByParty]
  | (typeof reportTabsAfterAssociations)[number];

export function reportTabsFor(
  partyType: keyof typeof associationTabByParty,
): ReportTab[] {
  return [
    ...reportTabsBeforeAssociations,
    associationTabByParty[partyType],
    ...reportTabsAfterAssociations,
  ];
}
