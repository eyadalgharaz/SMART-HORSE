import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { renderWithProviders, screen } from '../test-utils';

describe('LanguageSwitcher', () => {
  it('is an accessible, keyboard-usable group with two language buttons', async () => {
    renderWithProviders(<LanguageSwitcher />);

    const group = screen.getByRole('group', { name: 'Language' });
    const english = screen.getByRole('button', { name: 'English' });
    const arabic = screen.getByRole('button', { name: /Switch to العربية/ });

    expect(group).toBeInTheDocument();
    expect(english).toHaveAttribute('aria-pressed', 'true');
    expect(arabic).toHaveAttribute('aria-pressed', 'false');
  });

  it('switches language on click and updates which button is marked current — not by colour alone', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LanguageSwitcher />);

    await user.click(screen.getByRole('button', { name: /Switch to العربية/ }));

    // aria-pressed (assistive tech) and the visible fill/weight both flip —
    // not a visual-only cue. The switcher's own copy ("Switch to …") now
    // reads in Arabic too, since it follows the locale it just set.
    const arabicButton = screen.getByRole('button', { name: 'العربية' });
    const englishButton = screen.getByText('EN').closest('button')!;
    expect(arabicButton).toHaveAttribute('aria-pressed', 'true');
    expect(englishButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('is reachable and operable by keyboard', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LanguageSwitcher />);

    await user.tab();
    expect(screen.getByRole('button', { name: 'English' })).toHaveFocus();

    await user.tab();
    const arabicButton = screen.getByRole('button', { name: /Switch to العربية/ });
    expect(arabicButton).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: 'العربية' })).toHaveAttribute('aria-pressed', 'true');
  });
});
