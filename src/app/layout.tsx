import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: { default: 'SmartHorse', template: '%s · SmartHorse' },
  description: 'Stable and farm management with a trusted digital identity for every horse.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

/**
 * Applies a saved Arabic preference to `<html lang dir>` before the first
 * paint, so an Arabic reader never sees the layout flip from LTR to RTL on
 * load or refresh. The React `LocaleProvider` takes over right after
 * hydration and keeps the attributes in sync from then on. Mirrors
 * `STORAGE_KEY` in `src/i18n/locale.ts`.
 */
const applySavedDirection = `try{if(localStorage.getItem('smarthorse.locale')==='ar'){var d=document.documentElement;d.lang='ar';d.dir='rtl';}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The pre-paint script may set lang/dir before React hydrates.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: applySavedDirection }} />
      </head>
      <body className="min-h-dvh">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
