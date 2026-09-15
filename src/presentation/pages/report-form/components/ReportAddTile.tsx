function ReportAddTile({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-20 min-w-40 cursor-pointer items-center justify-center border border-gray-300 bg-white text-4xl font-light text-gray-900 transition-colors hover:border-orange-400 hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
    >
      <span aria-hidden="true">+</span>
    </button>
  );
}

export default ReportAddTile;
