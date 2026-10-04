export type Locale = 'en' | 'ar';

export const locales: Locale[] = ['en', 'ar'];

export const defaultLocale: Locale = 'en';

export const STORAGE_KEY = 'smarthorse.locale';

export function directionOf(locale: Locale): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as string[]).includes(value);
}
