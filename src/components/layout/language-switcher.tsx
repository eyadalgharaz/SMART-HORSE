'use client';

import { cn } from '@/lib/cn';
import { useLocale, useTranslations, locales, type Locale } from '@/i18n';

const NATIVE_SHORT: Record<Locale, string> = { en: 'EN', ar: 'العربية' };

/**
 * Two-way toggle, not a dropdown — there are only ever two languages, and a
 * visible always-on control is one tap instead of two. Selection is shown by
 * a filled background AND bold text together, never colour alone.
 */
export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const t = useTranslations();

  return (
    <div
      role="group"
      aria-label={t.language.switcherLabel}
      className="flex items-center gap-0.5 rounded-md border border-stone-200 p-0.5"
    >
      {locales.map((code) => {
        const active = code === locale;
        const name = code === 'en' ? t.language.english : t.language.arabic;
        return (
          <button
            key={code}
            type="button"
            aria-pressed={active}
            aria-label={active ? name : t.language.switchTo(name)}
            onClick={() => setLocale(code)}
            className={cn(
              'rounded px-2 py-1 text-xs transition-colors',
              active
                ? 'bg-ink font-semibold text-white'
                : 'text-ink-soft font-medium hover:bg-stone-100',
            )}
          >
            {NATIVE_SHORT[code]}
          </button>
        );
      })}
    </div>
  );
}
