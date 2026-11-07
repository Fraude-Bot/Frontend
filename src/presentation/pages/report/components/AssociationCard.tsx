import { Link } from "react-router-dom";
import { organizationPath, scammerPath } from "@/common/app-routes";
import PartyAssociationEntity from "@/core/domain/association/entities/party-association.entity";
import { formatContactDate } from "@presentation/pages/report/components/contact-date.util";

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

function AssociationCard({
  association,
  associationType,
  kindLabel: kindLabelOverride,
}: {
  association: PartyAssociationEntity;
  associationType: "scammer" | "organization";
  kindLabel?: string;
}) {
  const isScammer = associationType === "scammer";
  const href = isScammer
    ? scammerPath(association.id)
    : organizationPath(association.id);
  const kindLabel =
    kindLabelOverride ?? (isScammer ? "Estafador" : "Empresa");
  const formattedDate = formatContactDate(association.createdAt);

  return (
    <article>
      <Link
        to={href}
        className="block cursor-pointer rounded-md border border-gray-200 px-4 py-3 hover:bg-gray-50"
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
            {kindLabel}
          </p>
          <span aria-hidden className="shrink-0">
            <ExternalLinkIcon />
          </span>
        </div>
        <div className="mt-3 flex flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="min-w-0 truncate text-sm font-extrabold text-gray-900">
            #{isScammer ? "SC" : "OR"}
            {association.id} - {association.name}
          </h3>
          <div className="flex shrink-0 items-center gap-1.5">
            <CalendarIcon />
            <time dateTime={association.createdAt}>{formattedDate}</time>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default AssociationCard;
