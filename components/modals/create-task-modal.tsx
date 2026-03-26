'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Calendar, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import axiosInstance from '@/lib/axios';

interface Task {
  id: number;
  title: string;
  description: string;
  assignee: string;
  assigneeId: number;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  createdAt: string;
}

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated: (task: Task) => void;
  employees: Array<{
    id: number;
    username: string;
    email: string;
    status: string;
  }>;
}

export default function CreateTaskModal({
  open,
  onOpenChange,
  onTaskCreated,
  employees,
}: CreateTaskModalProps) {
  const [formData, setFormData] = useState({
    taskTitle: '',
    description: '',
    assignee: '',
    assigneeId: 0,
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleAssigneeChange = (value: string) => {
    const employee = employees.find((emp) => emp.username === value);
    setFormData((prev) => ({
      ...prev,
      assignee: value,
      assigneeId: employee?.id || 0,
    }));

    if (errors.assignee) {
      setErrors((prev) => ({
        ...prev,
        assignee: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.taskTitle.trim()) {
      newErrors.taskTitle = 'Task title is required';
    }

    if (!formData.assignee) {
      newErrors.assignee = 'Please select an employee';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else {
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post('/tasks/create-task', {
        task_title: formData.taskTitle.trim(),
        task_description: formData.description.trim(),
        assigneeId: formData.assigneeId,
        priority: formData.priority,
        dueDate: formData.dueDate,
      });
      const result = response.data;
      console.log('result after creating task: ', result);

      const newTask: Task = {
        id: Date.now(),
        title: formData.taskTitle.trim(),
        description: formData.description.trim(),
        assignee: formData.assignee,
        assigneeId: formData.assigneeId,
        status: 'pending',
        priority: formData.priority,
        dueDate: formData.dueDate,
        createdAt: new Date().toISOString(),
      };

      onTaskCreated(newTask);

      // Reset form
      setFormData({
        taskTitle: '',
        description: '',
        assignee: '',
        assigneeId: 0,
        priority: 'medium',
        dueDate: '',
      });
      setErrors({});

      onOpenChange(false);
    } catch {
      toast.error('Failed to create task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-md mx-4 border border-zinc-200 dark:border-zinc-800">
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Create New Task
              </h2>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Create a new task and assign it to an employee.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Task Title */}
            <div className="space-y-2">
              <Label htmlFor="taskTitle" className="flex items-center gap-2">
                Task Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="taskTitle"
                placeholder="Enter task title"
                value={formData.taskTitle}
                onChange={(e) => handleInputChange('taskTitle', e.target.value)}
                className={
                  errors.taskTitle ? 'border-red-500 focus:ring-red-500' : ''
                }
                disabled={isSubmitting}
              />
              {errors.taskTitle && (
                <div className="flex items-center gap-1 text-sm text-red-500">
                  <AlertCircle className="w-4 h-4" />
                  {errors.taskTitle}
                </div>
              )}
            </div>

            {/* Task Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                placeholder="Enter task description (optional)"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange('description', e.target.value)
                }
                rows={3}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isSubmitting}
              />
            </div>

            {/* Assignee Selection */}
            <div className="space-y-2">
              <Label htmlFor="assignee" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Assign to <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <select
                  id="assignee"
                  className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer ${
                    errors.assignee
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-zinc-300 dark:border-zinc-600'
                  }`}
                  value={formData.assignee}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  disabled={isSubmitting || employees.length === 0}
                >
                  <option value="">Select an employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.username}>
                      {employee.username} ({employee.email})
                    </option>
                  ))}
                </select>
                {employees.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-md">
                    <span className="text-sm text-zinc-500">
                      No employees available
                    </span>
                  </div>
                )}
              </div>
              {errors.assignee && (
                <div className="flex items-center gap-1 text-sm text-red-500">
                  <AlertCircle className="w-4 h-4" />
                  {errors.assignee}
                </div>
              )}
            </div>

            {/* Priority and Due Date Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                  value={formData.priority}
                  onChange={(e) =>
                    handleInputChange('priority', e.target.value)
                  }
                  disabled={isSubmitting}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Due Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className={
                    errors.dueDate ? 'border-red-500 focus:ring-red-500' : ''
                  }
                  disabled={isSubmitting}
                />
                {errors.dueDate && (
                  <div className="flex items-center gap-1 text-sm text-red-500">
                    <AlertCircle className="w-4 h-4" />
                    {errors.dueDate}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-zinc-200 dark:border-zinc-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || employees.length === 0}
                className="min-w-30 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Create Task
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
