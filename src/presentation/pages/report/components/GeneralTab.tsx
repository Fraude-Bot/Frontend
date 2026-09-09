import { KeyboardEvent, useEffect, useState } from "react";
import reportIcons from "@presentation/pages/report/components/icons";
import MonthlyReportsChart from "@presentation/pages/report/components/MonthlyReportsChart";
import { ReportTab } from "@presentation/pages/report/components/types";
import { useDependencies } from "@/presentation/providers/useDependencies";
import MonthlyReportCountsEntity from "@/core/domain/report/entities/monthly-report-counts.entity";
import { isCanceledError } from "@/common/utils/http-error.util";

interface GeneralTabProps {
  partyId: string;
  partyType: "scammer" | "organization";
  reports: number;
  onNavigateTab: (tab: ReportTab) => void;
}

function formatLongDate(date: Date) {
  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function ExternalLinkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="h-5 w-5 shrink-0 text-gray-400 transition-colors group-hover:text-black"
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

function PanelHeader({
  title,
  showExternalLink = false,
}: {
  title: string;
  showExternalLink?: boolean;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3">
      <h2 className="text-xl font-extrabold leading-none text-gray-900">
        {title}
      </h2>
      {showExternalLink && <ExternalLinkIcon />}
    </div>
  );
}

const CURRENT_YEAR = new Date().getFullYear();
const CALENDAR_YEARS = Array.from(
  { length: CURRENT_YEAR - 2019 },
  (_, index) => CURRENT_YEAR - index,
);

const panelClassName =
  "group grid h-full w-full cursor-pointer text-left transition-colors hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gray-300 lg:row-span-4 lg:grid-rows-subgrid";

const panelGridClassName =
  "grid lg:grid-cols-2 lg:grid-rows-[auto_auto_1fr_auto] lg:divide-x lg:divide-gray-200";

const disabledPanelClassName =
  "grid h-full w-full text-left lg:row-span-4 lg:grid-rows-subgrid";

function activatePanel(
  event: KeyboardEvent<HTMLDivElement>,
  onActivate: () => void,
) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onActivate();
  }
}

function GeneralTab({
  partyId,
  partyType,
  reports,
  onNavigateTab,
}: GeneralTabProps) {
  const today = formatLongDate(new Date());
  const { findMonthlyReportCountsUseCase } = useDependencies();
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [requestVersion, setRequestVersion] = useState(0);
  const requestKey = `${partyId}:${partyType}:${selectedYear}:${requestVersion}`;
  const [chart, setChart] = useState<{
    key: string;
    monthlyCounts: MonthlyReportCountsEntity | null;
    status: "ready" | "error";
  } | null>(null);

  useEffect(() => {
    let ignore = false;

    findMonthlyReportCountsUseCase
      .execute(partyId, partyType, selectedYear)
      .then((counts) => {
        if (ignore) {
          return;
        }

        setChart({
          key: requestKey,
          monthlyCounts: counts,
          status: "ready",
        });
      })
      .catch((error: unknown) => {
        if (ignore || isCanceledError(error)) {
          return;
        }

        setChart({
          key: requestKey,
          monthlyCounts: null,
          status: "error",
        });
      });

    return () => {
      ignore = true;
      findMonthlyReportCountsUseCase.cancel();
    };
  }, [
    findMonthlyReportCountsUseCase,
    partyId,
    partyType,
    requestKey,
    requestVersion,
    selectedYear,
  ]);

  const chartState: "loading" | "ready" | "error" =
    chart?.key !== requestKey ? "loading" : chart.status;
  const monthlyCounts = chartState === "ready" ? chart?.monthlyCounts : null;

  return (
    <div className="divide-y divide-gray-200 border border-gray-200 bg-white">
      <div className="divide-y divide-gray-200">
        <div className={panelGridClassName}>
          <div
            role="button"
            tabIndex={0}
            onClick={() => onNavigateTab("Reportes")}
            onKeyDown={(event) =>
              activatePanel(event, () => onNavigateTab("Reportes"))
            }
            className={`${panelClassName} lg:col-start-1`}
          >
            <div className="px-6 pt-6 sm:px-8 sm:pt-8">
              <PanelHeader title="Reportes:" showExternalLink />
            </div>
            <p className="px-6 pt-3 text-base leading-6 text-gray-600 sm:px-8">
              Hasta el día de hoy {today} se han recibido:
            </p>
            <div className="flex items-center justify-center px-6 pt-5 sm:px-8">
              {reportIcons.reportAlert && (
                <img
                  src={reportIcons.reportAlert}
                  alt=""
                  aria-hidden
                  className="h-10 w-10 shrink-0"
                />
              )}
              <span className="ml-3 font-extrabold text-gray-900">
                <span className="text-5xl">{reports}</span>
                <span className="text-3xl"> reportes</span>
              </span>
            </div>
            <p className="px-6 pb-6 pt-4 text-sm text-gray-400 sm:px-8 sm:pb-8">
              Los reportes han sido verificados por nuestro equipo.
            </p>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => onNavigateTab("Contactos")}
            onKeyDown={(event) =>
              activatePanel(event, () => onNavigateTab("Contactos"))
            }
            className={`${panelClassName} lg:col-start-2`}
          >
            <div className="px-6 pt-6 sm:px-8 sm:pt-8">
              <PanelHeader title="Contactos:" showExternalLink />
            </div>
            <p className="px-6 pt-3 text-base leading-6 text-gray-600 sm:px-8">
              Descubre los perfiles que utiliza esta{" "}
              <span className="font-extrabold text-gray-900">
                empresa/estafador
              </span>
              :
            </p>
            <div className="flex items-start justify-center px-6 pt-5 sm:px-8">
              {reportIcons.contactsIllustration ? (
                <img
                  src={reportIcons.contactsIllustration}
                  alt=""
                  aria-hidden
                  className="h-32 w-32 object-contain"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-400">
                  Ilustración de contactos
                </div>
              )}
            </div>
            <div className="px-6 pb-6 pt-4 sm:px-8 sm:pb-8" />
          </div>
        </div>

        <div className={panelGridClassName}>
          <div
            role="button"
            tabIndex={0}
            onClick={() => onNavigateTab("Mapa")}
            onKeyDown={(event) =>
              activatePanel(event, () => onNavigateTab("Mapa"))
            }
            className={`${panelClassName} lg:col-start-1`}
          >
            <div className="px-6 pt-6 sm:px-8 sm:pt-8">
              <PanelHeader title="Mapa:" showExternalLink />
            </div>
            <p className="px-6 pt-3 text-base leading-6 text-gray-600 sm:px-8">
              Explora las conexiones entre perfiles, reportes y entidades
              relacionadas con esta{" "}
              <span className="font-extrabold text-gray-900">
                empresa/estafador
              </span>
              :
            </p>
            <div className="flex items-start justify-center px-6 pt-5 sm:px-8">
              {reportIcons.mapIllustration ? (
                <img
                  src={reportIcons.mapIllustration}
                  alt=""
                  aria-hidden
                  className="h-32 w-32 object-contain"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-400">
                  Ilustración de mapa
                </div>
              )}
            </div>
            <p className="px-6 pb-6 pt-4 text-sm text-gray-400 sm:px-8 sm:pb-8">
              Arrastra y haz zoom para recorrer el mapa de relaciones.
            </p>
          </div>

          <div className={`${disabledPanelClassName} lg:col-start-2`}>
            <div className="px-6 pt-6 sm:px-8 sm:pt-8">
              <PanelHeader title="Soporte:" />
            </div>
            <p className="px-6 pt-3 text-base leading-6 text-gray-600 sm:px-8">
              Obtén ayuda y recursos para reportar o consultar sobre este
              perfil:
            </p>
            <div className="flex items-start justify-center px-6 pt-5 sm:px-8">
              {reportIcons.soporte ? (
                <img
                  src={reportIcons.soporte}
                  alt=""
                  aria-hidden
                  className="h-32 w-32 object-contain opacity-60"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-400">
                  Ilustración de soporte
                </div>
              )}
            </div>
            <p className="px-6 pb-6 pt-4 text-sm text-gray-400 sm:px-8 sm:pb-8">
              Sección disponible próximamente.
            </p>
          </div>
        </div>
      </div>

      <section className="p-6 sm:p-8">
        <div className="grid grid-cols-[1fr_auto] items-center gap-3">
          <h2 className="text-xl font-extrabold leading-none text-gray-900">
            Diagrama de Reportes por Año
          </h2>
          <select
            aria-label="Año"
            value={selectedYear}
            onChange={(event) => setSelectedYear(Number(event.target.value))}
            className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
          >
            {CALENDAR_YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4">
          {chartState === "loading" ? (
            <div className="flex h-56 items-center text-sm text-gray-400">
              Cargando diagrama...
            </div>
          ) : chartState === "error" ? (
            <div
              role="alert"
              className="flex h-56 flex-col items-center justify-center text-center"
            >
              <p className="font-semibold text-red-800">
                No pudimos cargar los reportes de este año.
              </p>
              <button
                type="button"
                onClick={() => setRequestVersion((version) => version + 1)}
                className="mt-3 rounded-md bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
              >
                Reintentar
              </button>
            </div>
          ) : monthlyCounts?.hasReports ? (
            <>
              <MonthlyReportsChart monthlyCounts={monthlyCounts} />
              <p className="mt-2 text-sm text-gray-400">
                Diagramas de barras de cantidad de reportes por mes del año{" "}
                {selectedYear}
              </p>
            </>
          ) : (
            <p className="flex h-56 items-center justify-center text-center text-2xl font-bold text-gray-900">
              No hubo reportes en este año
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export default GeneralTab;
