import { useTranslations } from './locale-provider';

/**
 * Localized display name for a horse in the shared 24-horse demo roster,
 * used by the Dashboard, Horses, Medical, Training and Tasks modules alike.
 * A horse not in the map (added by a reviewer, not part of the seed data)
 * passes through unchanged — this never touches the underlying `Horse.id`
 * or the canonical English `name` a form edits.
 */
export function useHorseName(name: string): string {
  return useTranslations().horseNames[name] ?? name;
}
