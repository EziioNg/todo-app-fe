/* eslint-disable react-hooks/set-state-in-effect */
'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { motion, Reorder } from 'framer-motion';
import { toast } from 'sonner';

import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { Field } from '@/components/ui/field';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';

export default function Page() {
  type Todo = {
    id: number;
    title: string;
    completed: boolean;
  };

  const [inputTitle, setInputTitle] = useState('');
  const [todoList, setTodoList] = useState<Todo[]>([]);

  const fetchTodos = async () => {
    const res = await fetch('https://api.eziio.site/todos', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!res.ok) {
      console.error('Fetch todos failed');
      return;
    }

    const result = await res.json();
    setTodoList(result.data);
  };

  const { user, loading, logout } = useAuth();
  // const userName = user?.username;
  // console.log('userName: ', userName);
  useEffect(() => {
    if (loading) return;
    if (!user) {
      toast.message('You are not logged in');
      return;
    }
    // console.log('loading:', loading);
    // console.log('user:', user);
    fetchTodos();
  }, [loading, user]);

  const handleSubmit = async () => {
    if (!inputTitle.trim()) return;
    if (!user) {
      toast.error('You have to login first to perform this action');
      return;
    }
    try {
      const result = await fetch('https://api.eziio.site/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: inputTitle,
        }),
      });

      if (!result.ok) {
        toast.error('Create todo failed');
        return;
      }
      toast.success('Todo created successfully');

      const createdTodo = await result.json();
      // console.log('todo created: ', createdTodo);
      // console.log('todo list: ', todoList);

      setTodoList((prev) => [...prev, createdTodo.data]);
      setInputTitle('');
    } catch (error) {
      console.log('error: ', error);
      toast.error('Cannot connect to server');
    }
  };

  const handleChecked = async (id: number, completed: boolean) => {
    if (!user) {
      toast.error('You have to login first to perform this action');
      return;
    }

    setTodoList((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !completed } : todo,
      ),
    );

    try {
      const result = await fetch(`https://api.eziio.site/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          completed: !completed,
        }),
      });

      if (!result.ok) {
        toast.error('Update todo failed');
        return;
      }
      toast.success('Todo updated successfully');
    } catch (error) {
      setTodoList((prev) =>
        prev.map((todo) => (todo.id === id ? { ...todo, completed } : todo)),
      );
      console.log('error: ', error);
      toast.error('Cannot connect to server');
    }
  };

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const handleUpdateTitle = async (id: number) => {
    if (!editingValue.trim()) return;
    if (!user) {
      toast.error('Please login first before attempting this action');
      return;
    }

    try {
      const result = await fetch(`https://api.eziio.site/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: editingValue,
        }),
      });

      if (!result.ok) {
        toast.error('Update todo failed');
        return;
      }

      const updatedTodo = await result.json();
      // console.log('updatedTodo: ', updatedTodo);
      setTodoList((prev) =>
        prev.map((todo) =>
          todo.id === id ? { ...todo, title: updatedTodo.data.title } : todo,
        ),
      );

      setEditingId(null);
      setEditingValue('');
      toast.success('Todo updated successfully');
    } catch (error) {
      console.log('error: ', error);
      toast.error('Cannot connect to server');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue('');
  };

  const handleDelete = async (id: number) => {
    if (!user) {
      toast.error('You have to login first to perform this action');
      return;
    }

    try {
      const result = await fetch(`https://api.eziio.site/todos/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!result.ok) {
        toast.error('Delete todo failed');
        return;
      }

      setTodoList((prev) => prev.filter((todo) => todo.id !== id));
      toast.success('Todo deleted successfully');
    } catch (error) {
      console.log('error: ', error);
      toast.error('Cannot connect to server');
    }
  };

  const router = useRouter();
  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logout successful');
      router.push('/login');
    } catch {
      toast.error('Logout failed');
    }
  };

  return (
    <div className="flex min-h-screen h-screen items-center justify-center font-sans transition-colors duration-300">
      <main className="flex flex-col gap-4 overflow-y-auto h-full max-h-150 w-full max-w-4xl items-center py-16 px-50 bg-white dark:bg-zinc-900 rounded-4xl shadow-sm dark:shadow-black/40 border border-zinc-200 dark:border-zinc-800">
        <div className="w-full flex flex-row justify-between scroll-m-20 pb-2 text-3xl font-bold tracking-tight first:mt-0">
          {user ? (
            <h1>{user?.username} Tasks: </h1>
          ) : (
            <h1>Your Tasks will be listed here</h1>
          )}
          <Toggle />
        </div>
        <div className="flex flex-row gap-2 w-full">
          <Input
            type="text"
            placeholder="Add new task"
            value={inputTitle}
            onChange={(e) => setInputTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
          />
          <Button
            asChild
            variant="outline"
            size="icon"
            aria-label="Submit"
            className="cursor-pointer"
          >
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.8 }}
              onClick={handleSubmit}
            >
              <Plus />
            </motion.button>
          </Button>
        </div>
        <Reorder.Group
          axis="y"
          values={todoList}
          onReorder={setTodoList}
          layoutScroll
          className="w-full flex flex-col gap-2"
        >
          {!user ? (
            <p className="text-muted-foreground text-center">
              Please login first before creating tasks!
            </p>
          ) : todoList.length === 0 ? (
            <p className="text-muted-foreground text-center">
              You don’t have any tasks...
            </p>
          ) : (
            todoList.map((todo) => {
              return (
                <Reorder.Item
                  key={todo.id}
                  value={todo}
                  whileDrag={{ scale: 1 }}
                  layout="position"
                  className="w-full box-border"
                >
                  <div className="w-full hover:bg-accent/50 flex gap-3 items-center justify-between rounded-[14px] border p-2.5 cursor-grab">
                    <div className="flex flex-row w-full items-center gap-2">
                      <motion.div
                        animate={{ scale: todo.completed ? 1.1 : 1 }}
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 20,
                        }}
                        className="cursor-pointer"
                      >
                        <Checkbox
                          id="toggle-2"
                          checked={todo.completed}
                          onCheckedChange={() =>
                            handleChecked(todo.id, todo.completed)
                          }
                          className="data-[state=checked]:border-gray-600 data-[state=checked]:bg-gray-600 data-[state=checked]:text-white dark:data-[state=checked]:border-gray-700 dark:data-[state=checked]:bg-gray-700 cursor-pointer"
                        />
                      </motion.div>
                      <motion.div
                        className="grid gap-1.5 font-normal cursor-pointer"
                        animate={{
                          opacity: todo.completed ? 0.6 : 1,
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        {editingId === todo.id ? (
                          <Input
                            autoFocus
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={() => handleUpdateTitle(todo.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleUpdateTitle(todo.id);
                              if (e.key === 'Escape') cancelEdit();
                            }}
                            className="h-7 px-2 text-sm"
                          />
                        ) : (
                          <motion.p
                            onClick={() => {
                              setEditingId(todo.id);
                              setEditingValue(todo.title);
                            }}
                            className="relative inline-flex w-fit text-sm font-medium cursor-text"
                            animate={{ opacity: todo.completed ? 0.6 : 1 }}
                          >
                            {todo.title}
                            <motion.span
                              className="absolute left-0 top-1/2 h-0.5 w-full bg-gray-600 dark:bg-gray-700 origin-left"
                              style={{ scaleX: 0 }}
                              animate={{ scaleX: todo.completed ? 1 : 0 }}
                              transition={{ duration: 0.25, ease: 'easeInOut' }}
                            />
                          </motion.p>
                        )}
                        <p className="text-muted-foreground text-sm">
                          {todo.completed ? 'Done' : 'Remember to not forget'}
                        </p>
                      </motion.div>
                    </div>
                    <X
                      className="cursor-pointer"
                      onClick={() => handleDelete(todo.id)}
                    />
                  </div>
                </Reorder.Item>
              );
            })
          )}
        </Reorder.Group>
        <div className="flex flex-row w-full justify-between">
          <Field orientation="horizontal">
            <Link href="/">
              <Button
                variant="outline"
                type="button"
                className="cursor-pointer"
              >
                Return
              </Button>
            </Link>
          </Field>
          <Field orientation="horizontal" className="ml-auto w-auto">
            {user ? (
              <Button
                variant="outline"
                type="button"
                className="cursor-pointer"
                onClick={() => handleLogout()}
              >
                Logout
              </Button>
            ) : (
              <Link href="/login">
                <Button
                  variant="outline"
                  type="button"
                  className="cursor-pointer"
                >
                  Login
                </Button>
              </Link>
            )}
          </Field>
        </div>
      </main>
    </div>
  );
}
