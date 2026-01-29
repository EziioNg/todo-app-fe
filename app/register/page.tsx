'use client';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { TitleAuth } from '@/components/ui/title-auth';

export default function Register() {
  const [userValue, setUserValue] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [passValue, setPassValue] = useState('');

  const registerData = {
    username: userValue,
    email: emailValue,
    password: passValue,
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // console.log('userName: ', userValue);
    // console.log('email: ', emailValue);
    // console.log('passValue: ', passValue);

    if (!userValue.trim() || !emailValue.trim() || !passValue.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue.trim())) {
      toast.error('Invalid email address');
      return;
    }

    if (passValue.trim().length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const result = await fetch('https://api.eziio.site/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const data = await result.json();

      if (!result.ok) {
        toast.error(data.message || 'Something went wrong');
        return;
      }
      toast.success(data.message || 'Register successful');
    } catch (error) {
      console.log('error: ', error);
      toast.error('Cannot connect to server');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center font-sans transition-colors duration-300">
      <div className="flex h-full max-h-150 w-full max-w-4xl flex-col items-center justify-between py-14 px-16 bg-white dark:bg-zinc-900 rounded-4xl shadow-sm dark:shadow-black/40 border border-zinc-200 dark:border-zinc-800 sm:items-start">
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
                  <FieldDescription>
                    Choose a unique username for your account.
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="text"
                    placeholder="fakeEmail123@gmail.com"
                    onChange={(e) => setEmailValue(e.currentTarget.value)}
                  />
                  <FieldDescription>Enter your Email.</FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    placeholder="something..."
                    onChange={(e) => setPassValue(e.currentTarget.value)}
                  />
                  <FieldDescription>
                    Must be at least 6 characters long.
                  </FieldDescription>
                </Field>
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
