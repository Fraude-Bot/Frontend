/** Reset the document scroll position (SPA navigations do not do this by default). */
export function scrollViewToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}
