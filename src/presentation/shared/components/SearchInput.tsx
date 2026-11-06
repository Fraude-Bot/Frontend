interface SearchInputProps {
  id: string;
  value: string;
  onInput: (event: React.InputEvent<HTMLInputElement>) => void;
  accent?: "orange" | "red";
  placeholder?: string;
}

function SearchInput({
  id,
  value,
  onInput,
  accent = "orange",
  placeholder = "Número de cuenta, tarjeta, teléfono o URL",
}: SearchInputProps) {
  const focusColor =
    accent === "red"
      ? "focus-within:outline-red-600"
      : "focus-within:outline-orange-600";
  const buttonColor =
    accent === "red"
      ? "bg-red-600 hover:bg-red-700"
      : "bg-orange-700 hover:bg-orange-800";

  return (
    <div
      className={`flex w-full flex-col overflow-hidden rounded-md border border-gray-400 bg-white focus-within:outline-2 focus-within:outline-offset-2 ${focusColor} sm:flex-row`}
    >
      <input
        id={id}
        type="text"
        value={value}
        onInput={onInput}
        autoComplete="off"
        placeholder={placeholder}
        className="min-w-0 grow px-4 py-4 text-lg text-gray-900 outline-none placeholder:text-gray-500 font-[Nunito]"
      />
      <button
        type="submit"
        className={`border-t border-gray-300 px-8 py-4 text-lg font-bold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white font-[Nunito] sm:border-l sm:border-t-0 ${buttonColor}`}
      >
        Buscar
      </button>
    </div>
  );
}

export default SearchInput;
