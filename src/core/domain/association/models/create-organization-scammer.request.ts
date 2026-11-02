export type CreateOrganizationScammerReference = {
  reference: string;
};

export type CreateOrganizationScammerRequest = {
  name: string;
  profile_picture_path?: string | null;
  contacts?: CreateOrganizationScammerReference[];
  payment_methods?: CreateOrganizationScammerReference[];
};
