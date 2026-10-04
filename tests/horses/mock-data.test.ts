import { describe, expect, it } from 'vitest';
import { buildHorseMocks } from '@/features/horses/mock/horse-mock-data';

describe('buildHorseMocks', () => {
  const horses = buildHorseMocks();

  it('produces a realistic, varied dataset large enough to review filters and scrolling', () => {
    expect(horses.length).toBeGreaterThanOrEqual(20);
    expect(new Set(horses.map((h) => h.id)).size).toBe(horses.length);
    expect(new Set(horses.map((h) => h.name)).size).toBe(horses.length);
  });

  it('does not use placeholder names', () => {
    expect(horses.some((h) => /^horse\s*\d+$/i.test(h.name))).toBe(false);
  });

  it('covers every status and every gender at least once', () => {
    const statuses = new Set(horses.map((h) => h.status));
    const genders = new Set(horses.map((h) => h.gender));
    expect(statuses).toEqual(new Set(['active', 'in-training', 'resting', 'sold']));
    expect(genders).toEqual(new Set(['mare', 'stallion', 'gelding', 'filly', 'colt']));
  });

  it('includes horses missing optional information, for the "Not provided" path', () => {
    expect(horses.some((h) => h.registrationNumber === null)).toBe(true);
    expect(horses.some((h) => h.microchipNumber === null)).toBe(true);
    expect(horses.some((h) => h.imageUrl === null)).toBe(true);
    expect(horses.some((h) => h.owner === null)).toBe(true);
  });

  it('never has a birth date in the future', () => {
    const now = Date.now();
    expect(horses.every((h) => new Date(h.birthDate).getTime() <= now)).toBe(true);
  });
});
