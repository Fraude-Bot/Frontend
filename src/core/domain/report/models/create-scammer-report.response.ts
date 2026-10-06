type CreateScammerReportResponse = {
  id: number;
  scammer_id: number;
  contact_ids: number[];
  payment_method_ids: number[];
  product_ids: number[];
  organization_ids: number[];
  report_proof_ids: number[];
};

export default CreateScammerReportResponse;
