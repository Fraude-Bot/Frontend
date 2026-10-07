import RequestCanceler from "@/application/shared/request-canceler";

describe("RequestCanceler", () => {
  it("returns a fresh abort signal from prepareSignal", () => {
    const canceler = new RequestCanceler();

    const signal = canceler.prepareSignal();

    expect(signal.aborted).toBe(false);
  });

  it("aborts the previous signal when prepareSignal is called again", () => {
    const canceler = new RequestCanceler();
    const firstSignal = canceler.prepareSignal();

    canceler.prepareSignal();

    expect(firstSignal.aborted).toBe(true);
  });

  it("resolves delay when not cancelled", async () => {
    const canceler = new RequestCanceler();
    canceler.prepareSignal();

    await expect(canceler.delay(10)).resolves.toBeUndefined();
  });

  it("rejects delay when cancelled", async () => {
    const canceler = new RequestCanceler();
    canceler.prepareSignal();

    const delayPromise = canceler.delay(100);
    canceler.cancel();

    await expect(delayPromise).rejects.toMatchObject({ name: "AbortError" });
  });

  it("throws when delay is called before prepareSignal", async () => {
    const canceler = new RequestCanceler();

    await expect(canceler.delay(10)).rejects.toThrow(
      "Call prepareSignal() before using delay().",
    );
  });
});
