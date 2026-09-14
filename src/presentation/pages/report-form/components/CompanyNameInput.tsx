import PartyNameInput from "@/presentation/pages/report-form/components/PartyNameInput";

const EXAMPLE_COMPANIES = [
  { id: "example:billions-trade-club", name: "Billions Trade Club" },
  { id: "example:globoshop", name: "Globoshop" },
  { id: "example:ecohuertas", name: "Ecohuertas" },
];

type CompanyNameInputProps = {
  value: string;
  onChange: (value: string, organizationId: string | null) => void;
};

function CompanyNameInput({ value, onChange }: CompanyNameInputProps) {
  return (
    <PartyNameInput
      id="company-name"
      value={value}
      onChange={onChange}
      placeholder="Ej. (Billions Trade Club, Globoshop)"
      listLabel="Empresas reportadas"
      resultType="organization"
      examples={EXAMPLE_COMPANIES}
    />
  );
}

export default CompanyNameInput;
