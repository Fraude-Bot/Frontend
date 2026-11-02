export type CreateScammerOrganizationReference = {
  reference: string;
};

export type CreateScammerOrganizationRequest = {
  name: string;
  profile_picture_path?: string | null;
  contacts?: CreateScammerOrganizationReference[];
  payment_methods?: CreateScammerOrganizationReference[];
};
