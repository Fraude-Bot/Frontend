import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { scrollViewToTop } from "@/presentation/shared/utils/scroll-view-to-top.util";

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useLayoutEffect(() => {
    scrollViewToTop();
  }, [pathname, search]);

  return null;
}

export default ScrollToTop;
