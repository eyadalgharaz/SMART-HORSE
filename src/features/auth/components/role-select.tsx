'use client';

import { useId } from 'react';
import {
  Briefcase,
  CheckCircle2,
  Crown,
  Dumbbell,
  HardHat,
  Stethoscope,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useRoleDescription, useRoleLabel, useTranslations } from '@/i18n';
import { farmRoleValues, type FarmRole } from '../roles';

const roleIcons: Record<FarmRole, LucideIcon> = {
  FarmOwner: Crown,
  StableManager: Briefcase,
  Trainer: Dumbbell,
  Worker: HardHat,
  Doctor: Stethoscope,
};

/**
 * Role picker for registration: a fieldset of selectable cards, one native
 * radio input per role. Native radios (visually a full-card hit target, not
 * a small dot) give this keyboard arrow-key navigation, platform screen
 * reader semantics and `FormData` participation for free — no extra state or
 * wiring beyond what `RegisterForm` already does for its other fields.
 *
 * Selection is shown with a border, a background tint and a check icon
 * together, never colour alone.
 */
export function RoleSelect({
  name = 'farmRole',
  error,
  required,
}: {
  name?: string;
  error?: string;
  required?: boolean;
}) {
  const id = useId();
  const legendId = `${id}-legend`;
  const errorId = `${id}-error`;
  const t = useTranslations();

  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      <legend id={legendId} className="text-ink-soft mb-1.5 text-sm font-medium">
        {t.auth.register.roleLabel}
        {required ? (
          <span className="ms-0.5 text-stone-500" aria-hidden="true">
            *
          </span>
        ) : null}
      </legend>

      <div
        role="radiogroup"
        aria-labelledby={legendId}
        aria-required={required || undefined}
        aria-invalid={Boolean(error) || undefined}
        className="grid grid-cols-1 gap-2 sm:grid-cols-2"
      >
        {farmRoleValues.map((role) => (
          <RoleOption key={role} role={role} name={name} />
        ))}
      </div>

      {error ? (
        <p id={errorId} className="text-danger-700 mt-1.5 text-sm">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

function RoleOption({ role, name }: { role: FarmRole; name: string }) {
  const Icon = roleIcons[role];
  const label = useRoleLabel(role);
  const description = useRoleDescription(role);

  return (
    <label
      className={cn(
        'group relative flex cursor-pointer items-start gap-3 rounded-md border border-stone-300 bg-white p-3',
        'has-checked:border-pasture-500 has-checked:bg-pasture-50 has-checked:ring-pasture-500 has-checked:ring-1',
        'has-[:focus-visible]:outline-pasture-500 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2',
      )}
    >
      <input type="radio" name={name} value={role} className="sr-only" />
      <Icon
        className="text-pasture-600 mt-0.5 size-5 shrink-0"
        aria-hidden="true"
        strokeWidth={1.75}
      />
      <span className="min-w-0">
        <span className="text-ink flex items-center gap-1.5 text-sm font-medium">{label}</span>
        <span className="mt-0.5 block text-xs text-stone-600">{description}</span>
      </span>
      <CheckCircle2
        className="text-pasture-600 absolute end-2 top-2 hidden size-4 group-has-checked:block"
        aria-hidden="true"
      />
    </label>
  );
}
