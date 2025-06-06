import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Users, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import type { Employee, CreateEmployeeInput, UpdateEmployeeInput } from '../../../server/src/schema';

interface EmployeeManagerProps {
  onEmployeeChange?: () => void;
}

export function EmployeeManager({ onEmployeeChange }: EmployeeManagerProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Add employee form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormData, setAddFormData] = useState<CreateEmployeeInput>({
    name: '',
    wins: 0,
  });
  
  // Edit employee form state
  const [showEditForm, setShowEditForm] = useState(false);
  const [editFormData, setEditFormData] = useState<UpdateEmployeeInput>({
    id: '',
    name: '',
    wins: 0,
  });
  
  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  // Load employees
  const loadEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await trpc.getEmployees.query();
      setEmployees(data);
    } catch (error) {
      console.error('Failed to load employees:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  // Handle add employee
  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFormData.name.trim()) return;

    setIsSubmitting(true);
    try {
      await trpc.createEmployee.mutate(addFormData);
      setAddFormData({ name: '', wins: 0 });
      setShowAddForm(false);
      await loadEmployees();
      onEmployeeChange?.();
    } catch (error) {
      console.error('Failed to create employee:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit employee
  const handleEditEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.name.trim()) return;

    setIsSubmitting(true);
    try {
      await trpc.updateEmployee.mutate(editFormData);
      setShowEditForm(false);
      await loadEmployees();
      onEmployeeChange?.();
    } catch (error) {
      console.error('Failed to update employee:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete employee
  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;

    setIsSubmitting(true);
    try {
      await trpc.deleteEmployee.mutate({ id: employeeToDelete.id });
      setShowDeleteConfirm(false);
      setEmployeeToDelete(null);
      await loadEmployees();
      onEmployeeChange?.();
    } catch (error) {
      console.error('Failed to delete employee:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start edit
  const startEdit = (employee: Employee) => {
    setEditFormData({
      id: employee.id,
      name: employee.name,
      wins: employee.wins,
    });
    setShowEditForm(true);
  };

  // Start delete
  const startDelete = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setShowDeleteConfirm(true);
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Employee Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading employees...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>👥 Employee Management</span>
          </CardTitle>
          <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
            <DialogTrigger asChild>
              <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <Plus className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>
                  Create a new employee profile for the spinner wheel.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddEmployee} className="space-y-4">
                <div>
                  <label htmlFor="add-name" className="block text-sm font-medium mb-2">
                    Employee Name
                  </label>
                  <Input
                    id="add-name"
                    value={addFormData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setAddFormData((prev: CreateEmployeeInput) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter employee name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="add-wins" className="block text-sm font-medium mb-2">
                    Initial Wins
                  </label>
                  <Input
                    id="add-wins"
                    type="number"
                    value={addFormData.wins}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setAddFormData((prev: CreateEmployeeInput) => ({ ...prev, wins: parseInt(e.target.value) || 0 }))
                    }
                    min="0"
                    placeholder="0"
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || !addFormData.name.trim()}>
                    {isSubmitting ? 'Creating...' : 'Create Employee'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {employees.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No employees yet!</p>
            <p className="text-sm">Add your first employee to get started with the spinner wheel.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {employees.map((employee: Employee) => (
              <Card key={employee.id} className="border-2 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">{employee.name}</h3>
                      <Badge variant="secondary" className="mt-1">
                        🏆 {employee.wins} wins
                      </Badge>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(employee)}
                        className="p-2"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startDelete(employee)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update the employee information.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditEmployee} className="space-y-4">
            <div>
              <label htmlFor="edit-name" className="block text-sm font-medium mb-2">
                Employee Name
              </label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditFormData((prev: UpdateEmployeeInput) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter employee name"
                required
              />
            </div>
            <div>
              <label htmlFor="edit-wins" className="block text-sm font-medium mb-2">
                Wins
              </label>
              <Input
                id="edit-wins"
                type="number"
                value={editFormData.wins}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditFormData((prev: UpdateEmployeeInput) => ({ ...prev, wins: parseInt(e.target.value) || 0 }))
                }
                min="0"
                placeholder="0"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditForm(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !editFormData.name.trim()}>
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{employeeToDelete?.name}</strong> from the system.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEmployee}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Deleting...' : 'Delete Employee'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}