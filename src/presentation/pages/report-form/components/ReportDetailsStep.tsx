import CompanyDetailsStep from "@/presentation/pages/report-form/components/CompanyDetailsStep";
import type { ReportFormStepProps } from "@/presentation/pages/report-form/components/types";

function ReportDetailsStep(props: ReportFormStepProps) {
  if (props.draft.partyType === "company") {
    return <CompanyDetailsStep {...props} />;
  }

  return null;
}

export default ReportDetailsStep;
