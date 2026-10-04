import { useEffect, useId, useRef, useState } from "react";
import { isCanceledError } from "@/common/utils/http-error.util";
import { reportInputClass } from "@/presentation/pages/report-form/components/ReportFieldError";
import { useDependencies } from "@/presentation/providers/useDependencies";

type PartySuggestion = {
  id: string;
  name: string;
};

type PartyNameInputProps = {
  id: string;
  value: string;
  onChange: (value: string, matchedId: string | null) => void;
  placeholder: string;
  listLabel: string;
  resultType: "organization" | "scammer";
  examples: PartySuggestion[];
  invalid?: boolean;
  describedBy?: string;
};

function filterExamples(examples: PartySuggestion[], query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) {
    return examples;
  }

  return examples.filter((item) =>
    item.name.toLocaleLowerCase().includes(normalizedQuery),
  );
}

function PartyNameInput({
  id,
  value,
  onChange,
  placeholder,
  listLabel,
  resultType,
  examples,
  invalid = false,
  describedBy,
}: PartyNameInputProps) {
  const listId = useId();
  const requestId = useRef(0);
  const [suggestions, setSuggestions] = useState<PartySuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { suggestOrganizationNamesUseCase, suggestScammerNamesUseCase } =
    useDependencies();
  const suggestNamesUseCase =
    resultType === "organization"
      ? suggestOrganizationNamesUseCase
      : suggestScammerNamesUseCase;
  const query = value.trim();
  const exampleSuggestions = filterExamples(examples, query);
  const showDropdown =
    isFocused &&
    (exampleSuggestions.length > 0 ||
      (query.length >= 2 && (isLoading || suggestions.length > 0)));

  useEffect(() => {
    if (query.length < 2) {
      requestId.current += 1;
      setSuggestions((current) => (current.length === 0 ? current : []));
      return;
    }

    const currentRequestId = ++requestId.current;
    const timeoutId = window.setTimeout(() => {
      setIsLoading(true);

      const suggestionRequest = suggestNamesUseCase.execute(query).then((names) =>
        names.map((name) => ({
          id: `suggested:${name}`,
          name,
        })),
      );

      void suggestionRequest
        .then((matches) => {
          if (currentRequestId !== requestId.current) {
            return;
          }

          setSuggestions(matches);
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
      suggestNamesUseCase.cancel();
    };
  }, [query, suggestNamesUseCase]);

  function chooseSuggestion(item: PartySuggestion) {
    const matchedId =
      item.id.startsWith("example:") || item.id.startsWith("suggested:")
        ? null
        : item.id;
    onChange(item.name, matchedId);
    setSuggestions([]);
    setIsFocused(false);
  }

  const seenNames = new Set(
    exampleSuggestions.map((item) => item.name.trim().toLocaleLowerCase()),
  );
  const uniqueApiSuggestions = suggestions.filter((item) => {
    const key = item.name.trim().toLocaleLowerCase();
    if (seenNames.has(key)) {
      return false;
    }
    seenNames.add(key);
    return true;
  });
  const dropdownItems = [...exampleSuggestions, ...uniqueApiSuggestions];

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) => onChange(event.currentTarget.value, null)}
        onFocus={() => setIsFocused(true)}
        onClick={() => setIsFocused(true)}
        onBlur={() => window.setTimeout(() => setIsFocused(false), 100)}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={showDropdown}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        required
        className={reportInputClass(invalid)}
      />

      {showDropdown ? (
        <div
          id={listId}
          role="listbox"
          aria-label={listLabel}
          className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto border border-gray-300 bg-white shadow-lg"
        >
          {dropdownItems.map((item) => (
            <button
              key={item.id}
              type="button"
              role="option"
              aria-selected={false}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => chooseSuggestion(item)}
              className="block w-full px-3 py-2 text-left text-sm text-gray-800 hover:bg-orange-50 focus:bg-orange-50 focus:outline-none"
            >
              {item.name}
            </button>
          ))}
          {isLoading ? (
            <p className="px-3 py-2 text-sm text-gray-500" role="status">
              Buscando…
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default PartyNameInput;
export type { PartySuggestion };
