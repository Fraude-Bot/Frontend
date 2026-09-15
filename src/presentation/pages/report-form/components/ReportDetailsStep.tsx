import CompanyDetailsStep from "@/presentation/pages/report-form/components/CompanyDetailsStep";
import IndividualDetailsStep from "@/presentation/pages/report-form/components/IndividualDetailsStep";
import type { ReportFormStepProps } from "@/presentation/pages/report-form/components/types";

function ReportDetailsStep(props: ReportFormStepProps) {
  if (props.draft.partyType === "company") {
    return <CompanyDetailsStep {...props} />;
  }

  if (props.draft.partyType === "individual") {
    return <IndividualDetailsStep {...props} />;
  }

  return null;
}

export default ReportDetailsStep;
