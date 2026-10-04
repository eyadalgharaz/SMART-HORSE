const DEFAULT_STEP = 4;

/**
 * Top of the value axis: the next multiple of `step` strictly above `max`, so
 * the tallest bar always leaves headroom for its value label and the middle
 * gridline lands on a whole number.
 */
export function axisCeiling(max: number, step = DEFAULT_STEP): number {
  return (Math.floor(Math.max(max, 0) / step) + 1) * step;
}

/** Gridline values from the baseline to the ceiling. */
export function axisTicks(ceiling: number): number[] {
  return [0, ceiling / 2, ceiling];
}

/** Bar height as a percentage of the plot area. */
export function barPercent(value: number, ceiling: number): number {
  return ceiling === 0 ? 0 : (value / ceiling) * 100;
}
