'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Task {
  id: number;
  title: string;
  assignee: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
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
    assignee: '',
    dueDate: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.taskTitle || !formData.assignee || !formData.dueDate) {
      alert('Please fill in all required fields');
      return;
    }

    const newTask: Task = {
      id: Date.now(),
      title: formData.taskTitle,
      assignee: formData.assignee,
      status: 'pending',
      dueDate: formData.dueDate,
    };
    // console.log('new task created: ', newTask);

    onTaskCreated(newTask);
    setFormData({
      taskTitle: '',
      assignee: '',
      dueDate: '',
    });
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-md mx-4 border border-zinc-200 dark:border-zinc-800">
        <div className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Create New Task</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Create a new task and assign it to an employee.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="taskTitle">Task Title *</Label>
              <Input
                id="taskTitle"
                placeholder="Enter task title"
                value={formData.taskTitle}
                onChange={(e) => handleInputChange('taskTitle', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee">Assign to *</Label>
              <select
                id="assignee"
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.assignee}
                onChange={(e) => handleInputChange('assignee', e.target.value)}
                required
              >
                <option value="">Select an employee</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.username}>
                    {employee.username}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Task</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
