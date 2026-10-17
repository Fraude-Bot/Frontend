import { Link } from "react-router-dom";
import { organizationPath, scammerPath } from "@/common/app-routes";
import PartyAssociationEntity from "@/core/domain/association/entities/party-association.entity";
import { formatContactDate } from "@presentation/pages/report/components/contact-date.util";

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="h-4 w-4 shrink-0 text-gray-400"
    >
      <path
        d="M5 12h14M13 6l6 6-6 6"
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
}: {
  association: PartyAssociationEntity;
  associationType: "scammer" | "organization";
}) {
  const isScammer = associationType === "scammer";
  const href = isScammer
    ? scammerPath(association.id)
    : organizationPath(association.id);
  const kindLabel = isScammer ? "Estafador" : "Empresa";
  const formattedDate = formatContactDate(association.createdAt);

  return (
    <article>
      <Link
        to={href}
        className="block cursor-pointer rounded-md border border-gray-200 px-4 py-3 hover:bg-gray-50"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
              {kindLabel}
            </p>
            <h3 className="mt-1 truncate text-sm font-extrabold text-gray-900">
              #{isScammer ? "SC" : "OR"}
              {association.id} - {association.name}
            </h3>
          </div>
          <span aria-hidden className="shrink-0">
            <ArrowIcon />
          </span>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          <time dateTime={association.createdAt}>{formattedDate}</time>
        </p>
      </Link>
    </article>
  );
}

export default AssociationCard;
