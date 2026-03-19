'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import axiosInstance from '@/lib/axios';

interface Employee {
  id: number;
  username: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive';
}

interface CreateEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmployeeCreated: (employee: Employee) => void;
}

export default function CreateEmployeeModal({
  open,
  onOpenChange,
  onEmployeeCreated,
}: CreateEmployeeModalProps) {
  const [formData, setFormData] = useState({
    employeeName: '',
    phoneNumber: '',
    emailAddress: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.employeeName || !formData.emailAddress) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axiosInstance.post('/employees/create-employee', {
        employee_name: formData.employeeName.trim(),
        employee_email: formData.emailAddress.trim(),
        employee_phone: formData.phoneNumber.trim() || undefined,
      });

      const result = response.data;
      // console.log('new employee created: ', result);

      const newEmployee: Employee = {
        id: result.data.id || Date.now(),
        username: result.data.name || formData.employeeName.trim(),
        email: result.data.email || formData.emailAddress.trim(),
        status: 'active',
      };

      onEmployeeCreated(newEmployee);
      setFormData({
        employeeName: '',
        phoneNumber: '',
        emailAddress: '',
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Create employee error:', error);
      toast.error('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-md mx-4 border border-zinc-200 dark:border-zinc-800">
        <div className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Add New Employee</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Create a new employee account. Login credentials will be sent to
              the provided email address.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeeName">Employee Name *</Label>
              <Input
                id="employeeName"
                placeholder="Enter employee name"
                value={formData.employeeName}
                onChange={(e) =>
                  handleInputChange('employeeName', e.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailAddress">Email Address *</Label>
              <Input
                id="emailAddress"
                type="email"
                placeholder="Enter email address"
                value={formData.emailAddress}
                onChange={(e) =>
                  handleInputChange('emailAddress', e.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                placeholder="Enter phone number"
                value={formData.phoneNumber}
                onChange={(e) =>
                  handleInputChange('phoneNumber', e.target.value)
                }
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="cursor-pointer"
              >
                {isLoading ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
