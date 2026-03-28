'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Toggle } from '@/components/ui/toggle';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Users,
  CheckSquare,
  MessageSquare,
  LogOut,
} from 'lucide-react';
import CreateEmployeeModal from '@/components/modals/create-employee-modal';
import CreateTaskModal from '@/components/modals/create-task-modal';
import MessageSection from '@/components/message-section';
import { toast } from 'sonner';
import { useRouter, redirect } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { useAuth } from '@/providers/auth-provider';

type AdminSection = 'users' | 'tasks' | 'messages';

interface EmployeeClient {
  id: number;
  username: string;
  email: string;
  status: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  isFirstLogin: boolean;
}

interface Employee {
  id: number;
  employee_phone: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

interface Task {
  id: number;
  title: string;
  description: string;
  assignee: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<AdminSection>('users');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] =
    useState<EmployeeClient | null>(null);
  const [isDeleteTaskModalOpen, setIsDeleteTaskModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [employees, setEmployees] = useState<EmployeeClient[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin, logout } = useAuth();

  const fetchEmployees = async () => {
    try {
      const response = await axiosInstance.get('/employees/get-employees');

      const result: ApiResponse<Employee[]> = response.data;

      const employeesWithStatus = result.data.map((emp) => ({
        id: emp.user.id,
        username: emp.user.username,
        email: emp.user.email,
        status: emp.user.isFirstLogin ? 'inactive' : 'active',
      }));
      // console.log('employees with status: ', employeesWithStatus);

      setEmployees(employeesWithStatus);
      setError(null);
    } catch (error) {
      console.error('Fetch employees error:', error);
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axiosInstance.get('/tasks/get-tasks');

      const result: ApiResponse<Task[]> = response.data;
      // console.log('api get tasks results: ', result);

      const tasksReceived = result.data.map((tak) => ({
        id: tak.id,
        title: tak.title,
        description: tak.description,
        assignee: tak.assignee,
        status: tak.status,
        priority: tak.priority,
        dueDate: tak.dueDate,
      }));

      setTasks(tasksReceived);
      setError(null);
    } catch (error) {
      console.error('Fetch tasks error:', error);
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      redirect('/');
    }
    fetchEmployees();
    fetchTasks();
  }, [isAdmin]);

  const menuItems = [
    { id: 'users', label: 'Manage Users', icon: Users },
    { id: 'tasks', label: 'Manage Tasks', icon: CheckSquare },
    { id: 'messages', label: 'Message', icon: MessageSquare },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      console.log(error);
    }
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks((prev) => [...prev, newTask]);

    toast.success(
      `Task "${newTask.title}" created successfully and assigned to ${newTask.assignee}!`,
    );
  };

  const handleEmployeeCreated = (newEmployee: EmployeeClient) => {
    fetchEmployees();

    toast.success(
      `Employee ${newEmployee.username} created successfully! Login credentials have been sent to ${newEmployee.email}`,
    );
  };

  const handleDeleteEmployee = async (userId: number) => {
    try {
      const response = await axiosInstance.delete(
        `/employees/delete-employee/${userId}`,
      );

      if (response) {
        fetchEmployees();
        toast.success('Employee deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const openDeleteModal = (employee: EmployeeClient) => {
    setEmployeeToDelete(employee);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setEmployeeToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const confirmDeleteEmployee = async () => {
    if (employeeToDelete) {
      await handleDeleteEmployee(employeeToDelete.id);
      closeDeleteModal();
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      const response = await axiosInstance.delete(
        `/tasks/delete-task/${taskId}`,
      );

      if (response) {
        fetchTasks();
        toast.success('Task deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const openDeleteTaskModal = (task: Task) => {
    setTaskToDelete(task);
    setIsDeleteTaskModalOpen(true);
  };

  const closeDeleteTaskModal = () => {
    setTaskToDelete(null);
    setIsDeleteTaskModalOpen(false);
  };

  const confirmDeleteTask = async () => {
    if (taskToDelete) {
      await handleDeleteTask(taskToDelete.id);
      closeDeleteTaskModal();
    }
  };

  const openEditTaskModal = (task: Task) => {
    setTaskToEdit(task);
    setIsEditTaskModalOpen(true);
  };

  const closeEditTaskModal = () => {
    setTaskToEdit(null);
    setIsEditTaskModalOpen(false);
  };

  const handleEditTask = async (updatedTask: Task) => {
    try {
      const response = await axiosInstance.put(
        `/tasks/update-task-desc/${updatedTask.id}`,
        updatedTask,
      );

      if (response) {
        fetchTasks();
        toast.success('Task updated successfully!');
        closeEditTaskModal();
      }
    } catch {
      toast.error('Failed to update task');
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return (
          <div className="flex-1 p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">Manage Users</h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                {isLoading
                  ? 'Loading...'
                  : error
                    ? `Error: ${error}`
                    : `${employees.length} Employees`}
              </p>
            </div>

            <div className="flex gap-4 mb-6">
              <Button
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus size={16} />
                Create Employee
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 cursor-pointer"
              >
                <Search size={16} />
                Filter
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.username}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          employee.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {employee.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 cursor-pointer"
                          onClick={() => openDeleteModal(employee)}
                        >
                          <Trash2 size={14} className="mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );

      case 'tasks':
        return (
          <div className="flex-1 p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">Manage Tasks</h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                {tasks.length} Tasks
              </p>
            </div>

            <div className="flex gap-4 mb-6">
              <Button
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setIsCreateTaskModalOpen(true)}
              >
                <Plus size={16} />
                Create Task
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 cursor-pointer"
              >
                <Search size={16} />
                Filter
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task Title</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>{task.assignee}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          task.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : task.status === 'in-progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {task.status === 'in-progress'
                          ? 'In Progress'
                          : task.status.charAt(0).toUpperCase() +
                            task.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>{task.dueDate}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 cursor-pointer"
                          onClick={() => openEditTaskModal(task)}
                        >
                          <Edit size={14} className="mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 cursor-pointer"
                          onClick={() => openDeleteTaskModal(task)}
                        >
                          <Trash2 size={14} className="mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );

      case 'messages':
        return (
          <div className="flex-1">
            <MessageSection employees={employees} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center font-sans transition-colors duration-300 p-4">
      <div className="w-full max-w-5xl h-[90vh] max-h-200 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl dark:shadow-black/40 overflow-hidden border border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col h-full">
          {/* Header with Toggle and Logout */}
          <div className="flex justify-between items-center p-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <Toggle />
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2 cursor-pointer"
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
                      onClick={() => setActiveSection(item.id as AdminSection)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left cursor-pointer transition-colors ${
                        activeSection === item.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
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
            <div className="flex-1 flex overflow-hidden">{renderContent()}</div>
          </div>
        </div>
      </div>

      {/* Create Employee Modal */}
      <CreateEmployeeModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onEmployeeCreated={handleEmployeeCreated}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        open={isCreateTaskModalOpen}
        onOpenChange={setIsCreateTaskModalOpen}
        onTaskCreated={handleTaskCreated}
        employees={employees}
      />

      {/* Delete Employee Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-md mx-4 border border-zinc-200 dark:border-zinc-800">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Delete Employee</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-zinc-700 dark:text-zinc-300 mb-2">
                  Are you sure you want to delete this employee?
                </p>
                {employeeToDelete && (
                  <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3 border border-zinc-200 dark:border-zinc-700">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {employeeToDelete.username}
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {employeeToDelete.email}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={closeDeleteModal}
                  className="text-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDeleteEmployee}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Employee
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Task Confirmation Modal */}
      {isDeleteTaskModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-md mx-4 border border-zinc-200 dark:border-zinc-800">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Delete Task</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-zinc-700 dark:text-zinc-300 mb-2">
                  Are you sure you want to delete this task?
                </p>
                {taskToDelete && (
                  <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3 border border-zinc-200 dark:border-zinc-700">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {taskToDelete.title}
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Assigned to: {taskToDelete.assignee}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={closeDeleteTaskModal}
                  className="text-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDeleteTask}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Task
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {isEditTaskModalOpen && taskToEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-md mx-4 border border-zinc-200 dark:border-zinc-800">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <Edit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Edit Task</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Update task details
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Task Title
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    value={taskToEdit.title}
                    onChange={(e) =>
                      setTaskToEdit({ ...taskToEdit, title: e.target.value })
                    }
                    placeholder="Enter task title"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Task Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    value={taskToEdit.description || ''}
                    onChange={(e) =>
                      setTaskToEdit({
                        ...taskToEdit,
                        description: e.target.value,
                      })
                    }
                    placeholder="Enter task description"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Priority
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    value={taskToEdit.priority || 'medium'}
                    onChange={(e) =>
                      setTaskToEdit({
                        ...taskToEdit,
                        priority: e.target.value as 'low' | 'medium' | 'high',
                      })
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={closeEditTaskModal}
                  className="text-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleEditTask(taskToEdit)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Update Task
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
