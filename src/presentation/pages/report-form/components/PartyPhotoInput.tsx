import { useEffect, useState } from "react";

type PartyPhotoInputProps = {
  id: string;
  file: File | null;
  onChange: (file: File | null) => void;
  addLabel: string;
  changeLabel: string;
};

function PartyPhotoInput({
  id,
  file,
  onChange,
  addLabel,
  changeLabel,
}: PartyPhotoInputProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const label = file ? changeLabel : addLabel;

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    setPreviewUrl(nextUrl);

    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [file]);

  return (
    <div className="flex justify-center">
      <div className="relative">
        <label
          htmlFor={id}
          className="flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gray-400 text-5xl font-light text-gray-900 transition-colors hover:border-orange-500 hover:bg-orange-50 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-orange-600"
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span aria-hidden="true">+</span>
          )}
          <span className="sr-only">{label}</span>
          <input
            id={id}
            type="file"
            accept="image/*"
            aria-label={label}
            className="sr-only"
            onChange={(event) => {
              const nextFile = event.currentTarget.files?.[0] ?? null;
              onChange(nextFile);
              event.currentTarget.value = "";
            }}
          />
        </label>
        {file ? (
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Eliminar foto"
            className="absolute -right-1 -top-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white text-lg leading-none text-gray-600 hover:border-orange-400 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
          >
            ×
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default PartyPhotoInput;
