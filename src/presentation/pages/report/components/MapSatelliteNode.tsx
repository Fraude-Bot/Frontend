import { type ReactNode, type MouseEvent, useEffect, useRef, useState } from "react";
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
import { copyTextToClipboard } from "@/presentation/shared/utils/copy-text-to-clipboard.util";

const COPIED_VISIBLE_MS = 1800;

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

function CopyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="h-4 w-4 shrink-0 text-gray-400"
    >
      <rect
        x="8"
        y="8"
        width="12"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M6 16H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-3.5 w-3.5">
      <path
        d="M5 12.5 9.5 17 19 7"
        stroke="currentColor"
        strokeWidth="2.2"
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

type HeaderAction = "external" | "copy" | "none";

function SatelliteCardContent({
  title,
  detail,
  icon,
  headerAction,
  copied,
}: {
  title: string;
  detail: string;
  icon?: ReactNode;
  headerAction: HeaderAction;
  copied?: boolean;
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className={`flex min-w-0 items-center gap-1.5 ${copied ? "pr-16" : ""}`}>
          {icon}
          <p className="truncate text-[10px] font-extrabold uppercase tracking-[0.14em] text-gray-400">
            {title}
          </p>
        </div>
        {headerAction === "external" && (
          <span aria-hidden>
            <ExternalLinkIcon />
          </span>
        )}
        {headerAction === "copy" && !copied && (
          <span aria-hidden>
            <CopyIcon />
          </span>
        )}
        <span
          aria-hidden
          className={`absolute top-2.5 right-2.5 inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 motion-safe:transition motion-safe:duration-200 ${
            copied
              ? "translate-y-0 scale-100 opacity-100"
              : "pointer-events-none -translate-y-1 scale-95 opacity-0"
          }`}
        >
          <CheckIcon />
          Copiado
        </span>
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

function CopyablePaymentSatellite({
  title,
  detail,
  linkClassName,
}: {
  title: string;
  detail: string;
  linkClassName: string;
}) {
  const [copied, setCopied] = useState(false);
  const hideTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (hideTimer.current !== null) {
        window.clearTimeout(hideTimer.current);
      }
    };
  }, []);

  const handleCopy = () => {
    void copyTextToClipboard(detail)
      .then(() => {
        setCopied(true);
        if (hideTimer.current !== null) {
          window.clearTimeout(hideTimer.current);
        }
        hideTimer.current = window.setTimeout(() => {
          setCopied(false);
          hideTimer.current = null;
        }, COPIED_VISIBLE_MS);
      })
      .catch(() => {
        setCopied(false);
      });
  };

  const buttonClassName = `relative text-left ${linkClassName} ${
    copied ? "border-emerald-300 bg-emerald-50/60" : ""
  }`;

  return (
    <button
      type="button"
      aria-label={`Copiar ${title}: ${detail}`}
      className={buttonClassName}
      onPointerDown={(event) => {
        event.stopPropagation();
      }}
      onClick={(event) => {
        event.stopPropagation();
        handleCopy();
      }}
    >
      <SatelliteCardContent
        title={title}
        detail={detail}
        headerAction="copy"
        copied={copied}
      />
      <span className="sr-only" aria-live="polite">
        {copied ? "Copiado" : ""}
      </span>
    </button>
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
  const isCopyablePayment = !isContact && isLink && !isExternalPaymentHref(href);
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
      headerAction={isExternalLink ? "external" : "none"}
    />
  );

  return (
    <div className="font-[Nunito]">
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-gray-300 !bg-gray-200"
      />
      {isCopyablePayment ? (
        <CopyablePaymentSatellite
          title={title}
          detail={data.detail}
          linkClassName={linkClassName}
        />
      ) : isExternalLink ? (
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
