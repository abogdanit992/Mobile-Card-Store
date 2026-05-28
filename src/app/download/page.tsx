import Image from "next/image";
import Link from "next/link";
import { MobileShell } from "@/components/mobile-shell";
import { StoreHeader } from "@/components/store-header";
import {
  boxApps,
  DOWNLOAD_HUB_BACKUP,
  DOWNLOAD_HUB_PRIMARY,
  streamingApps,
} from "@/data/platforms";

function DownloadLink({
  href,
  label,
  variant,
}: {
  href: string;
  label: string;
  variant: "primary" | "secondary";
}) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`rounded-lg px-3 py-2 text-center text-xs font-bold ${
        variant === "primary"
          ? "bg-[var(--accent)] text-white"
          : "border border-[var(--border)] text-[var(--muted)] hover:text-white"
      }`}
    >
      {label}
    </a>
  );
}

export default function DownloadPage() {
  return (
    <MobileShell>
      <StoreHeader
        title="软件下载"
        subtitle="聚合盒子 · 直播平台"
        backHref="/"
        backLabel="返回首页"
      />

      <div className="space-y-4 px-3 pt-3">
        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
          <p className="text-xs text-[var(--muted)]">官方聚合下载站</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <DownloadLink href={DOWNLOAD_HUB_PRIMARY} label="主站下载" variant="primary" />
            <DownloadLink href={DOWNLOAD_HUB_BACKUP} label="备用地址" variant="secondary" />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-bold text-white">聚合直播盒子</h2>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            与发卡商品对应，安装后在本站购买卡密激活
          </p>
          <ul className="mt-3 space-y-3">
            {boxApps.map((app) => (
              <li
                key={app.slug}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3"
              >
                <div className="flex gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-black/40">
                    <Image
                      src={app.appLogo}
                      alt={app.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-white">{app.name}</h3>
                    <p className="mt-0.5 text-[10px] text-[var(--muted)]">
                      卡密商品图与分类图标已同步至商城
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <DownloadLink
                        href={app.androidUrl}
                        label="Android"
                        variant="primary"
                      />
                      {app.iosUrl ? (
                        <DownloadLink href={app.iosUrl} label="iOS" variant="secondary" />
                      ) : null}
                      {app.cloudUrl ? (
                        <DownloadLink
                          href={app.cloudUrl}
                          label="网盘/备用"
                          variant="secondary"
                        />
                      ) : null}
                      <Link
                        href={`/?sort=${app.sort}`}
                        className="rounded-lg border border-[var(--accent-soft)] px-3 py-2 text-center text-xs font-bold text-[var(--accent-soft)]"
                      >
                        购买卡密
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-bold text-white">直播平台 App</h2>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            来源 juhe.live，无直链时跳转详情页
          </p>
          <ul className="mt-3 grid grid-cols-2 gap-2">
            {streamingApps.map((app) => (
              <li
                key={app.slug}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-2"
              >
                <div className="relative mx-auto h-12 w-12 overflow-hidden rounded-lg">
                  <Image
                    src={app.logo}
                    alt={app.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                    unoptimized
                  />
                </div>
                <p className="mt-2 line-clamp-1 text-center text-[11px] font-bold text-white">
                  {app.name}
                </p>
                <div className="mt-2 space-y-1">
                  {app.androidUrl ? (
                    <DownloadLink href={app.androidUrl} label="下载" variant="primary" />
                  ) : (
                    <DownloadLink
                      href={app.downloadPage}
                      label="详情页"
                      variant="primary"
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </MobileShell>
  );
}
