/**
 * Translation of *source text* — words that arrive as data rather than being
 * written into a component: demo/seed content from the mock services
 * (horse breeds, record titles, notes, people's names), and system messages
 * such as validation errors or a service's error text.
 *
 * The interface itself is translated through the typed dictionaries
 * (`dictionaries/en.ts` / `ar.ts`); this is the complement for text the UI
 * only displays. English is the source language, so English needs no table
 * and text passes through untouched. Anything without a translation — most
 * importantly, anything a person typed in themselves — is shown exactly as
 * entered, never altered or guessed at.
 *
 * A table has exact entries plus optional patterns for text a service
 * composes at runtime (e.g. "Follow-up: <record title>"). A pattern's
 * captured parts are translated recursively, so composed text is fully
 * localized whenever its parts are known.
 */

export interface TranslationPattern {
  pattern: RegExp;
  render: (match: RegExpMatchArray, translate: (text: string) => string) => string;
}

export interface TranslationTable {
  exact: Record<string, string>;
  patterns?: TranslationPattern[];
}

export type Translator = (text: string) => string;

/** Identity translator — English, the source language. */
export const passthrough: Translator = (text) => text;

/** Normalises the typographic variations seed data mixes freely, so a key matches either way. */
function normalise(text: string): string {
  return text.replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim();
}

export function createTranslator(...tables: TranslationTable[]): Translator {
  const exact = new Map<string, string>();
  for (const table of tables) {
    for (const [source, target] of Object.entries(table.exact))
      exact.set(normalise(source), target);
  }
  const patterns = tables.flatMap((table) => table.patterns ?? []);

  const translate: Translator = (text) => {
    if (!text) return text;
    const key = normalise(text);
    const hit = exact.get(key);
    if (hit !== undefined) return hit;
    for (const { pattern, render } of patterns) {
      const match = key.match(pattern);
      if (match) return render(match, translate);
    }
    return text;
  };

  return translate;
}

/**
 * Edit forms show stored demo text in the active language (so an Arabic
 * reader edits Arabic), but saving an *unchanged* field must not overwrite the
 * stored source text with its translation. Given what the form submitted and
 * what was stored, this returns the stored value when the person left the
 * displayed translation as it was, and their own text otherwise.
 */
export function restoreSource(
  submitted: string,
  stored: string | null | undefined,
  translate: Translator,
): string {
  if (stored && submitted.trim() === translate(stored).trim()) return stored;
  return submitted;
}
