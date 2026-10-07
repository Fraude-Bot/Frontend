import type { SearchReportCachePort } from "@/application/ports/search-report-cache.port";
import ReportSummaryEntity from "@/core/domain/report/entities/report-summary.entity";
import type SearchReportResult from "@/core/domain/report/models/search-report.model";

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

type CachedSearchReportResult = {
  data: Array<{
    id: string;
    name: string;
    tags: string[];
    reports: number;
    type: "scammer" | "organization";
    organizations: string[] | null;
    products: string[];
    status: "active" | "inactive";
  }>;
  total: number;
  page: number;
  count: number;
  cachedAt: number;
};

const SEARCH_CACHE_PREFIX = "fraudebot:search";
const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;

export class BrowserSearchReportCache implements SearchReportCachePort {
  public constructor(
    private readonly storage: KeyValueStorage = sessionStorage,
    private readonly ttlMs = DEFAULT_CACHE_TTL_MS,
    private readonly now: () => number = Date.now,
  ) {}

  public get(query: string, page: number): SearchReportResult | null {
    const cacheKey = this.getCacheKey(query, page);
    const cachedResult = this.storage.getItem(cacheKey);
    if (!cachedResult) {
      return null;
    }

    try {
      const parsed = JSON.parse(cachedResult) as CachedSearchReportResult;
      if (
        typeof parsed.cachedAt !== "number" ||
        this.now() - parsed.cachedAt > this.ttlMs
      ) {
        this.storage.removeItem(cacheKey);
        return null;
      }

      return {
        data: parsed.data.map(
          (report) =>
            new ReportSummaryEntity(
              report.id,
              report.name,
              report.tags,
              report.reports,
              report.type,
              report.organizations,
              report.products,
              report.status,
            ),
        ),
        total: parsed.total,
        page: parsed.page,
        count: parsed.count,
      };
    } catch {
      this.storage.removeItem(cacheKey);
      return null;
    }
  }

  public set(query: string, result: SearchReportResult): void {
    const cached: CachedSearchReportResult = {
      data: result.data.map((report) => ({
        id: report.id,
        name: report.name,
        tags: report.tags,
        reports: report.reports,
        type: report.type,
        organizations: report.organizations,
        products: report.products,
        status: report.status,
      })),
      total: result.total,
      page: result.page,
      count: result.count,
      cachedAt: this.now(),
    };
    this.storage.setItem(
      this.getCacheKey(query, result.page),
      JSON.stringify(cached),
    );
  }

  private getCacheKey(query: string, page: number): string {
    return `${SEARCH_CACHE_PREFIX}:${query}:${page}`;
  }
}
