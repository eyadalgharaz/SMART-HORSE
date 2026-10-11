'use client';

import { useMemo } from 'react';
import { getContentTranslator, getMessageTranslator } from './content';
import { useLocale, useTranslations } from './locale-provider';

/**
 * Everything a component needs to render in the active language, in one call:
 *
 * - `t`       the typed UI dictionary (labels, headings, sentences)
 * - `locale`  for the shared formatters in `@/i18n/format`
 * - `dir`     'ltr' | 'rtl', for the rare control that must know (tab arrows)
 * - `tc`      localizes a data string (a breed, a person, a record title…);
 *             anything without a translation — e.g. text a person typed —
 *             is returned exactly as entered
 * - `tm`      localizes a system message (validation / service errors)
 */
export function useI18n() {
  const { locale, dir } = useLocale();
  const t = useTranslations();
  return useMemo(
    () => ({
      t,
      locale,
      dir,
      tc: getContentTranslator(locale),
      tm: getMessageTranslator(locale),
    }),
    [t, locale, dir],
  );
}
