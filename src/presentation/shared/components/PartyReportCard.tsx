import { Link } from "react-router-dom";
import { reportDetailPath } from "@/common/app-routes";
import PartyReportEntity from "@/core/domain/report/entities/party-report.entity";

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

function PartyReportCard({ report }: { report: PartyReportEntity }) {
  return (
    <article>
      <Link
        to={reportDetailPath(report.id)}
        className="block cursor-pointer rounded-md border border-gray-200 px-4 py-3 hover:bg-gray-50"
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 truncate text-sm font-extrabold text-gray-900">
            #{report.id} - {report.title}
          </h3>
          <span aria-hidden className="shrink-0">
            <ExternalLinkIcon />
          </span>
        </div>

        <p
          className="mt-2 truncate text-sm text-gray-600"
          title={report.description}
        >
          {report.description}
        </p>
      </Link>
    </article>
  );
}

export default PartyReportCard;
