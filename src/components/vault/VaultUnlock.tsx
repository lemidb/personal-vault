import React, { useState } from 'react';
import { useVaultContext } from '@/contexts/VaultContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Lock, Unlock, KeyRound, Eye, EyeOff } from 'lucide-react';

export const VaultUnlock: React.FC = () => {
  const { hasVaultAccount, setupVault, unlockVault, isLoading } = useVaultContext();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorDesc, setErrorDesc] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorDesc(null);

    try {
      if (hasVaultAccount) {
        await unlockVault(password);
      } else {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }

        // Complexity requirements
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters long');
        }
        if (!/[a-z]/.test(password)) {
          throw new Error('Password must contain at least one lowercase letter');
        }
        if (!/[A-Z]/.test(password)) {
          throw new Error('Password must contain at least one uppercase letter');
        }
        if (!/\d/.test(password)) {
          throw new Error('Password must contain at least one number');
        }

        await setupVault(password);
      }
    } catch (err: any) {
      setErrorDesc(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[70vh] items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            {hasVaultAccount ? (
              <Lock className="h-8 w-8 text-primary" />
            ) : (
              <KeyRound className="h-8 w-8 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {hasVaultAccount ? 'Unlock Vault' : 'Secure Your Vault'}
          </CardTitle>
          <CardDescription>
            {hasVaultAccount
              ? 'Enter your Vault Password to decrypt your data.'
              : 'Create a strong, memorable Vault Password. If you lose this, your data cannot be recovered.'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {errorDesc && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {errorDesc}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="vault-password">Vault Password</Label>
              <div className="relative">
                <Input
                  id="vault-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  disabled={isSubmitting}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {!hasVaultAccount && (
              <div className="space-y-2">
                <Label htmlFor="vault-password-confirm">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="vault-password-confirm"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password..."
                    disabled={isSubmitting}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isSubmitting || !password}>
              {isSubmitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : hasVaultAccount ? (
                <>
                  <Unlock className="mr-2 h-4 w-4" />
                  Unlock Vault
                </>
              ) : (
                <>
                  <KeyRound className="mr-2 h-4 w-4" />
                  Setup Vault Encryption
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
