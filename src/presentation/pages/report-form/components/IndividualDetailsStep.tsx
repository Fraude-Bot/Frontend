import { useRef, type KeyboardEvent } from "react";
import {
  ReactTags,
  type ClassNames,
  type ReactTagsAPI,
  type Tag,
} from "react-tag-autocomplete";
import PartyNameInput from "@/presentation/pages/report-form/components/PartyNameInput";
import ReportDetailsActions from "@/presentation/pages/report-form/components/ReportDetailsActions";
import EvidenceScreenshotsInput from "@/presentation/pages/report-form/components/EvidenceScreenshotsInput";
import PartyPhotoInput from "@/presentation/pages/report-form/components/PartyPhotoInput";
import ReportContactsSection from "@/presentation/pages/report-form/components/ReportContactsSection";
import ReportPaymentsSection from "@/presentation/pages/report-form/components/ReportPaymentsSection";
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

const FIELD_CLASS =
  "h-11 w-full border border-gray-300 px-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500";

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

  return (
    <section className="mx-auto mt-10 w-full max-w-2xl pb-10">
      <h2 className="sr-only">Información del individuo y del reporte</h2>

      <div className="space-y-5">
        <PartyPhotoInput
          id="individual-photo"
          file={draft.avatarFile}
          onChange={(avatarFile, avatarPath) =>
            updateDraft({ avatarFile, avatarPath })
          }
          addLabel="Agregar foto del individuo"
          changeLabel="Cambiar foto del individuo"
        />

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
            placeholder="Ej. (Carlos Ponzi, Ruja Ignatova, Bernard Madoff)"
            listLabel="Individuos reportados"
            resultType="scammer"
            examples={[]}
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
              placeholderText="Ej. (Prestamos, Venta de Automóvil, Inversiones, Electrónicos...)"
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
            placeholder="Ej. (Me estafó $2,000 MXN, me estafó este tipo...)"
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
            className="w-full resize-none border border-gray-300 px-3 py-2 text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div>
          <p className="mb-2 font-extrabold text-gray-900">
            Capturas de pantalla de pruebas{" "}
            <span className="uppercase">(OPCIONAL)</span>
          </p>
          <EvidenceScreenshotsInput
            id="individual-evidence"
            files={draft.evidenceFiles}
            paths={draft.evidencePaths}
            onChange={(evidenceFiles, evidencePaths) =>
              updateDraft({ evidenceFiles, evidencePaths })
            }
          />
        </div>

        <ReportContactsSection
          description="Los perfiles/números que haya utilizado el individuo para contactarte"
          contacts={draft.contacts}
          onChange={(contacts) => updateDraft({ contacts })}
        />

        <ReportPaymentsSection
          description="Los números de cuenta/bancos/wallets que esté utilizando el individuo para captar fondos"
          payments={draft.payments}
          onChange={(payments) => updateDraft({ payments })}
        />
      </div>

      <ReportDetailsActions
        canContinue={draft.contacts.length > 0 || draft.payments.length > 0}
        goNext={goNext}
        goBack={goBack}
      />
    </section>
  );
}

export default IndividualDetailsStep;
