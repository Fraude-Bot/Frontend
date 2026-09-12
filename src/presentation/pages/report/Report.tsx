import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Footer from "@presentation/shared/components/Footer";
import Header from "@presentation/shared/components/Header";
import ContactsTab from "@presentation/pages/report/components/ContactsTab";
import GeneralTab from "@presentation/pages/report/components/GeneralTab";
import MapTab from "@presentation/pages/report/components/MapTab";
import SupportTab from "@presentation/pages/report/components/SupportTab";
import ReportHero, {
  ReportHeroSkeleton,
} from "@presentation/pages/report/components/ReportHero";
import ReportsTab from "@presentation/pages/report/components/ReportsTab";
import ReportTabNavigation from "@presentation/pages/report/components/ReportTabNavigation";
import { ReportTab } from "@presentation/pages/report/components/types";
import defaultAvatar from "@presentation/assets/default-avatar.png";
import { useDependencies } from "@/presentation/providers/useDependencies";
import ScammerSummaryEntity from "@/core/domain/scammer/entities/scammer-summary.entity";
import OrganizationSummaryEntity from "@/core/domain/organization/entities/organization-summary.entity";
import {
  getHttpStatus,
  isCanceledError,
} from "@/common/utils/http-error.util";

function GeneralPanelsSkeleton() {
  return (
    <div
      className="divide-y divide-gray-200 border border-gray-200 bg-white"
      aria-hidden
    >
      <div className="divide-y divide-gray-200">
        <div className="grid lg:grid-cols-2 lg:divide-x lg:divide-gray-200">
          <div className="space-y-4 px-6 py-6 sm:px-8 sm:py-8">
            <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-full max-w-xs animate-pulse rounded bg-gray-200" />
            <div className="h-9 w-40 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="space-y-4 px-6 py-6 sm:px-8 sm:py-8">
            <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-full max-w-sm animate-pulse rounded bg-gray-200" />
            <div className="mx-auto h-32 w-32 animate-pulse rounded-lg bg-gray-200" />
          </div>
        </div>
        <div className="grid lg:grid-cols-2 lg:divide-x lg:divide-gray-200">
          <div className="space-y-4 px-6 py-6 sm:px-8 sm:py-8">
            <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-full max-w-sm animate-pulse rounded bg-gray-200" />
            <div className="mx-auto h-32 w-32 animate-pulse rounded-lg bg-gray-200" />
          </div>
          <div className="space-y-4 px-6 py-6 sm:px-8 sm:py-8">
            <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-full max-w-xs animate-pulse rounded bg-gray-200" />
            <div className="mx-auto h-32 w-32 animate-pulse rounded-lg bg-gray-200" />
          </div>
        </div>
      </div>
      <div className="p-6 sm:p-8">
        <div className="h-6 w-28 animate-pulse rounded bg-gray-200" />
        <div className="mt-4 h-56 animate-pulse rounded bg-gray-100" />
      </div>
    </div>
  );
}

function Report({ type }: { type: "scammer" | "organization" }) {
  const { id } = useParams<{ id: string }>();
  const { findScammerSummaryByIdUseCase, findOrganizationSummaryByIdUseCase } =
    useDependencies();
  const [activeTab, setActiveTab] = useState<ReportTab>("General");
  const [requestVersion, setRequestVersion] = useState(0);
  const requestKey = `${type}:${id ?? ""}:${requestVersion}`;
  const [result, setResult] = useState<{
    key: string;
    party: ScammerSummaryEntity | OrganizationSummaryEntity | null;
    status: "ready" | "not-found" | "error";
  } | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    let ignore = false;
    const handleError = (error: unknown) => {
      if (ignore || isCanceledError(error)) {
        return;
      }

      setResult({
        key: requestKey,
        party: null,
        status: getHttpStatus(error) === 404 ? "not-found" : "error",
      });
    };

    if (type === "scammer") {
      findScammerSummaryByIdUseCase
        .execute(id)
        .then((scammer) => {
          if (ignore) {
            return;
          }

          setResult({ key: requestKey, party: scammer, status: "ready" });
        })
        .catch(handleError);

      return () => {
        ignore = true;
        findScammerSummaryByIdUseCase.cancel();
      };
    }

    findOrganizationSummaryByIdUseCase
      .execute(id)
      .then((organization) => {
        if (ignore) {
          return;
        }

        setResult({ key: requestKey, party: organization, status: "ready" });
      })
      .catch(handleError);

    return () => {
      ignore = true;
      findOrganizationSummaryByIdUseCase.cancel();
    };
  }, [
    findOrganizationSummaryByIdUseCase,
    findScammerSummaryByIdUseCase,
    id,
    requestKey,
    requestVersion,
    type,
  ]);

  const loadState: "loading" | "ready" | "not-found" | "error" = !id
    ? "not-found"
    : result?.key !== requestKey
      ? "loading"
      : result.status;
  const party = loadState === "ready" ? result?.party : null;

  const title = party
    ? `FraudeBot - ${party.name}`
    : loadState === "not-found"
      ? "FraudeBot - Perfil no encontrado"
      : loadState === "error"
        ? "FraudeBot - Error"
        : "FraudeBot";

  return (
    <div className="font-[Nunito]">
      <title>{title}</title>
      <Header />
      {loadState === "ready" && party ? (
        <ReportHero
          id={party.id}
          name={party.name}
          type={type === "scammer" ? "Estafador" : "Empresa"}
          partyType={type}
          reportDate={party.createdAt}
          status={party.isActive ? "Activo" : "Inactivo"}
          reports={party.reports}
          location={party.country}
          categories={party.categories}
          profilePicture={party.profilePicture || defaultAvatar}
        />
      ) : loadState === "loading" ? (
        <ReportHeroSkeleton />
      ) : null}

      <main className="min-h-130 bg-white">
        {loadState === "ready" && (
          <ReportTabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        )}

        <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
          {loadState === "not-found" && (
            <section className="mx-auto mt-24 max-w-xl rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
              <h1 className="text-2xl font-extrabold text-gray-950">
                Perfil no encontrado
              </h1>
              <p className="mt-3 text-gray-600">
                El perfil solicitado no existe o ya no está disponible.
              </p>
              <Link
                to="/busqueda"
                className="mt-6 inline-block rounded-md bg-red-600 px-5 py-2.5 font-bold text-white hover:bg-red-700"
              >
                Volver a la búsqueda
              </Link>
            </section>
          )}

          {loadState === "error" && (
            <section
              role="alert"
              className="mx-auto mt-24 max-w-xl rounded-xl border border-red-200 bg-red-50 p-8 text-center"
            >
              <h1 className="text-2xl font-extrabold text-red-950">
                No pudimos cargar el perfil
              </h1>
              <p className="mt-3 text-red-800">
                Revisa tu conexión e inténtalo de nuevo.
              </p>
              <button
                type="button"
                onClick={() => setRequestVersion((version) => version + 1)}
                className="mt-6 rounded-md bg-red-600 px-5 py-2.5 font-bold text-white hover:bg-red-700"
              >
                Reintentar
              </button>
            </section>
          )}

          {loadState === "ready" && party ? (
            <div
              role="tabpanel"
              id={`report-panel-${activeTab.toLowerCase()}`}
              aria-labelledby={`report-tab-${activeTab.toLowerCase()}`}
              tabIndex={0}
              className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-600"
            >
              {activeTab === "General" && (
                <GeneralTab
                  partyId={party.id}
                  partyType={type}
                  reports={party.reports}
                  onNavigateTab={setActiveTab}
                />
              )}
              {activeTab === "Reportes" && (
                <ReportsTab partyId={party.id} partyType={type} />
              )}
              {activeTab === "Contactos" && (
                <ContactsTab partyId={party.id} partyType={type} />
              )}
              {activeTab === "Mapa" && (
                <MapTab partyId={party.id} partyType={type} />
              )}
              {activeTab === "Soporte" && <SupportTab />}
            </div>
          ) : loadState === "loading" ? (
            activeTab === "General" && <GeneralPanelsSkeleton />
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Report;
