import { useLayoutEffect } from "react";

const robotsSelector = 'meta[name="robots"]';

export function useRobotsDirective(content: string | null) {
  useLayoutEffect(() => {
    if (!content) {
      return;
    }

    const head = document.head;
    let meta = head.querySelector<HTMLMetaElement>(robotsSelector);
    const created = meta === null;

    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "robots";
      head.appendChild(meta);
    }

    const previous = meta.content;
    meta.content = content;

    return () => {
      if (created) {
        meta.remove();
        return;
      }

      meta.content = previous;
    };
  }, [content]);
}
