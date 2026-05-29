import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { adminHref } from "@/lib/admin-url";
import { SubmitButton } from "@/components/admin/submit-button";
import { updatePaymentChannelAction } from "./actions";

const inputClass =
  "h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900";

const CONFIG_FIELDS: Record<string, { key: string; label: string; secret?: boolean }[]> = {
  cryptomus: [
    { key: "merchant_id", label: "Merchant ID" },
    { key: "payment_api_key", label: "Payment API Key", secret: true },
  ],
  stripe: [
    { key: "secret_key", label: "Secret Key (sk_...)", secret: true },
    { key: "webhook_secret", label: "Webhook Secret (whsec_...)", secret: true },
  ],
  paypal: [
    { key: "client_id", label: "Client ID" },
    { key: "client_secret", label: "Client Secret", secret: true },
    { key: "mode", label: "Mode (sandbox | live)" },
  ],
};

function getConfigValue(config: unknown, key: string): string {
  if (config && typeof config === "object" && key in config) {
    const v = (config as Record<string, unknown>)[key];
    return typeof v === "string" ? v : "";
  }
  return "";
}

export default async function AdminPaymentsPage() {
  const backHref = await adminHref("/admin");
  const supabase = await createSupabaseServerClient();
  const { data: channels, error } = await supabase
    .from("payment_channels")
    .select("id,provider,label_en,label_zh,enabled,config,sort_order")
    .order("sort_order", { ascending: true });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-neutral-50 px-4 py-6">
      <Link href={backHref} className="text-sm text-neutral-500">
        ← Back to admin
      </Link>
      <h1 className="mt-1 text-2xl font-semibold text-neutral-900">Payment Channels</h1>
      <p className="text-sm text-neutral-500">
        Only enabled channels appear at checkout. Keys are stored server-side.
      </p>

      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error.message}
        </p>
      ) : null}

      <section className="mt-4 space-y-3">
        {channels?.map((ch) => {
          const fields = CONFIG_FIELDS[ch.provider] ?? [];
          return (
            <form
              key={ch.id}
              action={updatePaymentChannelAction}
              className="space-y-2 rounded-2xl border border-neutral-200 bg-white p-4"
            >
              <input type="hidden" name="id" value={ch.id} />
              <input type="hidden" name="provider" value={ch.provider} />
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold uppercase text-neutral-900">
                  {ch.provider}
                </span>
                <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
                  <input
                    type="checkbox"
                    name="enabled"
                    defaultChecked={ch.enabled}
                    className="h-4 w-4"
                  />
                  Enabled
                </label>
              </div>
              <input
                name="label_en"
                defaultValue={ch.label_en}
                placeholder="Label (EN)"
                className={inputClass}
              />
              <input
                name="label_zh"
                defaultValue={ch.label_zh ?? ""}
                placeholder="标签 (中文)"
                className={inputClass}
              />
              {fields.map((f) => (
                <input
                  key={f.key}
                  name={`config_${f.key}`}
                  type={f.secret ? "password" : "text"}
                  defaultValue={getConfigValue(ch.config, f.key)}
                  placeholder={f.label}
                  autoComplete="off"
                  className={inputClass}
                />
              ))}
              <input
                name="sort_order"
                type="number"
                defaultValue={ch.sort_order}
                className={inputClass}
              />
              <SubmitButton
                pendingText="Saving…"
                className="h-10 w-full rounded-lg bg-neutral-900 text-sm font-semibold text-white"
              >
                Save
              </SubmitButton>
            </form>
          );
        })}
      </section>
    </main>
  );
}
