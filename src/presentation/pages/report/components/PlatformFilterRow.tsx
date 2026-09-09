import { useCallback, useEffect, useRef, useState } from "react";
import { SOCIAL_FILTERS } from "@presentation/pages/report/components/contact-platform";
import { PlatformIcon } from "@presentation/pages/report/components/PlatformIcon";

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        d={direction === "right" ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface PlatformFilterRowProps {
  selectedPlatform?: string;
  onPlatformChange: (platform: string) => void;
}

function PlatformFilterRow({
  selectedPlatform,
  onPlatformChange,
}: PlatformFilterRowProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateOverflow = useCallback(() => {
    const node = scrollerRef.current;

    if (!node) {
      return;
    }

    const maxScroll = node.scrollWidth - node.clientWidth;

    setCanScrollLeft(node.scrollLeft > 0);
    setCanScrollRight(maxScroll > 1 && node.scrollLeft < maxScroll - 1);
  }, []);

  useEffect(() => {
    const node = scrollerRef.current;

    if (!node) {
      return;
    }

    updateOverflow();

    const observer = new ResizeObserver(updateOverflow);
    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [updateOverflow]);

  const scrollByPage = (direction: 1 | -1) => {
    const node = scrollerRef.current;

    if (!node) {
      return;
    }

    node.scrollBy({
      left: direction * Math.max(node.clientWidth * 0.7, 160),
      behavior: "smooth",
    });
  };

  return (
    <div className="mt-6 flex items-center gap-3">
      <span className="shrink-0 text-sm font-bold text-gray-900">
        Red Social:
      </span>

      <div className="flex min-w-0 flex-1 items-center gap-1">
        {canScrollLeft && (
          <button
            type="button"
            aria-label="Plataformas anteriores"
            onClick={() => scrollByPage(-1)}
            className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            <ChevronIcon direction="left" />
          </button>
        )}

        <div
          ref={scrollerRef}
          onScroll={updateOverflow}
          aria-label="Filtros de plataforma"
          className="flex min-w-0 flex-1 flex-nowrap gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {SOCIAL_FILTERS.map((filter) => {
            const isSelected = selectedPlatform === filter.platform;

            return (
              <button
                key={filter.platform}
                type="button"
                onClick={() => onPlatformChange(filter.platform)}
                aria-pressed={isSelected}
                className={`inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-semibold ${
                  isSelected
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <PlatformIcon platform={filter.platform} className="h-4 w-4" />
                {filter.label}
              </button>
            );
          })}
        </div>

        {canScrollRight && (
          <button
            type="button"
            aria-label="Más plataformas"
            onClick={() => scrollByPage(1)}
            className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            <ChevronIcon direction="right" />
          </button>
        )}
      </div>
    </div>
  );
}

export default PlatformFilterRow;
