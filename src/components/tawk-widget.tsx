"use client";

import Script from "next/script";

/**
 * Loads the Tawk.to live-chat widget (floating bubble).
 * `src` must be the embed URL from the Tawk dashboard:
 *   https://embed.tawk.to/<propertyId>/<widgetId>
 */
export function TawkWidget({ src }: { src: string }) {
  if (!src) return null;

  return (
    <Script id="tawk-to" strategy="afterInteractive">
      {`
        var Tawk_API = Tawk_API || {};
        var Tawk_LoadStart = new Date();
        (function () {
          var s1 = document.createElement("script");
          var s0 = document.getElementsByTagName("script")[0];
          s1.async = true;
          s1.src = ${JSON.stringify(src)};
          s1.charset = "UTF-8";
          s1.setAttribute("crossorigin", "*");
          s0.parentNode.insertBefore(s1, s0);
        })();
      `}
    </Script>
  );
}
