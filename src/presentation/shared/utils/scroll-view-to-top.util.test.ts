import { scrollViewToTop } from "@/presentation/shared/utils/scroll-view-to-top.util";

describe("scrollViewToTop", () => {
  it("scrolls the window and resets document scroll offsets", () => {
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});

    document.documentElement.scrollTop = 480;
    document.body.scrollTop = 480;

    scrollViewToTop();

    expect(scrollTo).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: "auto",
    });
    expect(document.documentElement.scrollTop).toBe(0);
    expect(document.body.scrollTop).toBe(0);

    scrollTo.mockRestore();
  });
});
