import type { HorseGender, HorseStatus } from './types';

/**
 * One place for the words the Horses module uses on screen. Filters, tables,
 * profiles and forms all read from here, so a label never drifts between two
 * screens. Copy is English-only for now; a later i18n pass replaces this file.
 */

export const genderLabels: Record<HorseGender, string> = {
  mare: 'Mare',
  stallion: 'Stallion',
  gelding: 'Gelding',
  filly: 'Filly',
  colt: 'Colt',
};

export const genderOptions = Object.entries(genderLabels).map(([value, label]) => ({
  value: value as HorseGender,
  label,
}));

type StatusTone = 'pasture' | 'warning' | 'neutral' | 'success';

/** Each status carries a word, so colour is never the only signal. */
export const statuses: Record<HorseStatus, { label: string; tone: StatusTone }> = {
  active: { label: 'Active', tone: 'pasture' },
  'in-training': { label: 'In training', tone: 'warning' },
  resting: { label: 'Resting', tone: 'neutral' },
  sold: { label: 'Sold', tone: 'success' },
};

export const statusOptions = Object.entries(statuses).map(([value, { label }]) => ({
  value: value as HorseStatus,
  label,
}));

/**
 * Breeds offered in the Add and Edit forms. The filter list is derived from the
 * horses actually on file instead, so it never offers a breed with no matches.
 */
export const breedOptions = [
  'Akhal-Teke',
  'Andalusian',
  'Appaloosa',
  'Arabian',
  'Connemara',
  'Friesian',
  'Hanoverian',
  'Holsteiner',
  'Lusitano',
  'Quarter Horse',
  'Shire',
  'Standardbred',
  'Thoroughbred',
  'Trakehner',
  'Welsh Pony',
];

/** Shown wherever an optional record has never been filled in. */
export const NOT_PROVIDED = 'Not provided';
