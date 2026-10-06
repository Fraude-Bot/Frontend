type CreateOrganizationReportResponse = {
  id: number;
  organization_id: number;
  contact_ids: number[];
  payment_method_ids: number[];
  product_ids: number[];
  scammer_ids: number[];
  report_proof_ids: number[];
};

export default CreateOrganizationReportResponse;
