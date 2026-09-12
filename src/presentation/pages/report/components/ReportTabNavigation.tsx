import { useRef, type KeyboardEvent } from "react";
import reportIcons from "@presentation/pages/report/components/icons";
import {
  reportTabs,
  ReportTab,
} from "@presentation/pages/report/components/types";

interface ReportTabNavigationProps {
  activeTab: ReportTab;
  onTabChange: (tab: ReportTab) => void;
}

const tabIcons: Record<ReportTab, string> = {
  General: reportIcons.home,
  Reportes: reportIcons.reportes,
  Contactos: reportIcons.contactos,
  Mapa: reportIcons.mapa,
  Soporte: reportIcons.soporte,
};

function ReportTabNavigation({
  activeTab,
  onTabChange,
}: ReportTabNavigationProps) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, tab: ReportTab) {
    const currentIndex = reportTabs.indexOf(tab);
    let nextIndex: number | undefined;

    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % reportTabs.length;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + reportTabs.length) % reportTabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = reportTabs.length - 1;

    if (nextIndex === undefined) return;
    event.preventDefault();
    const nextTab = reportTabs[nextIndex];
    if (!nextTab) return;
    onTabChange(nextTab);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <div className="mx-auto flex max-w-5xl justify-center px-4 pt-6">
      <div
        role="tablist"
        className="inline-flex w-fit max-w-full overflow-x-auto bg-gray-100"
        aria-label="Secciones del perfil"
      >
        {reportTabs.map((tab, index) => {
          const isActive = activeTab === tab;
          const iconSrc = tabIcons[tab];

          return (
            <button
              key={tab}
              ref={(element) => { tabRefs.current[index] = element; }}
              type="button"
              role="tab"
              id={`report-tab-${tab.toLowerCase()}`}
              aria-controls={`report-panel-${tab.toLowerCase()}`}
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onTabChange(tab)}
              onKeyDown={(event) => handleKeyDown(event, tab)}
              className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap px-5 py-3.5 text-sm font-extrabold transition-colors focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-red-600 ${
                isActive
                  ? "bg-gray-950 text-white"
                  : "cursor-pointer text-gray-600 hover:bg-gray-200 hover:text-gray-950"
              }`}
            >
              {iconSrc && (
                <img
                  src={iconSrc}
                  alt=""
                  aria-hidden
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? "brightness-0 invert" : ""
                  }`}
                />
              )}
              {tab}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ReportTabNavigation;
