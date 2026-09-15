import {
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

type SearchableSelectOption = {
  value: string;
  label: string;
  iconSrc?: string;
};

type SearchableSelectProps = {
  id: string;
  value: string | null;
  options: SearchableSelectOption[];
  onChange: (value: string) => void;
  placeholder: string;
  noResultsText?: string;
  listLabel?: string;
};

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function measureListMaxHeight(anchor: HTMLElement): number {
  const panel = anchor.closest("[data-modal-panel]");
  const footer = panel?.querySelector("[data-modal-footer]");
  const limitBottom =
    footer?.getBoundingClientRect().top ??
    panel?.getBoundingClientRect().bottom ??
    anchor.getBoundingClientRect().bottom + 160;

  return Math.max(
    96,
    Math.floor(limitBottom - anchor.getBoundingClientRect().bottom - 4),
  );
}

function SearchableSelect({
  id,
  value,
  options,
  onChange,
  placeholder,
  noResultsText = "Sin resultados",
  listLabel = "Opciones",
}: SearchableSelectProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [explicitIndex, setExplicitIndex] = useState<number | null>(null);
  const [listMaxHeight, setListMaxHeight] = useState(160);
  const selected = options.find((option) => option.value === value) ?? null;
  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const selectedLabel = selected?.label.toLocaleLowerCase() ?? "";
    if (!normalizedQuery || normalizedQuery === selectedLabel) {
      return options;
    }

    return options.filter((option) =>
      option.label.toLocaleLowerCase().includes(normalizedQuery),
    );
  }, [options, query, selected]);
  const selectedIndex = filteredOptions.findIndex(
    (option) => option.value === value,
  );
  const highlightedIndex = Math.min(
    explicitIndex ?? (selectedIndex >= 0 ? selectedIndex : 0),
    Math.max(0, filteredOptions.length - 1),
  );

  useLayoutEffect(() => {
    if (!isOpen || !rootRef.current) {
      return;
    }

    function updateMaxHeight() {
      if (rootRef.current) {
        setListMaxHeight(measureListMaxHeight(rootRef.current));
      }
    }

    updateMaxHeight();
    window.addEventListener("resize", updateMaxHeight);

    return () => window.removeEventListener("resize", updateMaxHeight);
  }, [isOpen]);

  function openList() {
    setQuery(selected?.label ?? "");
    setExplicitIndex(null);
    setIsOpen(true);
  }

  function closeList() {
    setIsOpen(false);
    setQuery("");
    setExplicitIndex(null);
  }

  function chooseOption(option: SearchableSelectOption) {
    onChange(option.value);
    closeList();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      event.stopPropagation();
      closeList();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!isOpen) {
        openList();
        return;
      }

      setExplicitIndex(
        filteredOptions.length === 0
          ? 0
          : (highlightedIndex + 1) % filteredOptions.length,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) {
        openList();
        return;
      }

      setExplicitIndex(
        filteredOptions.length === 0
          ? 0
          : (highlightedIndex - 1 + filteredOptions.length) %
            filteredOptions.length,
      );
      return;
    }

    if (event.key === "Enter" && isOpen) {
      event.preventDefault();
      const option = filteredOptions[highlightedIndex];
      if (option) {
        chooseOption(option);
      }
    }
  }

  const inputValue = isOpen ? query : (selected?.label ?? "");
  const highlightedOption = filteredOptions[highlightedIndex];
  const showSelectedIcon = Boolean(selected?.iconSrc) && !isOpen;
  const hasOptionIcons = options.some((option) => option.iconSrc);

  return (
    <div ref={rootRef} className={`relative ${isOpen ? "z-20" : ""}`}>
      <div className="relative">
        <span
          className={`pointer-events-none absolute inset-y-0 left-3 flex items-center ${
            showSelectedIcon ? "gap-3" : ""
          }`}
        >
          <ChevronDownIcon
            className={`h-4 w-4 shrink-0 text-orange-500 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
          {showSelectedIcon ? (
            <img
              src={selected?.iconSrc}
              alt=""
              className="h-5 w-5 shrink-0 object-contain"
            />
          ) : null}
        </span>
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={isOpen}
          aria-activedescendant={
            isOpen && highlightedOption
              ? `${listId}-option-${highlightedOption.value}`
              : undefined
          }
          value={inputValue}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(event) => {
            setQuery(event.currentTarget.value);
            setExplicitIndex(null);
            setIsOpen(true);
          }}
          onFocus={() => {
            openList();
            window.requestAnimationFrame(() => inputRef.current?.select());
          }}
          onClick={() => {
            if (!isOpen) {
              openList();
            }
          }}
          onBlur={() => window.setTimeout(closeList, 100)}
          onKeyDown={handleKeyDown}
          className={`h-11 w-full rounded-md border border-gray-300 py-2 pr-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 ${
            showSelectedIcon ? "pl-[4.75rem]" : "pl-9"
          }`}
        />
      </div>

      {isOpen ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={listLabel}
          style={{ maxHeight: listMaxHeight }}
          className="absolute z-30 mt-1 w-full overflow-y-auto overscroll-contain rounded-md border border-gray-300 bg-white shadow-lg"
        >
          {filteredOptions.length === 0 ? (
            <li className="px-3 py-2 text-sm text-gray-500" role="presentation">
              {noResultsText}
            </li>
          ) : (
            filteredOptions.map((option, index) => {
              const isHighlighted = index === highlightedIndex;
              const isSelected = option.value === value;

              return (
                <li key={option.value} role="presentation">
                  <button
                    type="button"
                    id={`${listId}-option-${option.value}`}
                    role="option"
                    aria-selected={isSelected}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setExplicitIndex(index)}
                    onClick={() => chooseOption(option)}
                    className={`flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left text-sm text-gray-800 ${
                      isHighlighted ? "bg-orange-50" : "bg-white"
                    }`}
                  >
                    {option.iconSrc ? (
                      <img
                        src={option.iconSrc}
                        alt=""
                        className="h-5 w-5 shrink-0 object-contain"
                      />
                    ) : hasOptionIcons ? (
                      <span className="h-5 w-5 shrink-0" aria-hidden />
                    ) : null}
                    {option.label}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}

export default SearchableSelect;
export type { SearchableSelectOption, SearchableSelectProps };
