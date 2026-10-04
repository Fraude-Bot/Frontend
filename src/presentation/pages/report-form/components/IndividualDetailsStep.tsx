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
import ReportFieldError, {
  reportInputClass,
  reportTextareaClass,
} from "@/presentation/pages/report-form/components/ReportFieldError";
import ReportPaymentsSection from "@/presentation/pages/report-form/components/ReportPaymentsSection";
import { useReportDetailsAttempt } from "@/presentation/pages/report-form/components/report-details-validation";
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

function IndividualDetailsStep({
  draft,
  updateDraft,
  goNext,
  goBack,
}: ReportFormStepProps) {
  const productTagsRef = useRef<ReactTagsAPI>(null);
  const { errors, continueIfValid } = useReportDetailsAttempt(draft);

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
        <div data-report-field="photo">
          <PartyPhotoInput
            id="individual-photo"
            file={draft.avatarFile}
            onChange={(avatarFile, avatarPath) =>
              updateDraft({ avatarFile, avatarPath })
            }
            addLabel="Agregar foto del individuo"
            changeLabel="Cambiar foto del individuo"
            invalid={Boolean(errors.photo)}
            describedBy={errors.photo ? "individual-photo-error" : undefined}
          />
          <ReportFieldError
            id="individual-photo-error"
            message={errors.photo}
            centered
          />
        </div>

        <div data-report-field="name">
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
            invalid={Boolean(errors.name)}
            describedBy={errors.name ? "individual-name-error" : undefined}
          />
          <ReportFieldError id="individual-name-error" message={errors.name} />
        </div>

        <div data-report-field="products">
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
              isInvalid={Boolean(errors.products)}
              ariaErrorMessage={
                errors.products ? "individual-products-error" : undefined
              }
              ariaDescribedBy={
                errors.products ? "individual-products-error" : undefined
              }
              classNames={PRODUCT_TAG_CLASS_NAMES}
            />
          </div>
          <ReportFieldError
            id="individual-products-error"
            message={errors.products}
          />
        </div>

        <div data-report-field="title">
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
            aria-invalid={Boolean(errors.title) || undefined}
            aria-describedby={
              errors.title ? "individual-report-title-error" : undefined
            }
            required
            className={reportInputClass(Boolean(errors.title))}
          />
          <ReportFieldError
            id="individual-report-title-error"
            message={errors.title}
          />
        </div>

        <div data-report-field="description">
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
            aria-invalid={Boolean(errors.description) || undefined}
            aria-describedby={
              errors.description
                ? "individual-report-description-error"
                : undefined
            }
            required
            className={reportTextareaClass(Boolean(errors.description))}
          />
          <ReportFieldError
            id="individual-report-description-error"
            message={errors.description}
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
          error={errors.contacts}
          errorId="individual-contacts-error"
        />

        <ReportPaymentsSection
          description="Los números de cuenta/bancos/wallets que esté utilizando el individuo para captar fondos"
          payments={draft.payments}
          onChange={(payments) => updateDraft({ payments })}
          error={errors.payments}
          errorId="individual-payments-error"
        />
      </div>

      <ReportDetailsActions
        onContinue={() => continueIfValid(goNext)}
        goBack={goBack}
      />
    </section>
  );
}

export default IndividualDetailsStep;
