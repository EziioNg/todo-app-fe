'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { redirect, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import MessageSection from '@/components/message-section';
import {
  CheckSquare,
  MessageSquare,
  LogOut,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import axiosInstance from '@/lib/axios';

type Task = {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  createdAt: string;
};

type UserSection = 'todos' | 'messages';

export default function UserTodoPage() {
  const router = useRouter();
  const { user, logout, isEmployee } = useAuth();
  const [activeSection, setActiveSection] = useState<UserSection>('todos');
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignedTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch tasks assigned to the current employee
      const response = await axiosInstance.get('/tasks/get-my-tasks');

      setTaskList(response.data.data || []);
    } catch (error) {
      console.error('Fetch tasks failed:', error);
      setError('Failed to load assigned tasks. Please try again.');
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isEmployee) {
      redirect('/');
    }
    fetchAssignedTasks();
  }, [isEmployee]);

  const handleStatusUpdate = async (
    taskId: number,
    newStatus: 'pending' | 'in-progress' | 'completed',
  ) => {
    if (!user) {
      toast.error('You have to login first to perform this action');
      return;
    }

    // Optimistic update
    const previousStatus = taskList.find((task) => task.id === taskId)?.status;
    setTaskList((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task,
      ),
    );

    try {
      await axiosInstance.put(`/tasks/update-task-status/${taskId}`, {
        status: newStatus,
      });

      const statusMessages = {
        pending: 'Task marked as pending',
        'in-progress': 'Task started successfully',
        completed: 'Task completed! Great work!',
      };

      toast.success(statusMessages[newStatus]);
    } catch (error) {
      // Revert on error
      setTaskList((prev) =>
        prev.map((task) =>
          task.id === taskId && previousStatus
            ? { ...task, status: previousStatus }
            : task,
        ),
      );
      console.error('Update task status failed:', error);
      toast.error('Failed to update task status');
    }
  };

  const handleUpdateTitle = async (taskId: number) => {
    if (!editingValue.trim()) return;
    if (!user) {
      toast.error('Please login first before attempting this action');
      return;
    }

    const originalTitle = taskList.find((task) => task.id === taskId)?.title;

    // Optimistic update
    setTaskList((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, title: editingValue } : task,
      ),
    );

    try {
      await axiosInstance.put(`/tasks/${taskId}`, {
        title: editingValue,
      });

      setEditingId(null);
      setEditingValue('');
      toast.success('Task updated successfully');
    } catch (error) {
      // Revert on error
      setTaskList((prev) =>
        prev.map((task) =>
          task.id === taskId && originalTitle
            ? { ...task, title: originalTitle }
            : task,
        ),
      );
      console.error('Update task failed:', error);
      toast.error('Failed to update task');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400';
      case 'in-progress':
        return 'text-blue-600 dark:text-blue-400';
      case 'pending':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isOverdue = (dueDate: string) => {
    return (
      new Date(dueDate) < new Date() &&
      new Date().toDateString() !== new Date(dueDate).toDateString()
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logout successful');
      router.replace('/auth/login');
    } catch {
      toast.error('Logout failed');
    }
  };

  const menuItems = [
    { id: 'todos', label: 'My Tasks', icon: CheckSquare },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'todos':
        return (
          <div className="flex-1 p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">
                {user && `${user.username}'s Assigned Tasks`}
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                Tasks assigned to you by your administrator
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2 text-zinc-600 dark:text-zinc-400">
                  Loading tasks...
                </span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-zinc-600 dark:text-zinc-400 mb-4">{error}</p>
                <Button onClick={fetchAssignedTasks} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : taskList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <CheckSquare className="w-12 h-12 text-zinc-400 mb-4" />
                <p className="text-zinc-600 dark:text-zinc-400">
                  No tasks assigned yet
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-2">
                  Your administrator will assign tasks to you
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {taskList.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      {/* Status Checkbox */}
                      <div className="pt-1">
                        <Checkbox
                          checked={task.status === 'completed'}
                          onCheckedChange={() => {
                            const newStatus =
                              task.status === 'completed'
                                ? 'pending'
                                : 'completed';
                            handleStatusUpdate(task.id, newStatus);
                          }}
                          className="cursor-pointer"
                        />
                      </div>

                      {/* Task Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            {editingId === task.id ? (
                              <Input
                                autoFocus
                                value={editingValue}
                                onChange={(e) =>
                                  setEditingValue(e.target.value)
                                }
                                onBlur={() => handleUpdateTitle(task.id)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter')
                                    handleUpdateTitle(task.id);
                                  if (e.key === 'Escape') {
                                    setEditingId(null);
                                    setEditingValue('');
                                  }
                                }}
                                className="text-sm"
                              />
                            ) : (
                              <h3
                                onClick={() => {
                                  setEditingId(task.id);
                                  setEditingValue(task.title);
                                }}
                                className={`font-medium cursor-text hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                                  task.status === 'completed'
                                    ? 'line-through opacity-60'
                                    : ''
                                }`}
                              >
                                {task.title}
                              </h3>
                            )}

                            {task.description && (
                              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                                {task.description}
                              </p>
                            )}
                          </div>

                          {/* Priority Badge */}
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        {/* Task Meta */}
                        <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span
                              className={`${isOverdue(task.dueDate) ? 'text-red-500 font-medium' : ''}`}
                            >
                              {formatDate(task.dueDate)}
                              {isOverdue(task.dueDate) && ' (Overdue)'}
                            </span>
                          </div>

                          <span
                            className={`font-medium ${getStatusColor(task.status)}`}
                          >
                            {task.status === 'in-progress'
                              ? 'In Progress'
                              : task.status.charAt(0).toUpperCase() +
                                task.status.slice(1)}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 mt-3">
                          {task.status !== 'in-progress' &&
                            task.status !== 'completed' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleStatusUpdate(task.id, 'in-progress')
                                }
                                className="text-xs"
                              >
                                Start Task
                              </Button>
                            )}

                          {task.status === 'in-progress' && (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleStatusUpdate(task.id, 'completed')
                              }
                              className="text-xs"
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        );

      case 'messages':
        return (
          <div className="flex-1">
            <MessageSection employees={[]} />
          </div>
        );

      default:
        return null;
    }
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // hoặc skeleton

  return (
    <div className="flex min-h-screen h-screen items-center justify-center font-sans transition-colors duration-300">
      <main className="flex flex-col overflow-y-auto h-full max-h-150 w-full max-w-6xl bg-white dark:bg-zinc-900 rounded-4xl shadow-sm dark:shadow-black/40 border border-zinc-200 dark:border-zinc-800">
        {/* Header with Toggle and Logout */}
        <div className="flex justify-between items-center p-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <Toggle />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut size={14} />
              Logout
            </Button>
          </div>
        </div>

        <div className="flex flex-row flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-6">
            <div className="flex flex-col gap-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id as UserSection)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeSection === item.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-l-4 border-l-blue-500'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          {mounted && renderContent()}
        </div>
      </main>
    </div>
  );
}
