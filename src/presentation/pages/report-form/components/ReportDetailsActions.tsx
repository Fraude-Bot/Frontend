type ReportDetailsActionsProps = {
  onContinue: () => void;
  goBack: () => void;
};

function ReportDetailsActions({ onContinue, goBack }: ReportDetailsActionsProps) {
  return (
    <div className="mt-12 flex flex-col-reverse justify-center gap-4 sm:flex-row sm:gap-20">
      <button
        type="button"
        onClick={goBack}
        className="min-w-40 cursor-pointer rounded-md border border-orange-500 bg-white px-8 py-2 font-bold text-gray-900 hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
      >
        Regresar
      </button>
      <button
        type="button"
        onClick={onContinue}
        className="min-w-40 cursor-pointer rounded-md bg-orange-600 px-8 py-2 font-bold text-white hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
      >
        Continuar
      </button>
    </div>
  );
}

export default ReportDetailsActions;
