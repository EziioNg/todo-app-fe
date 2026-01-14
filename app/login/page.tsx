'use client';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { FieldSet, FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { TitleAuth } from '@/components/ui/title-auth';
import { useRouter } from 'next/navigation';

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
    try {
      const result = await fetch('http://localhost:3305/auth/login', {
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
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="w-full max-w-md">
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
                    placeholder="some shits..."
                    onChange={(e) => setPassValue(e.currentTarget.value)}
                  />
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
