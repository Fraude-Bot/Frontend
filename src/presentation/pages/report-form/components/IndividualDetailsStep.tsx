import { useRef, type KeyboardEvent } from "react";
import {
  ReactTags,
  type ClassNames,
  type ReactTagsAPI,
  type Tag,
} from "react-tag-autocomplete";
import PartyNameInput from "@/presentation/pages/report-form/components/PartyNameInput";
import type { ReportFormStepProps } from "@/presentation/pages/report-form/components/types";
import "@/presentation/pages/report-form/components/report-tags.css";

const PRODUCT_TAG_CLASS_NAMES: ClassNames = {
  root: "report-product-tags",
  rootIsActive: "is-active",
  rootIsDisabled: "is-disabled",
  rootIsInvalid: "is-invalid",
  label: "report-product-tags__label",
  tagList: "report-product-tags__list",
  tagListItem: "report-product-tags__list-item",
  tag: "report-product-tags__tag",
  tagName: "report-product-tags__tag-name",
  comboBox: "report-product-tags__combobox",
  input: "report-product-tags__input",
  listBox: "report-product-tags__listbox",
  option: "report-product-tags__option",
  optionIsActive: "is-active",
  highlight: "report-product-tags__highlight",
};

const EXAMPLE_INDIVIDUALS = [
  { id: "example:carlos-ponzi", name: "Carlos Ponzi" },
  { id: "example:ruja-ignatova", name: "Ruja Ignatova" },
  { id: "example:bernard-madoff", name: "Bernard Madoff" },
];

const FIELD_CLASS =
  "h-11 w-full border border-gray-300 px-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500";

function AddTile({ label }: { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-20 min-w-40 cursor-pointer items-center justify-center border border-gray-300 bg-white text-4xl font-light text-gray-900 transition-colors hover:border-orange-400 hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
    >
      <span aria-hidden="true">+</span>
    </button>
  );
}

function IndividualDetailsStep({
  draft,
  updateDraft,
  goNext,
  goBack,
}: ReportFormStepProps) {
  const productTagsRef = useRef<ReactTagsAPI>(null);

  if (draft.partyType !== "individual") {
    return null;
  }

  const selectedProducts: Tag[] = draft.products.map((product) => ({
    label: product,
    value: product,
  }));

  function addProduct(tag: Tag) {
    const product = tag.label.trim();
    if (
      !product ||
      draft.products.some(
        (current) => current.toLocaleLowerCase() === product.toLocaleLowerCase(),
      )
    ) {
      return;
    }

    updateDraft({ products: [...draft.products, product] });
  }

  function deleteProduct(index: number) {
    updateDraft({
      products: draft.products.filter((_, productIndex) => productIndex !== index),
    });
  }

  function addProductOnEnter(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" || !(event.target instanceof HTMLInputElement)) {
      return;
    }

    const product = event.target.value.trim();
    if (!product) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    productTagsRef.current?.select({ label: product, value: product });
  }

  function addEvidence(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    updateDraft({
      evidenceFiles: [...draft.evidenceFiles, ...Array.from(files)],
    });
  }

  function removeEvidence(index: number) {
    updateDraft({
      evidenceFiles: draft.evidenceFiles.filter(
        (_, fileIndex) => fileIndex !== index,
      ),
    });
  }

  return (
    <section className="mx-auto mt-10 w-full max-w-2xl pb-10">
      <h2 className="sr-only">Información del individuo y del reporte</h2>

      <div className="space-y-5">
        <div>
          <label
            htmlFor="individual-name"
            className="mb-2 block font-extrabold text-gray-900"
          >
            Nombre del individuo
          </label>
          <PartyNameInput
            id="individual-name"
            value={draft.individualName}
            onChange={(individualName, scammerId) =>
              updateDraft({ individualName, scammerId })
            }
            placeholder="E.g. (Carlos Ponzi, Ruja Ignatova, Bernard Madoff)"
            listLabel="Individuos reportados"
            resultType="scammer"
            examples={EXAMPLE_INDIVIDUALS}
          />
        </div>

        <div>
          <p className="mb-2 font-extrabold text-gray-900">
            Productos que ofrece
          </p>
          <div onKeyDownCapture={addProductOnEnter}>
            <ReactTags
              ref={productTagsRef}
              id="individual-products"
              selected={selectedProducts}
              suggestions={[]}
              onAdd={addProduct}
              onDelete={deleteProduct}
              onValidate={(value) => value.trim().length > 0}
              allowNew
              newOptionPosition="first"
              newOptionText="Agregar %value%"
              noOptionsText="Escribe un producto"
              collapseOnSelect
              delimiterKeys={["Enter"]}
              labelText="Productos que ofrece el individuo"
              placeholderText="E.g. (Prestamos, Venta de Automóvil, Inversiones, Electrónicos...)"
              deleteButtonText="Eliminar %value%"
              ariaAddedText="Producto %value% agregado"
              ariaDeletedText="Producto %value% eliminado"
              classNames={PRODUCT_TAG_CLASS_NAMES}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="individual-report-title"
            className="mb-2 block font-extrabold text-gray-900"
          >
            Título de tu reporte
          </label>
          <input
            id="individual-report-title"
            type="text"
            value={draft.reportTitle}
            onChange={(event) =>
              updateDraft({ reportTitle: event.currentTarget.value })
            }
            placeholder="E.g. (Me estafó $2,000 MXN, me estafó este tipo...)"
            className={FIELD_CLASS}
          />
        </div>

        <div>
          <label
            htmlFor="individual-report-description"
            className="mb-2 block font-extrabold text-gray-900"
          >
            Descripción de tu reporte
          </label>
          <textarea
            id="individual-report-description"
            value={draft.reportDescription}
            onChange={(event) =>
              updateDraft({ reportDescription: event.currentTarget.value })
            }
            placeholder="Descripción de tu caso"
            rows={7}
            className="w-full resize-y border border-gray-300 px-3 py-2 text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div>
          <p className="mb-2 font-extrabold text-gray-900">
            Capturas de pantalla de pruebas{" "}
            <span className="uppercase">(OPCIONAL)</span>
          </p>
          <div className="flex flex-wrap gap-3">
            {draft.evidenceFiles.map((file, index) => (
              <button
                key={`${file.name}-${file.lastModified}-${index}`}
                type="button"
                onClick={() => removeEvidence(index)}
                aria-label={`Eliminar ${file.name}`}
                title="Haz clic para eliminar"
                className="flex h-20 max-w-48 items-center gap-2 border border-orange-200 bg-orange-50 px-3 text-left text-sm text-gray-800 hover:border-orange-400 focus-visible:outline-2 focus-visible:outline-orange-600"
              >
                <span className="min-w-0 truncate">{file.name}</span>
                <span aria-hidden="true" className="text-lg">
                  ×
                </span>
                <span className="sr-only">Eliminar {file.name}</span>
              </button>
            ))}
            <label className="flex h-16 w-16 cursor-pointer items-center justify-center border-2 border-dashed border-gray-500 text-4xl font-light text-gray-900 hover:border-orange-500 hover:bg-orange-50 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-orange-600">
              <span aria-hidden="true">+</span>
              <span className="sr-only">Agregar capturas de pantalla</span>
              <input
                type="file"
                accept="image/*"
                multiple
                aria-label="Agregar capturas de pantalla"
                className="sr-only"
                onChange={(event) => {
                  addEvidence(event.currentTarget.files);
                  event.currentTarget.value = "";
                }}
              />
            </label>
          </div>
        </div>

        <div className="pt-1">
          <h3 className="font-extrabold text-gray-900">Contactos</h3>
          <p className="mt-1 text-sm text-gray-600">
            Los perfiles/números que haya utilizado el individuo para contactarte
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <AddTile label="Agregar contacto" />
          </div>
        </div>

        <div className="pt-1">
          <h3 className="font-extrabold text-gray-900">Métodos de pagos</h3>
          <p className="mt-1 text-sm text-gray-600">
            Los números de cuenta/bancos/wallets que esté utilizando el individuo
            para captar fondos
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <AddTile label="Agregar método de pago" />
          </div>
        </div>
      </div>

      <div className="mt-12 flex flex-col-reverse justify-center gap-4 sm:flex-row sm:gap-20">
        <button
          type="button"
          onClick={goBack}
          className="min-w-40 cursor-pointer rounded-md border border-orange-500 bg-white px-8 py-2 font-bold text-gray-900 hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
        >
          Regresar
        </button>
        <button
          type="button"
          onClick={goNext}
          className="min-w-40 cursor-pointer rounded-md bg-orange-600 px-8 py-2 font-bold text-white hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
        >
          Continuar
        </button>
      </div>
    </section>
  );
}

export default IndividualDetailsStep;
