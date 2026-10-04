import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';

describe('FormField', () => {
  it('associates the label with the control', () => {
    render(
      <FormField label="Email">
        <Input name="email" />
      </FormField>,
    );
    expect(screen.getByLabelText('Email')).toHaveAttribute('name', 'email');
  });

  it('announces errors through text, not colour alone', () => {
    render(
      <FormField label="Email" error="Enter a valid email address.">
        <Input name="email" />
      </FormField>,
    );

    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Enter a valid email address.');
  });
});
