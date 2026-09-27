import { useState } from "react";

type ReportDetailsActionsProps = {
  canContinue: boolean;
  goNext: () => void;
  goBack: () => void;
};

const ALERT_MESSAGE =
  "Agrega al menos un contacto o un método de pago para continuar.";

function ReportDetailsActions({
  canContinue,
  goNext,
  goBack,
}: ReportDetailsActionsProps) {
  const [showAlert, setShowAlert] = useState(false);
  const alertVisible = showAlert && !canContinue;

  function handleNext() {
    if (!canContinue) {
      setShowAlert(true);
      return;
    }

    goNext();
  }

  return (
    <div className="mt-12">
      {alertVisible ? (
        <p
          role="alert"
          className="mb-4 rounded-md border border-orange-300 bg-orange-50 px-4 py-3 text-center text-sm font-semibold text-orange-800"
        >
          {ALERT_MESSAGE}
        </p>
      ) : null}
      <div className="flex flex-col-reverse justify-center gap-4 sm:flex-row sm:gap-20">
        <button
          type="button"
          onClick={goBack}
          className="min-w-40 cursor-pointer rounded-md border border-orange-500 bg-white px-8 py-2 font-bold text-gray-900 hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
        >
          Regresar
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="min-w-40 cursor-pointer rounded-md bg-orange-600 px-8 py-2 font-bold text-white hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

export default ReportDetailsActions;
