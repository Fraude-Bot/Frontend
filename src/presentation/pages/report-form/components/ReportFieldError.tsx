const FIELD_TEXT =
  "w-full border text-gray-900 outline-none placeholder:text-gray-400 focus:ring-1";

function borderClass(invalid: boolean) {
  return invalid
    ? "border-red-600 focus:border-red-600 focus:ring-red-600"
    : "border-gray-300 focus:border-orange-500 focus:ring-orange-500";
}

export function reportInputClass(invalid: boolean) {
  return `${FIELD_TEXT} h-11 px-3 ${borderClass(invalid)}`;
}

export function reportTextareaClass(invalid: boolean) {
  return `${FIELD_TEXT} resize-none px-3 py-2 ${borderClass(invalid)}`;
}

function ReportFieldError({
  id,
  message,
  centered = false,
}: {
  id: string;
  message?: string;
  centered?: boolean;
}) {
  if (!message) {
    return null;
  }

  return (
    <p
      id={id}
      role="alert"
      className={`mt-2 text-sm text-red-600 ${centered ? "text-center" : ""}`}
    >
      {message}
    </p>
  );
}

export default ReportFieldError;
