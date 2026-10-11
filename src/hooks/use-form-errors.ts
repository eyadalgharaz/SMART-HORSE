'use client';

import { useCallback, useMemo, useState } from 'react';
import type { ZodType } from 'zod';
import { useI18n } from '@/i18n/use-i18n';

type FieldErrors<T> = Partial<Record<keyof T & string, string>>;

/**
 * Minimal Zod-backed form validation: no form library, no global state.
 * Returns parsed values on success and per-field messages on failure.
 *
 * Schemas keep their messages in English (the source language). The messages
 * are translated here, at display time, so a visible error switches language
 * along with the rest of the screen and the schemas stay plain, testable data.
 */
export function useFormErrors<T extends Record<string, unknown>>(schema: ZodType<T>) {
  const [rawErrors, setErrors] = useState<FieldErrors<T>>({});
  const { tm } = useI18n();

  const validate = useCallback(
    (values: unknown): T | null => {
      const result = schema.safeParse(values);
      if (result.success) {
        setErrors({});
        return result.data;
      }
      const next: FieldErrors<T> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (typeof key === 'string' && !next[key as keyof T & string]) {
          next[key as keyof T & string] = issue.message;
        }
      }
      setErrors(next);
      return null;
    },
    [schema],
  );

  const clear = useCallback(() => setErrors({}), []);

  const errors = useMemo(() => {
    const translated: FieldErrors<T> = {};
    for (const [key, message] of Object.entries(rawErrors) as [keyof T & string, string][]) {
      translated[key] = tm(message);
    }
    return translated;
  }, [rawErrors, tm]);

  return { errors, validate, clear };
}
