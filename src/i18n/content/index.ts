import { ar } from '../dictionaries/ar';
import type { Locale } from '../locale';
import { createTranslator, passthrough, type Translator } from '../translate';
import { arContent } from './ar-content';
import { arMessages } from './ar-messages';

/**
 * Source-text translators per locale (see `translate.ts`). English is the
 * source language, so it passes through. Built once and reused.
 *
 * - content: demo data the services return — breeds, colours, people,
 *   record titles, notes — plus the shared 24-horse name map, so one call
 *   localizes any data string a screen displays.
 * - messages: validation and service error messages.
 */
const arabicContent = createTranslator({ exact: ar.horseNames }, arContent);
const arabicMessages = createTranslator(arMessages);

export function getContentTranslator(locale: Locale): Translator {
  return locale === 'ar' ? arabicContent : passthrough;
}

export function getMessageTranslator(locale: Locale): Translator {
  return locale === 'ar' ? arabicMessages : passthrough;
}
