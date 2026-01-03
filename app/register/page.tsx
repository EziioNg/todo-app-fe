'use client';
import Link from 'next/link';

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
import { useState } from 'react';

export default function Register() {
  const [userValue, setUserValue] = useState('');
  const [passValue, setPassValue] = useState('');
  const [passConfirmValue, setPassConfirmValue] = useState('');

  const handleSubmit = () => {
    console.log('userName: ', userValue);
    console.log('passValue: ', passValue);
    console.log('passConfirmValue: ', passConfirmValue);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="w-full max-w-md">
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
              <Field>
                <FieldLabel htmlFor="password">Confirm Password</FieldLabel>
                <FieldDescription>Enter your password again.</FieldDescription>
                <Input
                  id="password2"
                  type="password"
                  placeholder="the same shits..."
                  onChange={(e) => setPassConfirmValue(e.currentTarget.value)}
                />
              </Field>
              <Field orientation="horizontal">
                <Button
                  type="submit"
                  className="cursor-pointer"
                  onClick={handleSubmit}
                >
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
        </div>
      </div>
    </div>
  );
}
