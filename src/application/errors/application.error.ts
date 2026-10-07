export type ApplicationErrorCode =
  | "cancelled"
  | "not-found"
  | "rate-limited"
  | "validation"
  | "unexpected";

class ApplicationError extends Error {
  public constructor(
    public readonly code: ApplicationErrorCode,
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = code === "cancelled" ? "AbortError" : "ApplicationError";
  }
}

export default ApplicationError;
