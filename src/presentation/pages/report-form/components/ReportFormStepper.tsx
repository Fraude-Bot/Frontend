type ReportFormStepperProps = {
  currentStep: number;
  totalSteps: number;
};

function lineClass(reached: boolean) {
  return reached ? "bg-orange-400" : "bg-gray-300";
}

function ReportFormStepper({ currentStep, totalSteps }: ReportFormStepperProps) {
  return (
    <nav aria-label="Progreso del reporte" className="mx-auto w-full max-w-xl px-6">
      <ol className="flex items-center">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCurrent = stepNumber === currentStep;
          const isReached = stepNumber <= currentStep;
          const isLast = stepNumber === totalSteps;

          return (
            <li
              key={stepNumber}
              className="flex min-w-0 flex-1 items-center"
              aria-current={isCurrent ? "step" : undefined}
            >
              <span
                className={`h-0.5 min-w-4 flex-1 ${lineClass(isReached)}`}
                aria-hidden="true"
              />
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                  isReached ? "bg-orange-500" : "bg-gray-400"
                }`}
              >
                <span className="sr-only">
                  Paso {stepNumber}
                  {isCurrent ? ", actual" : ""}
                </span>
                <span aria-hidden="true">{stepNumber}</span>
              </span>
              {isLast ? (
                <span
                  className="h-0.5 min-w-4 flex-1 bg-gray-300"
                  aria-hidden="true"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default ReportFormStepper;
