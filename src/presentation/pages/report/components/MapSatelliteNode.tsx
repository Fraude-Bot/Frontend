import { type ReactNode, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  getContactHref,
  getPlatformLabel,
} from "@presentation/pages/report/components/contact-platform";
import { PlatformIcon } from "@presentation/pages/report/components/PlatformIcon";
import type { MapSatelliteNode } from "@presentation/pages/report/components/map-graph";
import {
  getPaymentHref,
  getPaymentLabel,
  isExternalPaymentHref,
} from "@presentation/pages/report/components/payment-method.util";

const mapNodeCardClassName =
  "block w-52 rounded-md border border-gray-200 bg-white px-3 py-2.5 shadow-sm";

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

function openExternalLink(event: MouseEvent<HTMLAnchorElement>, href: string) {
  event.stopPropagation();
  event.preventDefault();
  window.open(href, "_blank", "noopener,noreferrer");
}

function SatelliteCardContent({
  title,
  detail,
  icon,
  isLink,
}: {
  title: string;
  detail: string;
  icon?: ReactNode;
  isLink: boolean;
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          {icon}
          <p className="truncate text-[10px] font-extrabold uppercase tracking-[0.14em] text-gray-400">
            {title}
          </p>
        </div>
        {isLink && (
          <span aria-hidden>
            <ExternalLinkIcon />
          </span>
        )}
      </div>
      <p className="mt-1 truncate text-sm font-extrabold text-gray-900" title={detail}>
        {detail}
      </p>
      <p className="mt-0.5 truncate text-xs font-medium text-gray-500 invisible" aria-hidden>
        &nbsp;
      </p>
    </>
  );
}

function MapSatelliteNode({ data }: NodeProps<MapSatelliteNode>) {
  const isContact = data.kind === "contact";
  const title = isContact
    ? getPlatformLabel(data.platform || data.label)
    : getPaymentLabel(data.label, data.paymentType);
  const href = isContact
    ? getContactHref(data.detail, data.platform || data.label)
    : getPaymentHref(data.detail, data.paymentType);
  const isLink = href !== "#";
  const isExternalLink = isLink && (isContact || isExternalPaymentHref(href));
  const ariaLabel = isContact
    ? `Abrir ${title}`
    : isExternalLink
      ? `Abrir ${title}: ${data.detail}`
      : `Buscar ${title}: ${data.detail}`;

  const linkClassName = `nodrag nopan nowheel pointer-events-auto cursor-pointer transition-all hover:border-gray-300 hover:bg-gray-50/50 hover:shadow-md ${mapNodeCardClassName}`;

  const content = (
    <SatelliteCardContent
      title={title}
      detail={data.detail}
      icon={isContact ? <PlatformIcon platform={data.platform || data.label} className="h-4 w-4" /> : undefined}
      isLink={isLink}
    />
  );

  return (
    <div className="font-[Nunito]">
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-gray-300 !bg-gray-200"
      />
      {isExternalLink ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={ariaLabel}
          className={linkClassName}
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
          onClick={(event) => {
            openExternalLink(event, href);
          }}
        >
          {content}
        </a>
      ) : isLink ? (
        <Link
          to={href}
          aria-label={ariaLabel}
          className={linkClassName}
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          {content}
        </Link>
      ) : (
        <div className={mapNodeCardClassName}>{content}</div>
      )}
    </div>
  );
}

export default MapSatelliteNode;
