import { useState, type FormEvent } from "react";
import ReportFormStepper from "@/presentation/pages/report-form/components/ReportFormStepper";
import {
  getReportFormStepCount,
  REPORT_FORM_PLANNED_STEPS,
  REPORT_FORM_STEPS,
} from "@/presentation/pages/report-form/components/report-form-steps";
import {
  EMPTY_REPORT_FORM_DRAFT,
  type ReportFormDraft,
  type ReportFormStep,
} from "@/presentation/pages/report-form/components/types";

type ReportFormWizardProps = {
  steps?: ReportFormStep[];
  plannedStepCount?: number;
};

function ReportFormWizard({
  steps = REPORT_FORM_STEPS,
  plannedStepCount = REPORT_FORM_PLANNED_STEPS,
}: ReportFormWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [draft, setDraft] = useState<ReportFormDraft>(EMPTY_REPORT_FORM_DRAFT);

  const StepComponent = steps[currentStepIndex].Component;
  const totalSteps = getReportFormStepCount(steps.length, plannedStepCount);

  function updateDraft(patch: Partial<ReportFormDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function goToStep(index: number) {
    if (index < 0 || index >= steps.length) {
      return;
    }

    setCurrentStepIndex(index);
  }

  function goNext() {
    goToStep(currentStepIndex + 1);
  }

  function goBack() {
    goToStep(currentStepIndex - 1);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <form
      className="mx-auto flex w-full max-w-4xl flex-1 flex-col"
      onSubmit={handleSubmit}
      noValidate
    >
      <ReportFormStepper
        currentStep={currentStepIndex + 1}
        totalSteps={totalSteps}
      />
      <StepComponent
        draft={draft}
        updateDraft={updateDraft}
        goNext={goNext}
        goBack={goBack}
      />
    </form>
  );
}

export default ReportFormWizard;
