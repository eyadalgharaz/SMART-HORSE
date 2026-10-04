'use client';

import { useMutation } from '@tanstack/react-query';
import { accountService } from '../account-service';
import type { ChangePasswordInput } from '../types';

/** No query to invalidate — a password is never displayed anywhere. */
export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) => accountService.changePassword(input),
  });
}
