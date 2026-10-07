function isCanceledError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const candidate = error as { code?: string; name?: string };

  return (
    candidate.name === "AbortError" ||
    candidate.name === "CanceledError" ||
    candidate.code === "ERR_CANCELED"
  );
}

function getHttpStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  const candidate = error as {
    status?: unknown;
    response?: { status?: unknown };
  };
  const status = candidate.status ?? candidate.response?.status;
  return typeof status === "number" ? status : undefined;
}

export { getHttpStatus, isCanceledError };
