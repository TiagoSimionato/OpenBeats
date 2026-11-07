'use client';

import { useChangePassword } from 'frontend/services/api/mutations/user';
import { Button } from 'frontend/ui/Button';
import { Input } from 'frontend/ui/Input';
import { useState } from 'react';

export const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { mutate: changePassword } = useChangePassword({
    options: {
      onSuccess: () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      },
    },
  });

  const doesPasswordsMatch = !!newPassword && !!confirmPassword && confirmPassword === newPassword;
  const canSubmit = !!currentPassword && doesPasswordsMatch;

  const handleSubmit: React.ComponentProps<'form'>['onSubmit'] = (event) => {
    event.preventDefault();
    if (canSubmit)
      changePassword({ currentPassword, newPassword });
  };

  return (
    <form className="flex max-w-xl flex-col gap-4 pt-6" onSubmit={handleSubmit}>
      <h3 className="text-2xl font-bold">Change Password</h3>
      <span className="font-bold">Current password</span>
      <Input
        onChange={e => setCurrentPassword(e.target.value)}
        placeholder="Current password"
        type="password"
        value={currentPassword}
      />
      <span className="font-bold">New password</span>
      <Input
        onChange={e => setNewPassword(e.target.value)}
        placeholder="New password"
        type="password"
        value={newPassword}
      />
      <span className="font-bold">Confirm new password</span>
      <Input
        onChange={e => setConfirmPassword(e.target.value)}
        placeholder="Confirm new password"
        type="password"
        value={confirmPassword}
      />
      {!!newPassword && !!confirmPassword && !doesPasswordsMatch && (
        <span className="text-red-500">Passwords must match</span>
      )}
      <Button disabled={!canSubmit} size="sm" type="submit" variant="secondary">
        Change password
      </Button>
    </form>
  );
};
