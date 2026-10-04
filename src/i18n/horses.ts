import { useTranslations } from './locale-provider';
import type { Dictionary } from './dictionaries/en';

type GenderKey = keyof Dictionary['horses']['genderLabels'];
type StatusKey = keyof Dictionary['horses']['statusLabels'];

export function useGenderLabel(gender: GenderKey): string {
  return useTranslations().horses.genderLabels[gender];
}

export function useGenderOptions(): { value: GenderKey; label: string }[] {
  const { horses } = useTranslations();
  return (Object.keys(horses.genderLabels) as GenderKey[]).map((value) => ({
    value,
    label: horses.genderLabels[value],
  }));
}

export function useHorseStatusLabel(status: StatusKey): string {
  return useTranslations().horses.statusLabels[status];
}

export function useNotProvided(): string {
  return useTranslations().horses.notProvided;
}

export function useStatusOptions(): { value: StatusKey; label: string }[] {
  const { horses } = useTranslations();
  return (Object.keys(horses.statusLabels) as StatusKey[]).map((value) => ({
    value,
    label: horses.statusLabels[value],
  }));
}
