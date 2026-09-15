---
name: frontend-modals
description: Implements confirmation and form dialogs on the shared Modal shell (native dialog, orange footer actions, optional SearchableSelect). Use when adding a modal, dialog, overlay, confirmation, combobox-in-dialog, or add-contact / add-payment style form in this frontend.
---

# Frontend Modals

Compose new dialogs from the shared shell. Do not invent a second overlay, install Select2 / react-select / Headless UI for this, or restyle `ImageLightbox` to look like a product modal.

Canonical files:

- `src/presentation/shared/components/Modal.tsx` — shell
- `src/presentation/shared/components/SearchableSelect.tsx` — searchable closed list
- `src/presentation/pages/report-form/components/DiscardChangesModal.tsx` — confirmation
- `src/presentation/pages/report-form/components/AddContactModal.tsx` — form
- `src/presentation/pages/report-form/components/AddPaymentModal.tsx` — form
- `DESIGN.md` — visual rules (Modal section)

## Shell API

```tsx
<Modal
  title="…"
  onClose={onClose}
  actions={[/* at least one */]}
  size="md" // or "lg"
  headerDivider={false}
  autoFocusAction={true}
>
  {children}
</Modal>
```

`onClose` runs on backdrop click and Escape. If a `role="combobox"` is expanded, Escape closes the list first.

Keep chrome in `Modal.tsx`. Page wrappers only pass `title`, `children`, `actions`, and the flags below.

## Which variant

| Need | Flags | Body | Actions |
| --- | --- | --- | --- |
| Confirm / warn | default `md`, no `headerDivider`, `autoFocusAction` (default) | Centered copy in `min-h-48 py-8` | Two buttons, right-aligned |
| Form (add/edit) | `size="lg"`, `headerDivider`, `autoFocusAction={false}` | Padded grid of labeled fields | **Cerrar** secondary + primary submit |
| Single acknowledge | default `md` | Centered copy | **One** action — footer centers it and always uses primary orange |

Never put a gray or red button in this footer. A lone button stays orange fill and centered even if the label is dismissive.

Typical two-button pairs: **Cerrar** / **Crear**, **Regresar** / **Continuar**. Primary is `variant="primary"`; outline is `"secondary"`. Disable the primary with `disabled` until the form is valid.

## Form fields inside the modal

Use rounded modal fields, not the square report-form page inputs:

```
h-11 w-full rounded-md border border-gray-300 px-3 text-gray-900
outline-none placeholder:text-gray-400
focus:border-orange-500 focus:ring-1 focus:ring-orange-500
```

Labels: `mb-2 block font-bold text-gray-900`. Two columns: `grid gap-x-8 gap-y-5 py-5 sm:grid-cols-2`; full-width rows `sm:col-span-2`.

Closed lists with search use `SearchableSelect`:

```tsx
<SearchableSelect
  id={platformId}
  value={platform}
  options={[{ value: "Facebook", label: "Facebook" }]}
  onChange={setPlatform}
  placeholder="Selecciona una plataforma"
  listLabel="Plataformas"
  noResultsText="No hay plataformas con ese nombre"
/>
```

Do not allow free-text values unless the design says so. Platform options for contacts come from `SOCIAL_FILTERS` in `contact-platform.ts`. Payment method types come from `PAYMENT_TYPE_OPTIONS` in `payment-method.util.ts`.

## Page wrapper

1. Add a page-level component (e.g. `AddPaymentModal.tsx`) that renders `Modal`.
2. Keep open/close state in the parent; unmount the modal when closed so field state resets.
3. Buttons are `type="button"` (the shell already does this). Do not nest a `<form>` inside the wizard `<form>`.
4. Put created items on the page (card + existing **+** tile). Do not leave success only inside the dialog.

Copy `AddContactModal` or `AddPaymentModal` for forms and `DiscardChangesModal` for confirms.

## Do not

- Fork panel/footer classes on a new `role="dialog"` / `fixed inset-0` overlay.
- Change `ImageLightbox` to use this shell (darker overlay, no title/footer).
- Auto-focus the primary footer button on form modals (`autoFocusAction={false}`).
- Add Vitest or Playwright coverage unless the user asks.

If you change Modal chrome (sizes, footer layout, button classes), update `DESIGN.md` in the same change.

## Checklist

- Uses `Modal`, not a one-off overlay.
- Title is Spanish, left, sentence- or title-cased like nearby copy.
- One action → centered primary. Two+ → `justify-end`, outline then fill.
- Form: `lg` + `headerDivider` + `autoFocusAction={false}` + valid-gated primary.
- Confirm: centered body copy, primary stays on the safe/default action when that matches existing leave-step behavior.
- Searchable closed lists use `SearchableSelect`.
- Escape does not dismiss the modal while the combobox is open.
- Parent unmounts the modal on close; draft/list updates on success.
