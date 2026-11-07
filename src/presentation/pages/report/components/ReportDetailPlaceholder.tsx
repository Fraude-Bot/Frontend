function BackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="h-4 w-4 shrink-0"
    >
      <path
        d="M19 12H5M12 19l-7-7 7-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type ReportDetailPlaceholderProps = {
  onBack: () => void;
};

function ReportDetailPlaceholder({ onBack }: ReportDetailPlaceholderProps) {
  return (
    <section className="border border-gray-200 bg-white p-6 sm:p-8">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-sm font-extrabold text-gray-700 hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
      >
        <BackIcon />
        Volver al listado
      </button>
      <p className="py-24 text-center text-sm text-gray-600">
        This is the report content
      </p>
    </section>
  );
}

export default ReportDetailPlaceholder;
