import SearchInput from "@/presentation/shared/components/SearchInput";

interface ReportTextSearchFormProps {
  query: string;
  onInputChange: (event: React.InputEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

function ReportTextSearchForm({
  query,
  onInputChange,
  onSubmit,
}: ReportTextSearchFormProps) {
  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="mx-auto mb-10 flex w-full max-w-3xl flex-col px-4"
    >
      <label htmlFor="reports-text-search" className="sr-only">
        Buscar reportes por palabras clave
      </label>
      <SearchInput
        id="reports-text-search"
        value={query}
        onInput={(event) => onInputChange?.(event)}
        accent="red"
        placeholder="E.g. (me estafaron, perdi mi inversión...)"
      />
    </form>
  );
}

export default ReportTextSearchForm;
