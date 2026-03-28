/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { toast } from 'sonner';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import axiosInstance from '@/lib/axios';

export default function VerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<
    'loading' | 'success' | 'error' | 'already_verified' | 'expired'
  >('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setVerificationStatus('error');
        setErrorMessage('No verification token found in URL');
        setIsLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.post(
          '/auth/verify-first-login-token',
          { token },
          {
            skipAuthRefresh: true,
          },
        );
        if (response) {
          const result = response.data;
          // console.log('result: ', result);
          // console.log('verificationToken: ', token);
          // console.log('userEmail: ', result.data.email);

          localStorage.setItem('verificationToken', token);
          localStorage.setItem('userEmail', result.data.email || '');

          setVerificationStatus('success');
          toast.success('Token verified successfully!');
        }

        setTimeout(() => {
          router.push('/auth/update-password');
        }, 2000);
      } catch (error: unknown) {
        console.error('Token verification error:', error);

        // Check if user is already verified
        const axiosError = error as any;
        const errorMessage =
          axiosError.response?.data?.message || axiosError.message || '';
        if (
          errorMessage.includes('already verified!') ||
          errorMessage.includes('already set!')
        ) {
          setVerificationStatus('already_verified');
          setErrorMessage(
            'Your account has already been verified. You can proceed to login.',
          );
          toast.info('Account already verified!');
        } else if (
          errorMessage.includes('expired') ||
          errorMessage.includes('token has expired')
        ) {
          setVerificationStatus('expired');
          setErrorMessage(
            'Your verification link has expired. Please request a new one.',
          );
          toast.error('Verification link has expired!');
        } else {
          setVerificationStatus('error');
          setErrorMessage('Connection error. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center font-sans transition-colors duration-300 p-4">
      <main className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-4xl shadow-sm dark:shadow-black/40 border border-zinc-200 dark:border-zinc-800 p-8">
        <div className="flex justify-end mb-6">
          <Toggle />
        </div>

        <div className="text-center mb-8">
          {verificationStatus === 'loading' && (
            <>
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Verifying Token
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                Please wait while we verify your invitation token...
              </p>
            </>
          )}

          {verificationStatus === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Token Verified!
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                Redirecting you to create your credentials...
              </p>
            </>
          )}

          {verificationStatus === 'expired' && (
            <>
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Link Expired
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">
                {errorMessage}
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/auth/login')}
                  className="w-full"
                  disabled={isLoading}
                >
                  Back to Login
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="w-full"
                  disabled={isLoading}
                >
                  Try Again
                </Button>
              </div>
            </>
          )}

          {verificationStatus === 'already_verified' && (
            <>
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Already Verified
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">
                {errorMessage}
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/auth/login')}
                  className="w-full"
                  disabled={isLoading}
                >
                  Proceed to Login
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="w-full"
                  disabled={isLoading}
                >
                  Try Verification Again
                </Button>
              </div>
            </>
          )}

          {verificationStatus === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Verification Failed
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">
                {errorMessage}
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => window.location.reload()}
                  className="w-full"
                  disabled={isLoading}
                >
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/auth/login')}
                  className="w-full"
                  disabled={isLoading}
                >
                  Back to Login
                </Button>
              </div>
            </>
          )}
        </div>

        {verificationStatus === 'error' && (
          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Lost your invitation email?{' '}
              <button
                onClick={() => router.push('/auth/login')}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Contact your administrator
              </button>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
