'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import axiosInstance from '@/lib/axios';
import { useAuth } from '@/providers/auth-provider';

export default function Login() {
  const [userValue, setUserValue] = useState('');
  const [passValue, setPassValue] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const loginData = {
    username: userValue,
    password: passValue,
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userValue.trim() || !passValue.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const result = await axiosInstance.post('/auth/login', loginData);
      const data = result.data;
      toast.success(data.message || 'Login successful');

      const user = result.data.data;
      login(user);

      const userRole = user.role;
      if (userRole === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/employee/todo');
      }
    } catch (error) {
      console.log(error);
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
                <FieldDescription className="mt-2">
                  <span className="flex flex-col gap-2">
                    <span className="font-medium text-muted-foreground">
                      Demo Accounts
                    </span>

                    <span className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        Admin1
                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] text-red-600">
                          Admin
                        </span>
                      </span>
                      <span className="text-muted-foreground">
                        Password: Aa@123
                      </span>
                    </span>

                    <span className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        Employee1
                        <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-600">
                          Employee
                        </span>
                      </span>
                      <span className="text-muted-foreground">
                        Password: Aa@123
                      </span>
                    </span>
                  </span>
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
