'use client';

import { useCallback, useState } from 'react';
import type { ZodType } from 'zod';

type FieldErrors<T> = Partial<Record<keyof T & string, string>>;

/**
 * Minimal Zod-backed form validation: no form library, no global state.
 * Returns parsed values on success and per-field messages on failure.
 */
export function useFormErrors<T extends Record<string, unknown>>(schema: ZodType<T>) {
  const [errors, setErrors] = useState<FieldErrors<T>>({});

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

  return { errors, validate, clear };
}
