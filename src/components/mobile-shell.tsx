import type { ReactNode } from "react";
import { BottomNav } from "./bottom-nav";
import { TawkWidget } from "./tawk-widget";
import { getSupportSettings, isValidTawkSrc } from "@/lib/support";

type MobileShellProps = {
  children: ReactNode;
  showNav?: boolean;
};

export async function MobileShell({ children, showNav = true }: MobileShellProps) {
  const { tawkSrc } = await getSupportSettings();

  return (
    <div className="store-bg relative mx-auto min-h-screen w-full max-w-md">
      <div className={showNav ? "pb-24" : ""}>{children}</div>
      {showNav ? <BottomNav /> : null}
      {isValidTawkSrc(tawkSrc) ? <TawkWidget src={tawkSrc} /> : null}
    </div>
  );
}
