import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import MapPartyNode from "@presentation/pages/report/components/MapPartyNode";
import MapSatelliteNode from "@presentation/pages/report/components/MapSatelliteNode";
import {
  buildMapGraphFromApi,
  type PartyKind,
} from "@presentation/pages/report/components/map-graph";
import { exportRelationshipMap } from "@presentation/pages/report/components/map-export";
import type { FindRelationshipMapResult } from "@/core/domain/map/models/find-relationship-map.model";
import { useDependencies } from "@/presentation/providers/useDependencies";
import { isCanceledError } from "@/common/utils/http-error.util";

const nodeTypes = {
  party: MapPartyNode,
  satellite: MapSatelliteNode,
};

interface MapTabProps {
  partyId: string;
  partyType: PartyKind;
}

function MapCanvas({
  map,
  partyId,
  partyType,
}: {
  map: FindRelationshipMapResult;
  partyId: string;
  partyType: PartyKind;
}) {
  const { nodes, edges } = useMemo(
    () => buildMapGraphFromApi(map, partyId, partyType),
    [map, partyId, partyType],
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView={{ padding: 0.15 }}
      panOnDrag
      zoomOnScroll
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
    >
      <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e5e7eb" />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
}

function MapExportMenu({
  canExport,
  fileName,
  mapContainerRef,
}: {
  canExport: boolean;
  fileName: string;
  mapContainerRef: RefObject<HTMLDivElement | null>;
}) {
  const { getNodes } = useReactFlow();
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const isDisabled = !canExport || isExporting;

  async function exportPng() {
    if (isDisabled) {
      return;
    }

    const viewportElement = mapContainerRef.current?.querySelector<HTMLElement>(
      ".react-flow__viewport",
    );

    if (!viewportElement) {
      setExportError("No pudimos exportar el mapa. Inténtalo de nuevo.");
      return;
    }

    setIsExporting(true);
    setExportError(null);

    try {
      await exportRelationshipMap({
        nodes: getNodes(),
        viewportElement,
        fileName,
      });
    } catch {
      setExportError("No pudimos exportar el mapa. Inténtalo de nuevo.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        disabled={isDisabled}
        onClick={exportPng}
        className={
          isDisabled
            ? "cursor-not-allowed rounded-md bg-gray-200 px-4 py-2 text-sm font-extrabold text-gray-600 disabled:opacity-100"
            : "cursor-pointer rounded-md bg-red-600 px-4 py-2 text-sm font-extrabold text-white hover:bg-red-700"
        }
      >
        {isExporting ? "Exportando..." : "Exportar"}
      </button>
      {exportError && (
        <p role="alert" className="mt-2 text-xs font-semibold text-red-800">
          {exportError}
        </p>
      )}
    </div>
  );
}

function MapTab({ partyId, partyType }: MapTabProps) {
  const { findRelationshipMapByPartyUseCase } = useDependencies();
  const [map, setMap] = useState<FindRelationshipMapResult>({
    nodes: [],
    edges: [],
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);
  const requestKey = `${partyId}:${partyType}:${requestVersion}`;
  const [loadedRequestKey, setLoadedRequestKey] = useState<string | null>(
    null,
  );
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const isLoading = loadedRequestKey !== requestKey;

  useEffect(() => {
    let ignore = false;

    findRelationshipMapByPartyUseCase
      .execute(partyId, partyType)
      .then((result) => {
        if (ignore) {
          return;
        }

        setMap(result);
        setErrorMessage(null);
        setLoadedRequestKey(requestKey);
      })
      .catch((error) => {
        if (ignore || isCanceledError(error)) {
          return;
        }

        setMap({ nodes: [], edges: [] });
        setErrorMessage(
          "No pudimos cargar el mapa de relaciones. Revisa tu conexión e inténtalo de nuevo.",
        );
        setLoadedRequestKey(requestKey);
      });

    return () => {
      ignore = true;
      findRelationshipMapByPartyUseCase.cancel();
    };
  }, [
    findRelationshipMapByPartyUseCase,
    partyId,
    partyType,
    requestKey,
    requestVersion,
  ]);

  const hasGraph = map.nodes.length > 0;

  return (
    <ReactFlowProvider>
      <section className="border border-gray-200 bg-white p-6 sm:p-8">
        <div className="grid grid-cols-[1fr_auto] items-center gap-3">
          <h2 className="text-xl font-extrabold leading-none text-gray-900">
            Mapa de relaciones
          </h2>
          <MapExportMenu
            canExport={!isLoading && !errorMessage && hasGraph}
            fileName="mapa-relaciones"
            mapContainerRef={mapContainerRef}
          />
        </div>
        <div
          ref={mapContainerRef}
          className="map-tab relative mt-6 h-[32rem] min-h-[28rem] w-full overflow-hidden border border-gray-200 bg-gray-50 [&_.react-flow_svg]:overflow-visible"
          aria-label="Mapa de relaciones"
        >
          {isLoading && (
            <p className="flex h-full items-center justify-center text-sm text-gray-400">
              Cargando mapa...
            </p>
          )}

          {!isLoading && errorMessage && (
            <div
              role="alert"
              className="flex h-full flex-col items-center justify-center px-6 text-center"
            >
              <p className="text-sm font-semibold text-red-800">{errorMessage}</p>
              <button
                type="button"
                onClick={() => setRequestVersion((version) => version + 1)}
                className="mt-3 rounded-md bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
              >
                Reintentar
              </button>
            </div>
          )}

          {!isLoading && !errorMessage && hasGraph && (
            <MapCanvas map={map} partyId={partyId} partyType={partyType} />
          )}

          {!isLoading && !errorMessage && !hasGraph && (
            <p className="flex h-full items-center justify-center px-6 text-center text-sm text-gray-400">
              No hay relaciones registradas para mostrar en el mapa.
            </p>
          )}
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Arrastra el mapa para recorrerlo y usa la rueda del ratón o los
          controles para acercar o alejar.
        </p>
      </section>
    </ReactFlowProvider>
  );
}

export default MapTab;
