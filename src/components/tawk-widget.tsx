"use client";

import Script from "next/script";

/**
 * Loads the Tawk.to live-chat widget but keeps its default floating launcher
 * hidden, so it never overlaps the bottom navigation. The chat is opened
 * programmatically from the "Support" entry (see SupportLauncher), and is
 * hidden again whenever the visitor minimizes it.
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
        Tawk_API.onLoad = function () { try { Tawk_API.hideWidget(); } catch (e) {} };
        Tawk_API.onChatMinimized = function () { try { Tawk_API.hideWidget(); } catch (e) {} };
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
