import reportIcons from "@presentation/pages/report/components/icons";
import type {
  PartyType,
  ReportFormStepProps,
} from "@/presentation/pages/report-form/components/types";

const PARTY_TYPE_OPTIONS: {
  value: PartyType;
  title: string;
  description: string;
  imageSrc: string;
}[] = [
  {
    value: "individual",
    title: "Un individuo",
    description:
      "Persona particular, vendedor informal, perfil de red social o particular sin registro formal.",
    imageSrc: reportIcons.individual,
  },
  {
    value: "company",
    title: "Una empresa",
    description:
      "Negocio, tienda en línea, plataforma web, marca o entidad registrada.",
    imageSrc: reportIcons.company,
  },
];

function PartyTypeOption({
  value,
  title,
  description,
  imageSrc,
  selected,
  onSelect,
}: (typeof PARTY_TYPE_OPTIONS)[number] & {
  selected: boolean;
  onSelect: (value: PartyType) => void;
}) {
  return (
    <label
      className={`flex flex-1 cursor-pointer select-none flex-col items-center rounded-xl px-4 py-6 text-center transition-colors hover:bg-orange-50/60 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-orange-600 ${
        selected ? "bg-orange-50 ring-2 ring-orange-400" : ""
      }`}
    >
      <input
        type="radio"
        name="partyType"
        value={value}
        checked={selected}
        onChange={() => onSelect(value)}
        className="sr-only"
      />
      <img
        src={imageSrc}
        alt=""
        className="pointer-events-none h-28 w-28 object-contain sm:h-32 sm:w-32"
      />
      <span className="pointer-events-none mt-6 text-xl font-extrabold text-gray-900">
        {title}
      </span>
      <span className="pointer-events-none mt-3 max-w-xs text-sm leading-relaxed text-gray-600 sm:text-base">
        {description}
      </span>
    </label>
  );
}

function PartyTypeStep({ draft, updateDraft, goNext }: ReportFormStepProps) {
  function selectPartyType(partyType: PartyType) {
    updateDraft({ partyType });
    goNext();
  }

  return (
    <fieldset className="mt-10">
      <legend className="w-full text-center text-2xl font-extrabold text-gray-900 sm:text-3xl">
        ¿Quién te estafó?
      </legend>

      <div className="mt-12 flex flex-col md:flex-row md:items-stretch">
        <PartyTypeOption
          {...PARTY_TYPE_OPTIONS[0]}
          selected={draft.partyType === "individual"}
          onSelect={selectPartyType}
        />
        <div className="my-8 h-px bg-gray-200 md:hidden" aria-hidden="true" />
        <div
          className="mx-4 hidden w-px self-stretch bg-gray-200 md:block lg:mx-8"
          aria-hidden="true"
        />
        <PartyTypeOption
          {...PARTY_TYPE_OPTIONS[1]}
          selected={draft.partyType === "company"}
          onSelect={selectPartyType}
        />
      </div>
    </fieldset>
  );
}

export default PartyTypeStep;
