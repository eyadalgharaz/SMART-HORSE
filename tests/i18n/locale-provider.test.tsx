import { afterEach, describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocaleProvider, useLocale, useTranslations } from '@/i18n';
import { STORAGE_KEY } from '@/i18n/locale';

function Probe() {
  const { locale, setLocale, dir } = useLocale();
  const t = useTranslations();
  return (
    <div>
      <p data-testid="locale">{locale}</p>
      <p data-testid="dir">{dir}</p>
      <p data-testid="label">{t.shell.nav.dashboard}</p>
      <button onClick={() => setLocale('ar')}>go-ar</button>
      <button onClick={() => setLocale('en')}>go-en</button>
    </div>
  );
}

describe('LocaleProvider', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('defaults to English/LTR with no saved preference', async () => {
    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>,
    );

    expect(await screen.findByTestId('locale')).toHaveTextContent('en');
    expect(screen.getByTestId('dir')).toHaveTextContent('ltr');
    expect(screen.getByTestId('label')).toHaveTextContent('Dashboard');
    expect(document.documentElement.dir).toBe('ltr');
  });

  it('switches to Arabic, sets RTL on <html>, and translates via the dictionary', async () => {
    const user = userEvent.setup();
    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>,
    );

    await user.click(screen.getByText('go-ar'));

    expect(screen.getByTestId('locale')).toHaveTextContent('ar');
    expect(screen.getByTestId('dir')).toHaveTextContent('rtl');
    expect(screen.getByTestId('label')).toHaveTextContent('لوحة التحكم');
    await waitFor(() => expect(document.documentElement.dir).toBe('rtl'));
    expect(document.documentElement.lang).toBe('ar');
  });

  it('switching back to English restores LTR', async () => {
    const user = userEvent.setup();
    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>,
    );

    await user.click(screen.getByText('go-ar'));
    await user.click(screen.getByText('go-en'));

    expect(screen.getByTestId('dir')).toHaveTextContent('ltr');
    await waitFor(() => expect(document.documentElement.dir).toBe('ltr'));
  });

  it('persists the selected language to localStorage', async () => {
    const user = userEvent.setup();
    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>,
    );

    await user.click(screen.getByText('go-ar'));

    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('ar');
  });

  it('reads a saved language back on the next mount — survives "refresh"', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'ar');

    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>,
    );

    expect(await screen.findByTestId('locale')).toHaveTextContent('ar');
    expect(screen.getByTestId('label')).toHaveTextContent('لوحة التحكم');
  });

  it('ignores an invalid stored value and falls back to English', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'fr');

    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>,
    );

    expect(await screen.findByTestId('locale')).toHaveTextContent('en');
  });
});
