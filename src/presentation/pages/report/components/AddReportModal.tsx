import { useId, useRef, useState, type KeyboardEvent } from "react";
import {
  ReactTags,
  type ClassNames,
  type ReactTagsAPI,
  type Tag,
} from "react-tag-autocomplete";
import EvidenceScreenshotsInput from "@/presentation/shared/components/EvidenceScreenshotsInput";
import Modal from "@/presentation/shared/components/Modal";
import "@/presentation/shared/styles/report-tags.css";

const FIELD_CLASS =
  "h-11 w-full rounded-md border border-gray-300 px-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500";

const TEXTAREA_CLASS =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500";

const LABEL_CLASS = "mb-2 block font-bold text-gray-900";

const PRODUCT_TAG_CLASS_NAMES: ClassNames = {
  root: "report-product-tags rounded-md",
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

const TITLE_MAX_LENGTH = 50;
const PRODUCT_MAX_LENGTH = 75;

export type AddReportDraft = {
  title: string;
  description: string;
  products: string[];
  proofs: string[];
  email: string;
};

type AddReportModalProps = {
  onClose: () => void;
  onCreate: (draft: AddReportDraft) => void | Promise<void>;
  isSubmitting?: boolean;
};

function isContactEmail(value: string) {
  return value.length <= 255 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function AddReportModal({
  onClose,
  onCreate,
  isSubmitting = false,
}: AddReportModalProps) {
  const formId = useId().replace(/:/g, "");
  const titleId = `${formId}-title`;
  const descriptionId = `${formId}-description`;
  const emailId = `${formId}-email`;
  const proofsId = `${formId}-proofs`;
  const productTagsRef = useRef<ReactTagsAPI>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [products, setProducts] = useState<string[]>([]);
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [proofs, setProofs] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [isUploadingProofs, setIsUploadingProofs] = useState(false);
  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();
  const trimmedEmail = email.trim();
  const canCreate =
    trimmedTitle.length > 0 &&
    trimmedTitle.length <= TITLE_MAX_LENGTH &&
    trimmedDescription.length > 0 &&
    products.length > 0 &&
    isContactEmail(trimmedEmail) &&
    !isUploadingProofs &&
    !isSubmitting;
  const selectedProducts: Tag[] = products.map((product) => ({
    label: product,
    value: product,
  }));

  function addProduct(tag: Tag) {
    const product = tag.label.trim();
    if (
      !product ||
      product.length > PRODUCT_MAX_LENGTH ||
      products.some(
        (current) => current.toLocaleLowerCase() === product.toLocaleLowerCase(),
      )
    ) {
      return;
    }

    setProducts((current) => [...current, product]);
  }

  function deleteProduct(index: number) {
    setProducts((current) =>
      current.filter((_, productIndex) => productIndex !== index),
    );
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

  function handleCreate() {
    if (!canCreate) {
      return;
    }

    void onCreate({
      title: trimmedTitle,
      description: trimmedDescription,
      products,
      proofs,
      email: trimmedEmail,
    });
  }

  return (
    <Modal
      title="Agregar Reporte"
      size="lg"
      headerDivider
      autoFocusAction={false}
      onClose={onClose}
      actions={[
        { label: "Cerrar", variant: "secondary", onClick: onClose },
        {
          label: "Crear",
          variant: "primary",
          disabled: !canCreate,
          onClick: handleCreate,
        },
      ]}
    >
      <div className="grid gap-x-8 gap-y-5 py-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor={titleId} className={LABEL_CLASS}>
            Título
          </label>
          <input
            id={titleId}
            type="text"
            value={title}
            maxLength={TITLE_MAX_LENGTH}
            autoComplete="off"
            placeholder="Ej. (Me estafó $2,000 MXN, me estafó este tipo...)"
            onChange={(event) => setTitle(event.currentTarget.value)}
            className={FIELD_CLASS}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={descriptionId} className={LABEL_CLASS}>
            Descripción
          </label>
          <textarea
            id={descriptionId}
            value={description}
            rows={5}
            placeholder="Descripción de tu caso"
            onChange={(event) => setDescription(event.currentTarget.value)}
            className={TEXTAREA_CLASS}
          />
        </div>

        <div className="sm:col-span-2" onKeyDownCapture={addProductOnEnter}>
          <p className={LABEL_CLASS}>Productos</p>
          <ReactTags
            ref={productTagsRef}
            id={`${titleId}-products`}
            selected={selectedProducts}
            suggestions={[]}
            onAdd={addProduct}
            onDelete={deleteProduct}
            onValidate={(value) =>
              value.trim().length > 0 && value.trim().length <= PRODUCT_MAX_LENGTH
            }
            allowNew
            newOptionPosition="first"
            newOptionText="Agregar %value%"
            noOptionsText="Escribe un producto"
            collapseOnSelect
            delimiterKeys={["Enter"]}
            labelText="Productos"
            placeholderText="Ej. (Prestamos, Venta de Automóvil, Inversiones, Electrónicos...)"
            deleteButtonText="Eliminar %value%"
            ariaAddedText="Producto %value% agregado"
            ariaDeletedText="Producto %value% eliminado"
            classNames={PRODUCT_TAG_CLASS_NAMES}
          />
        </div>

        <div className="sm:col-span-2">
          <p className={LABEL_CLASS}>
            Capturas de pantalla de pruebas{" "}
            <span className="uppercase">(opcional)</span>
          </p>
          <EvidenceScreenshotsInput
            id={proofsId}
            files={proofFiles}
            paths={proofs}
            onUploadingChange={setIsUploadingProofs}
            onChange={(files, paths) => {
              setProofFiles(files);
              setProofs(paths);
            }}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={emailId} className={LABEL_CLASS}>
            Correo electrónico
          </label>
          <input
            id={emailId}
            type="email"
            value={email}
            autoComplete="email"
            placeholder="tucorreo@ejemplo.com"
            onChange={(event) => setEmail(event.currentTarget.value)}
            className={FIELD_CLASS}
          />
        </div>
      </div>
    </Modal>
  );
}

export default AddReportModal;
