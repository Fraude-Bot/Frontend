import PartyNameInput from "@/presentation/pages/report-form/components/PartyNameInput";

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
      examples={[]}
    />
  );
}

export default CompanyNameInput;
