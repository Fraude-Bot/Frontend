import { useCallback, useEffect, useState } from "react";
import { isCanceledError } from "@/common/utils/http-error.util";

type QueryState<T> =
  | { key: string; status: "ready"; data: T }
  | { key: string; status: "error"; error: unknown };

type UseCancellableQueryOptions<T> = {
  queryKey: string;
  query: () => Promise<T>;
  cancel: () => void;
  enabled?: boolean;
};

type CancellableQueryResult<T> =
  | { status: "idle" | "loading"; data: null; error: null; retry: () => void }
  | { status: "ready"; data: T; error: null; retry: () => void }
  | { status: "error"; data: null; error: unknown; retry: () => void };

export function useCancellableQuery<T>({
  queryKey,
  query,
  cancel,
  enabled = true,
}: UseCancellableQueryOptions<T>): CancellableQueryResult<T> {
  const [version, setVersion] = useState(0);
  const [state, setState] = useState<QueryState<T> | null>(null);
  const requestKey = `${queryKey}:${version}`;
  const retry = useCallback(() => setVersion((value) => value + 1), []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let ignore = false;
    query()
      .then((data) => {
        if (!ignore) {
          setState({ key: requestKey, status: "ready", data });
        }
      })
      .catch((error: unknown) => {
        if (!ignore && !isCanceledError(error)) {
          setState({ key: requestKey, status: "error", error });
        }
      });

    return () => {
      ignore = true;
      cancel();
    };
  }, [cancel, enabled, query, requestKey]);

  if (!enabled) {
    return { status: "idle", data: null, error: null, retry };
  }
  if (state?.key !== requestKey) {
    return { status: "loading", data: null, error: null, retry };
  }
  if (state.status === "ready") {
    return { status: "ready", data: state.data, error: null, retry };
  }
  return { status: "error", data: null, error: state.error, retry };
}
