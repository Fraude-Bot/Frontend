import { useEffect, useId, useRef, useState } from "react";
import { isCanceledError } from "@/common/utils/http-error.util";
import { useDependencies } from "@/presentation/providers/useDependencies";

type CompanySuggestion = {
  id: string;
  name: string;
};

type CompanyNameInputProps = {
  value: string;
  onChange: (value: string, organizationId: string | null) => void;
};

function CompanyNameInput({ value, onChange }: CompanyNameInputProps) {
  const listId = useId();
  const requestId = useRef(0);
  const [suggestions, setSuggestions] = useState<CompanySuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { searchReportUseCase } = useDependencies();
  const query = value.trim();
  const showDropdown =
    isFocused && query.length >= 2 && (isLoading || suggestions.length > 0);

  useEffect(() => {
    if (query.length < 2) {
      requestId.current += 1;
      return;
    }

    const currentRequestId = ++requestId.current;
    const timeoutId = window.setTimeout(() => {
      setIsLoading(true);

      void searchReportUseCase
        .execute(query, 1)
        .then((result) => {
          if (currentRequestId !== requestId.current) {
            return;
          }

          const seen = new Set<string>();
          const companies = result.data
            .filter((report) => report.type === "organization")
            .filter((report) => {
              const key = report.name.trim().toLocaleLowerCase();
              if (seen.has(key)) {
                return false;
              }
              seen.add(key);
              return true;
            })
            .map((report) => ({ id: report.id, name: report.name }));

          setSuggestions(companies);
          setIsLoading(false);
        })
        .catch((error: unknown) => {
          if (
            currentRequestId !== requestId.current ||
            isCanceledError(error)
          ) {
            return;
          }

          setSuggestions([]);
          setIsLoading(false);
        });
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
      searchReportUseCase.cancel();
    };
  }, [query, searchReportUseCase]);

  function chooseCompany(company: CompanySuggestion) {
    onChange(company.name, company.id);
    setSuggestions([]);
  }

  return (
    <div className="relative">
      <input
        id="company-name"
        type="text"
        value={value}
        onChange={(event) => onChange(event.currentTarget.value, null)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => window.setTimeout(() => setIsFocused(false), 100)}
        placeholder="Ej. (Billions Trade Club, Globoshop)"
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={showDropdown}
        className="h-11 w-full border border-gray-300 px-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
      />

      {showDropdown ? (
        <div
          id={listId}
          role="listbox"
          aria-label="Empresas reportadas"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto border border-gray-300 bg-white shadow-lg"
        >
          {isLoading ? (
            <p className="px-3 py-2 text-sm text-gray-500" role="status">
              Buscando empresas…
            </p>
          ) : (
            suggestions.map((company) => (
              <button
                key={company.id}
                type="button"
                role="option"
                aria-selected={false}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => chooseCompany(company)}
                className="block w-full px-3 py-2 text-left text-sm text-gray-800 hover:bg-orange-50 focus:bg-orange-50 focus:outline-none"
              >
                {company.name}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

export default CompanyNameInput;
