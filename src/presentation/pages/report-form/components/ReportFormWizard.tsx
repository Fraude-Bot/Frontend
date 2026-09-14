import { useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DiscardChangesModal from "@/presentation/pages/report-form/components/DiscardChangesModal";
import ReportFormStepper from "@/presentation/pages/report-form/components/ReportFormStepper";
import {
  getReportFormStepCount,
  getReportFormStepIndex,
  getReportFormStepSearchParams,
  REPORT_FORM_PLANNED_STEPS,
  REPORT_FORM_STEP_PARAM,
  REPORT_FORM_STEPS,
} from "@/presentation/pages/report-form/components/report-form-steps";
import {
  EMPTY_REPORT_FORM_DRAFT,
  isReportFormDraftDirty,
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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [draft, setDraft] = useState<ReportFormDraft>(EMPTY_REPORT_FORM_DRAFT);
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);

  const currentStepIndex = getReportFormStepIndex(
    searchParams.get(REPORT_FORM_STEP_PARAM),
    steps.length,
  );
  const StepComponent = steps[currentStepIndex].Component;
  const totalSteps = getReportFormStepCount(steps.length, plannedStepCount);
  const wizardHistoryDepthRef = useRef(0);
  const lastStepIndexRef = useRef(currentStepIndex);
  const draftRef = useRef(draft);
  const restoringDirtyBackRef = useRef(false);
  const allowDirtyReturnRef = useRef(false);

  draftRef.current = draft;

  useLayoutEffect(() => {
    const rawStep = searchParams.get(REPORT_FORM_STEP_PARAM);
    const expectedParams = getReportFormStepSearchParams(
      currentStepIndex,
      searchParams,
    );
    const expectedStep = expectedParams.get(REPORT_FORM_STEP_PARAM);

    if (rawStep !== expectedStep) {
      setSearchParams(expectedParams, { replace: true });
    }
  }, [currentStepIndex, searchParams, setSearchParams]);

  useLayoutEffect(() => {
    const previousStepIndex = lastStepIndexRef.current;
    const returningToFirstStep =
      currentStepIndex === 0 && previousStepIndex > 0;

    if (
      returningToFirstStep &&
      isReportFormDraftDirty(draftRef.current) &&
      !allowDirtyReturnRef.current &&
      !restoringDirtyBackRef.current
    ) {
      restoringDirtyBackRef.current = true;
      setIsDiscardConfirmOpen(true);
      setSearchParams((current) =>
        getReportFormStepSearchParams(previousStepIndex, current),
      );
      return;
    }

    allowDirtyReturnRef.current = false;

    if (
      restoringDirtyBackRef.current &&
      currentStepIndex === previousStepIndex
    ) {
      restoringDirtyBackRef.current = false;
      return;
    }

    if (returningToFirstStep) {
      setDraft(EMPTY_REPORT_FORM_DRAFT);
    }

    const stepDelta = currentStepIndex - previousStepIndex;

    if (stepDelta > 0) {
      wizardHistoryDepthRef.current += 1;
    } else if (stepDelta < 0) {
      wizardHistoryDepthRef.current = Math.max(
        0,
        wizardHistoryDepthRef.current + stepDelta,
      );
    }

    lastStepIndexRef.current = currentStepIndex;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [currentStepIndex, setSearchParams]);

  function updateDraft(patch: Partial<ReportFormDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function navigateToStep(index: number) {
    if (index === currentStepIndex) {
      return;
    }

    if (index < 0) {
      navigate(-1);
      return;
    }

    if (index >= steps.length) {
      return;
    }

    if (index < currentStepIndex) {
      const stepsBack = currentStepIndex - index;

      if (wizardHistoryDepthRef.current >= stepsBack) {
        navigate(-stepsBack);
        return;
      }

      setSearchParams(getReportFormStepSearchParams(index, searchParams), {
        replace: true,
      });
      return;
    }

    setSearchParams(getReportFormStepSearchParams(index, searchParams));
  }

  function goToStep(index: number) {
    if (index === currentStepIndex) {
      return;
    }

    const returningToFirstStep = index === 0 && currentStepIndex > 0;

    if (returningToFirstStep && isReportFormDraftDirty(draft)) {
      setIsDiscardConfirmOpen(true);
      return;
    }

    navigateToStep(index);
  }

  function cancelDiscard() {
    setIsDiscardConfirmOpen(false);
  }

  function confirmDiscard() {
    allowDirtyReturnRef.current = true;
    setIsDiscardConfirmOpen(false);
    setDraft(EMPTY_REPORT_FORM_DRAFT);
    navigateToStep(0);
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
    <>
      <form
        className="mx-auto flex w-full max-w-4xl flex-1 flex-col"
        onSubmit={handleSubmit}
        noValidate
      >
        <ReportFormStepper
          currentStep={currentStepIndex + 1}
          totalSteps={totalSteps}
          implementedSteps={steps.length}
          onSelectStep={goToStep}
        />
        <StepComponent
          draft={draft}
          updateDraft={updateDraft}
          goNext={goNext}
          goBack={goBack}
        />
      </form>
      {isDiscardConfirmOpen ? (
        <DiscardChangesModal
          onCancel={cancelDiscard}
          onConfirm={confirmDiscard}
        />
      ) : null}
    </>
  );
}

export default ReportFormWizard;
