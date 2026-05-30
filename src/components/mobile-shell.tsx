import type { ReactNode } from "react";
import { BottomNav } from "./bottom-nav";
import { TawkWidget } from "./tawk-widget";
import { AdMarquee } from "./ad-marquee";
import { getSupportSettings, isValidTawkSrc } from "@/lib/support";

type MobileShellProps = {
  children: ReactNode;
  showNav?: boolean;
  showAds?: boolean;
};

export async function MobileShell({
  children,
  showNav = true,
  showAds = true,
}: MobileShellProps) {
  const { tawkSrc } = await getSupportSettings();

  return (
    <div className="store-bg relative mx-auto min-h-screen w-full max-w-md">
      {showAds ? (
        <div className="px-3 pt-3">
          <AdMarquee />
        </div>
      ) : null}
      <div className={showNav ? "pb-24" : ""}>{children}</div>
      {showNav ? <BottomNav /> : null}
      {isValidTawkSrc(tawkSrc) ? <TawkWidget src={tawkSrc} /> : null}
    </div>
  );
}
