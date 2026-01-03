'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { motion, Reorder } from 'framer-motion';

import { Checkbox } from '@/components/ui/checkbox';
// import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { Field } from '@/components/ui/field';

export default function Page() {
  const [todo, setTodo] = useState({
    id: '',
    title: '',
    completed: false,
  });

  const [todoList, setTodoList] = useState([
    { id: '1', title: 'finish this', completed: false },
  ]);

  const handleSetTodo = (value: string) => {
    const idNew = crypto.randomUUID();

    const todoValue = {
      id: idNew,
      title: value,
      completed: false,
    };
    setTodo(todoValue);
  };

  const handleSubmit = () => {
    if (!todo.title) {
      console.log('error input empty');
    } else {
      setTodoList((prevState) => {
        return [...prevState, todo];
      });
    }

    setTodo({
      id: '',
      title: '',
      completed: false,
    });
  };

  const toggleTodo = (id: string) => {
    setTodoList((prevTodos) =>
      prevTodos.map((todo) => {
        if (todo.id === id) {
          return {
            ...todo,
            completed: !todo.completed,
          };
        }
        return todo;
      }),
    );
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const handleDelete = (id: string) => {
    setTodoList(todoList.filter((todo) => todo.id !== id));
  };

  const handleUpdate = (id: string) => {
    setTodoList((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, title: editingValue } : todo,
      ),
    );

    setEditingId(null);
    setEditingValue('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue('');
  };

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-100 dark:bg-zinc-800 font-sans transition-colors duration-300">
      <main className="flex flex-col gap-4 overflow-y-auto h-full max-h-150 w-full max-w-4xl items-center py-16 px-50 bg-white dark:bg-zinc-900 rounded-4xl shadow-sm dark:shadow-black/40 border border-zinc-200 dark:border-zinc-800">
        <div className="w-full flex flex-row justify-between scroll-m-20 pb-2 text-3xl font-bold tracking-tight first:mt-0">
          <h1> Your To do</h1>
          <Toggle />
        </div>
        <div className="flex flex-row gap-2 w-full">
          <Input
            type="text"
            placeholder="Add new task"
            value={todo.title}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
            onChange={(e) => handleSetTodo(e.currentTarget.value)}
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
          {todoList.map((todo) => {
            return (
              <Reorder.Item
                key={todo.id}
                value={todo}
                whileDrag={{ scale: 1 }}
                layout="position"
                className="w-full box-border"
              >
                <div
                  key={todo.id}
                  className="w-full hover:bg-accent/50 flex gap-3 items-center justify-between rounded-[14px] border p-2.5 cursor-grab"
                >
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
                        onCheckedChange={() => toggleTodo(todo.id)}
                        id="toggle-2"
                        checked={todo.completed}
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
                          onBlur={() => handleUpdate(todo.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleUpdate(todo.id);
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
          })}
        </Reorder.Group>
        <p className="w-full leading-7 mt-2 italic font-semibold">
          Your remaining todos: {}
        </p>
        <Field orientation="horizontal">
          <Link href="/">
            <Button variant="outline" type="button" className="cursor-pointer">
              Return
            </Button>
          </Link>
        </Field>
      </main>
    </div>
  );
}
