'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations, type Dictionary } from '@/i18n';

type TitleKey = keyof Dictionary['meta'];

const BRAND = 'SmartHorse';

/** The `meta` title key for a route — the same pages that declare `metadata.title`. */
export function titleKeyFor(pathname: string): TitleKey | null {
  const parts = pathname.split('/').filter(Boolean);
  const [area, second, third, fourth] = parts;

  switch (area) {
    case 'dashboard': {
      const roles: Record<string, TitleKey> = {
        'farm-owner': 'farmOwnerDashboard',
        'stable-manager': 'stableManagerDashboard',
        trainer: 'trainerDashboard',
        worker: 'workerDashboard',
        doctor: 'doctorDashboard',
      };
      return second ? (roles[second] ?? null) : 'dashboard';
    }
    case 'horses':
      if (!second) return 'horses';
      if (second === 'new') return 'addHorse';
      return third === 'edit' ? 'editHorse' : 'horseProfile';
    case 'medical':
      if (!second) return 'health';
      if (third === undefined) return null;
      if (fourth === 'new') return 'addMedicalRecord';
      if (fourth === 'edit') return 'editMedicalRecord';
      return 'horseMedicalHistory';
    case 'training':
      if (!second) return 'training';
      if (third === undefined) return null;
      if (fourth === 'new') return 'addTrainingSession';
      if (fourth === 'edit') return 'editTrainingSession';
      return 'horseTrainingProfile';
    case 'tasks':
      if (!second) return 'tasks';
      if (second === 'new') return 'addTask';
      return third === 'edit' ? 'editTask' : 'task';
    case 'notifications':
      return 'notifications';
    case 'settings': {
      const sections: Record<string, TitleKey> = {
        farm: 'farmProfile',
        team: 'teamMembers',
        roles: 'roles',
        account: 'account',
      };
      return second ? (sections[second] ?? null) : 'settings';
    }
    case 'login':
      return 'signIn';
    case 'register':
      return 'createAccount';
    case 'forgot-password':
      return 'forgotPassword';
    case 'reset-password':
      return 'resetPassword';
    default:
      return null;
  }
}

/**
 * Keeps the browser-tab title in the active language. Page `metadata` is
 * static and server-rendered in English; in Arabic this replaces it with the
 * same title from the `meta` dictionary (and re-applies it if Next.js
 * restores the English one after a client navigation). Switching back to
 * English restores the English title. Renders nothing.
 */
export function DocumentTitle() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const t = useTranslations();

  useEffect(() => {
    const key = pathname ? titleKeyFor(pathname) : null;
    if (!key) return;
    const wanted = `${t.meta[key]} · ${BRAND}`;
    const apply = () => {
      if (document.title !== wanted) document.title = wanted;
    };
    apply();

    // Only Arabic needs guarding: in English the server metadata already says
    // exactly this.
    if (locale !== 'ar') return;
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { subtree: true, childList: true, characterData: true });
    return () => observer.disconnect();
  }, [pathname, locale, t]);

  return null;
}
