type FindScammerSummaryByIdResponse = {
  id: number | string;
  name: string;
  country: string;
  reports: number;
  profile_picture: string | null;
  products?: string[] | null;
  status: boolean;
  created_at: string;
};

export default FindScammerSummaryByIdResponse;
