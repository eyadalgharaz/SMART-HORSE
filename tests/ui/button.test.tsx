import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('blocks interaction and reports busy state while loading', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button loading onClick={onClick}>
        Saving
      </Button>,
    );

    const button = screen.getByRole('button', { name: /saving/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');

    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('defaults to type="button" so it cannot submit a form by accident', () => {
    render(<Button>Cancel</Button>);
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveAttribute('type', 'button');
  });
});
