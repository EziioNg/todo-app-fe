'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  FieldSet,
  FieldGroup,
  Field,
  FieldLabel,
  FieldDescription,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { TitleAuth } from '@/components/ui/title-auth';

export default function Login() {
  const [userValue, setUserValue] = useState('');
  const [passValue, setPassValue] = useState('');

  const loginData = {
    username: userValue,
    password: passValue,
  };

  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userValue.trim() || !passValue.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const result = await fetch('https://api.eziio.site/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });
      const data = await result.json();
      // console.log('data after login: ', data);

      if (!result.ok) {
        toast.error(data.message || 'Something went wrong');
        return;
      }
      toast.success(data.message || 'Login successful');
      router.push('/todo');
    } catch (error) {
      console.log('error: ', error);
      toast.error('Cannot connect to server');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center font-sans transition-colors duration-300">
      <div className="flex h-full max-h-150 w-full max-w-4xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-zinc-900 rounded-4xl shadow-sm dark:shadow-black/40 border border-zinc-200 dark:border-zinc-800 sm:items-start">
        <div className="mx-auto w-full max-w-md">
          <form onSubmit={handleSubmit}>
            <FieldSet>
              <TitleAuth />
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="username">Username</FieldLabel>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Eziio"
                    onChange={(e) => setUserValue(e.currentTarget.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    placeholder="something..."
                    onChange={(e) => setPassValue(e.currentTarget.value)}
                  />
                </Field>
                <FieldDescription>
                  Hint: UserA/UserB - Password: 123456
                </FieldDescription>
                <Field orientation="horizontal">
                  <Button type="submit" className="cursor-pointer">
                    Submit
                  </Button>
                  <Link href="/">
                    <Button
                      variant="outline"
                      type="button"
                      className="cursor-pointer"
                    >
                      Cancel
                    </Button>
                  </Link>
                </Field>
              </FieldGroup>
            </FieldSet>
          </form>
        </div>
      </div>
    </div>
  );
}
