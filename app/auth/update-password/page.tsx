'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toggle } from '@/components/ui/toggle';
import { toast } from 'sonner';
import { Eye, EyeOff, Key, User, CheckCircle, AlertCircle } from 'lucide-react';
import axiosInstance from '@/lib/axios';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<
    'weak' | 'medium' | 'strong' | null
  >(null);

  useEffect(() => {
    const token = localStorage.getItem('verificationToken');
    const userEmail = localStorage.getItem('userEmail');

    if (!token || !userEmail) {
      toast.error('Please verify your credentials first');
      router.push('/auth/verification-first-login');
      return;
    }

    setEmail(userEmail);
  }, [router]);

  const checkPasswordStrength = (password: string) => {
    if (password.length < 6) return 'weak';
    if (password.length < 10) return 'medium';
    if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return 'strong';
    return 'medium';
  };

  useEffect(() => {
    if (newPassword) {
      setPasswordStrength(checkPasswordStrength(newPassword));
    } else {
      setPasswordStrength(null);
    }
  }, [newPassword]);

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'strong':
        return 'text-green-500';
      default:
        return 'text-zinc-400';
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 'weak':
        return 'Weak password';
      case 'medium':
        return 'Medium strength';
      case 'strong':
        return 'Strong password';
      default:
        return '';
    }
  };

  const validateForm = () => {
    if (!username.trim()) {
      toast.error('Please enter a username');
      return false;
    }

    if (username.trim().length < 3) {
      toast.error('Username must be at least 3 characters long');
      return false;
    }

    if (!newPassword) {
      toast.error('Please enter a new password');
      return false;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const token = localStorage.getItem('verificationToken');

      const response = await axiosInstance.post('/auth/update-password', {
        token,
        user_email: email,
        new_username: username.trim(),
        new_password: newPassword,
      });

      if (response) {
        toast.success(
          'Credentials updated successfully! You can now login with your new credentials.',
        );
        localStorage.removeItem('verificationToken');
        localStorage.removeItem('userEmail');
      }

      router.push('/auth/login');
    } catch (error) {
      console.error('Update password error:', error);
      toast.error('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center font-sans transition-colors duration-300 p-4">
      <main className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-4xl shadow-sm dark:shadow-black/40 border border-zinc-200 dark:border-zinc-800 p-8">
        <div className="flex justify-end mb-6">
          <Toggle />
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Set New Credentials
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            Create your username and password for future logins
          </p>
          <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Email: {email}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="flex items-center gap-2">
              <User size={16} />
              Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full"
              minLength={3}
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Must be at least 3 characters long
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="flex items-center gap-2">
              <Key size={16} />
              New Password
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full pr-10"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordStrength && (
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      passwordStrength === 'weak'
                        ? 'w-1/3 bg-red-500'
                        : passwordStrength === 'medium'
                          ? 'w-2/3 bg-yellow-500'
                          : 'w-full bg-green-500'
                    }`}
                  />
                </div>
                <span className={`text-xs ${getPasswordStrengthColor()}`}>
                  {getPasswordStrengthText()}
                </span>
              </div>
            )}
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Must be at least 6 characters long
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="flex items-center gap-2"
            >
              <CheckCircle size={16} />
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pr-10"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <div className="flex items-center gap-2 text-red-500 text-xs">
                <AlertCircle size={12} />
                Passwords do not match
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={
              isLoading ||
              (confirmPassword.length > 0 && newPassword !== confirmPassword)
            }
          >
            {isLoading ? 'Updating...' : 'Update Credentials'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            After updating, you can login with your new username and password
          </p>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => router.push('/auth/verification-first-login')}
            className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            ← Back to Verification
          </button>
        </div>
      </main>
    </div>
  );
}
