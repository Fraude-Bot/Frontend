function ReportAddTile({
  label,
  onClick,
  invalid = false,
  describedBy,
}: {
  label: string;
  onClick?: () => void;
  invalid?: boolean;
  describedBy?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-describedby={describedBy}
      data-invalid={invalid || undefined}
      onClick={onClick}
      className={`flex h-20 min-w-40 cursor-pointer items-center justify-center border bg-white text-4xl font-light text-gray-900 transition-colors hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 ${
        invalid
          ? "border-red-600 hover:border-red-600"
          : "border-gray-300 hover:border-orange-400"
      }`}
    >
      <span aria-hidden="true">+</span>
    </button>
  );
}

export default ReportAddTile;
