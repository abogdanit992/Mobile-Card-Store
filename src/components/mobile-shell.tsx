import type { ReactNode } from "react";
import { BottomNav } from "./bottom-nav";

type MobileShellProps = {
  children: ReactNode;
  showNav?: boolean;
};

export function MobileShell({ children, showNav = true }: MobileShellProps) {
  return (
    <div className="store-bg relative mx-auto min-h-screen w-full max-w-md">
      <div className={showNav ? "pb-24" : ""}>{children}</div>
      {showNav ? <BottomNav /> : null}
    </div>
  );
}
