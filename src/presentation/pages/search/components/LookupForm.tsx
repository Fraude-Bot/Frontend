import { LookupFormProps } from "@/presentation/pages/search/components/types";
import SearchInput from "@/presentation/shared/components/SearchInput";

function LookupForm({ onSubmit, onInputChange, query }: LookupFormProps) {
  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="mx-auto mb-8 flex w-full max-w-3xl flex-col px-4"
    >
      <label htmlFor="report-search" className="sr-only">
        Buscar por número de cuenta, tarjeta, teléfono o URL
      </label>
      <SearchInput
        id="report-search"
        value={query}
        onInput={(event) => onInputChange?.(event)}
        accent="red"
      />
    </form>
  );
}

export default LookupForm;
