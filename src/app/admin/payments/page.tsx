import { createSupabaseServerClient } from "@/lib/supabase/server";
import { adminHref } from "@/lib/admin-url";
import { ActionForm } from "@/components/admin/action-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getAdminTranslations } from "@/lib/i18n/admin-server";
import { updatePaymentChannelAction } from "./actions";
import { adminInputClass as inputClass } from "@/lib/admin/form-styles";

const CONFIG_FIELDS: Record<string, { key: string; label: string; secret?: boolean }[]> = {
  cryptomus: [
    { key: "merchant_id", label: "Merchant ID" },
    { key: "payment_api_key", label: "Payment API Key", secret: true },
  ],
  nowpayments: [
    { key: "api_key", label: "API Key", secret: true },
    { key: "ipn_secret", label: "IPN Secret Key", secret: true },
  ],
  stripe: [
    { key: "secret_key", label: "Secret Key (sk_…)", secret: true },
    { key: "webhook_secret", label: "Webhook Secret (whsec_…)", secret: true },
    { key: "publishable_key", label: "Publishable Key (pk_…, optional)" },
  ],
  wechat: [
    { key: "mid", label: "商户号 mid" },
    { key: "merchant_secret", label: "商户秘钥", secret: true },
    {
      key: "api_base_url",
      label: "API 网关地址（默认 itxt002 域名，含 http://）",
    },
    { key: "channel_code", label: "微信通道编码 channelCode（向客服索取）" },
    {
      key: "exchange_rate",
      label: "USD→CNY 汇率（可选；留空则商品价按人民币元提交）",
    },
    {
      key: "callback_ips",
      label: "回调来源 IP（逗号分隔，留空不校验）",
    },
  ],
  alipay: [
    { key: "mid", label: "商户号 mid" },
    { key: "merchant_secret", label: "商户秘钥", secret: true },
    {
      key: "api_base_url",
      label: "API 网关地址（默认 itxt002 域名，含 http://）",
    },
    { key: "channel_code", label: "支付宝通道编码 channelCode（向客服索取）" },
    {
      key: "exchange_rate",
      label: "USD→CNY 汇率（可选；留空则商品价按人民币元提交）",
    },
    {
      key: "callback_ips",
      label: "回调来源 IP（逗号分隔，留空不校验）",
    },
  ],
  paypal_personal: [
    { key: "client_id", label: "Client ID (REST app)" },
    { key: "client_secret", label: "Client Secret", secret: true },
    { key: "mode", label: "Mode (sandbox | live)" },
    { key: "account_email", label: "Personal PayPal login email" },
  ],
  paypal_business: [
    { key: "client_id", label: "Client ID (REST app)" },
    { key: "client_secret", label: "Client Secret", secret: true },
    { key: "mode", label: "Mode (sandbox | live)" },
    { key: "business_email", label: "Business account email" },
    { key: "webhook_id", label: "Webhook ID (optional)" },
  ],
  paypal: [
    { key: "client_id", label: "Client ID (legacy — migrate to paypal_business)" },
    { key: "client_secret", label: "Client Secret", secret: true },
    { key: "mode", label: "Mode (sandbox | live)" },
  ],
  direct_usdt: [
    { key: "wallet_address", label: "TRC20 wallet address (T…)" },
    { key: "tron_api_key", label: "TronGrid API key (optional)", secret: true },
    {
      key: "usdt_contract",
      label: "USDT contract (leave empty = official TRC20 USDT)",
    },
    { key: "expire_minutes", label: "Order expiry (minutes, default 30)" },
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
  const { locale, t } = await getAdminTranslations();
  const backHref = await adminHref("/admin");
  const supabase = await createSupabaseServerClient();
  const { data: channels, error } = await supabase
    .from("payment_channels")
    .select("id,provider,label_en,label_zh,enabled,config,sort_order")
    .order("sort_order", { ascending: true });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-neutral-50 px-4 py-6">
      <AdminPageHeader
        locale={locale}
        backHref={backHref}
        backLabel={t.backToAdmin}
        title={t.paymentsTitle}
        subtitle={t.paymentsSubtitle}
      />

      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {t.loadFailed}: {error.message}
        </p>
      ) : null}

      <section className="mt-4 space-y-3">
        {channels?.map((ch) => {
          const fields = CONFIG_FIELDS[ch.provider] ?? [];
          return (
            <ActionForm
              key={ch.id}
              action={updatePaymentChannelAction}
              className="space-y-2 rounded-2xl border border-neutral-200 bg-white p-4"
              buttonClassName="h-10 w-full rounded-lg bg-neutral-900 text-sm font-semibold text-white"
              submitLabel={t.save}
              pendingLabel={t.saving}
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
                  {t.enabled}
                </label>
              </div>
              <label className="mb-1 block text-xs font-semibold text-neutral-700">
                {t.labelEn}
              </label>
              <input
                name="label_en"
                defaultValue={ch.label_en}
                placeholder={t.labelEn}
                className={inputClass}
              />
              <label className="mb-1 block text-xs font-semibold text-neutral-700">
                {t.labelZh}
              </label>
              <input
                name="label_zh"
                defaultValue={ch.label_zh ?? ""}
                placeholder={t.labelZh}
                className={inputClass}
              />
              {fields.map((f) => (
                <div key={f.key}>
                  <label className="mb-1 block text-xs font-semibold text-neutral-700">
                    {f.label}
                  </label>
                  <input
                    name={`config_${f.key}`}
                    type={f.secret ? "password" : "text"}
                    defaultValue={getConfigValue(ch.config, f.key)}
                    placeholder={f.label}
                    autoComplete="off"
                    className={inputClass}
                  />
                </div>
              ))}
              <label className="mb-1 block text-xs font-semibold text-neutral-700">
                {t.sortOrder}
              </label>
              <input
                name="sort_order"
                type="number"
                defaultValue={ch.sort_order}
                placeholder={t.sortOrder}
                className={inputClass}
              />
            </ActionForm>
          );
        })}
      </section>
    </main>
  );
}
