import ContactSummaryEntity from "@/core/domain/contact/entities/contact-summary.entity";
import { formatContactDate } from "@presentation/pages/report/components/contact-date.util";
import {
  getContactHref,
  getPlatformLabel,
} from "@presentation/pages/report/components/contact-platform";
import { PlatformIcon } from "@presentation/pages/report/components/PlatformIcon";

function ExternalLinkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="h-4 w-4 shrink-0 text-gray-400"
    >
      <path
        d="M14 4h6v6M20 4 10 14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="h-4 w-4 shrink-0 text-gray-400"
    >
      <path
        d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07L10.7 5.23"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M14 11a5 5 0 0 0-7.07 0L4.81 13.12a5 5 0 0 0 7.07 7.07l1.42-1.42"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="h-4 w-4 shrink-0 text-gray-400"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M3 10h18M8 3v4M16 3v4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ContactCard({ contact }: { contact: ContactSummaryEntity }) {
  const href = getContactHref(contact.reference, contact.platform);
  const platformLabel = getPlatformLabel(contact.platform);
  const formattedDate = formatContactDate(contact.createdAt);

  return (
    <article>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Abrir ${platformLabel}`}
        className="block cursor-pointer rounded-md border border-gray-200 px-4 py-3 hover:bg-gray-50"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <PlatformIcon platform={contact.platform} />
            <h3 className="truncate text-sm font-bold text-gray-900">
              {platformLabel}
            </h3>
          </div>
          <span aria-hidden>
            <ExternalLinkIcon />
          </span>
        </div>

        <div className="mt-3 flex flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-1.5">
            <LinkIcon />
            <span className="truncate" title={contact.reference}>
              {contact.reference}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <CalendarIcon />
            <time dateTime={contact.createdAt}>{formattedDate}</time>
          </div>
        </div>
      </a>
    </article>
  );
}

export default ContactCard;
