import { setAdminLocaleAction } from "@/app/actions/admin-locale";
import type { Locale } from "@/lib/i18n/config";
import { getAdminDictionary } from "@/lib/i18n/admin-dictionaries";

type Props = {
  locale: Locale;
};

export function AdminLangSwitcher({ locale }: Props) {
  const t = getAdminDictionary(locale);
  const options: { code: Locale; label: string }[] = [
    { code: "zh", label: t.langZh },
    { code: "en", label: t.langEn },
  ];

  return (
    <div className="flex items-center gap-1 rounded-full border border-neutral-300 bg-white p-0.5 shadow-sm">
      {options.map(({ code, label }) => (
        <form key={code} action={setAdminLocaleAction}>
          <input type="hidden" name="locale" value={code} />
          <button
            type="submit"
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition ${
              code === locale
                ? "bg-neutral-900 text-white"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            {label}
          </button>
        </form>
      ))}
    </div>
  );
}
