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
    console.log('userName: ', userValue);
    console.log('email: ', emailValue);
    console.log('passValue: ', passValue);
    try {
      const result = await fetch('http://localhost:3305/auth/register', {
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
                  <FieldDescription>
                    Choose a unique username for your account.
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="text"
                    placeholder="Eziio@gmail.com"
                    onChange={(e) => setEmailValue(e.currentTarget.value)}
                  />
                  <FieldDescription>Enter your Email.</FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <FieldDescription>
                    Must be at least 8 characters long.
                  </FieldDescription>
                  <Input
                    id="password1"
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
