class RequestCanceler {
  private controller: AbortController | null = null;

  public prepareSignal(): AbortSignal {
    this.cancel();
    this.controller = new AbortController();
    return this.controller.signal;
  }

  public async delay(ms: number): Promise<void> {
    const signal = this.getSignal();

    if (signal.aborted) {
      throw new DOMException("Request was cancelled", "AbortError");
    }

    await new Promise<void>((resolve, reject) => {
      const onAbort = () => {
        clearTimeout(timeoutId);
        reject(new DOMException("Request was cancelled", "AbortError"));
      };

      const timeoutId = setTimeout(() => {
        signal.removeEventListener("abort", onAbort);
        resolve();
      }, ms);

      signal.addEventListener("abort", onAbort, { once: true });
    });
  }

  public cancel(): void {
    this.controller?.abort();
    this.controller = null;
  }

  private getSignal(): AbortSignal {
    if (!this.controller) {
      throw new Error("Call prepareSignal() before using delay().");
    }

    return this.controller.signal;
  }
}

export default RequestCanceler;
