import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { showSuccessToast, showErrorToast } from '@/utils/toast-utils';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProjectFormData {
  name: string;
  pathOrUrl: string;
  type: string;
}

const PROJECT_TYPES = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'fullstack', label: 'Full Stack' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'ml', label: 'Machine Learning' },
  { value: 'other', label: 'Other' },
];

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    pathOrUrl: '',
    type: 'frontend',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Project name must be at least 2 characters';
    }

    if (!formData.pathOrUrl.trim()) {
      newErrors.pathOrUrl = 'Project path or Git URL is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showErrorToast('Please fix the validation errors');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Project created:', formData);
      
      // Close modal on success
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        pathOrUrl: '',
        type: 'frontend',
      });
      setErrors({});
      
      showSuccessToast(`Project "${formData.name}" created successfully!`);
    } catch (error) {
      console.error('Failed to create project:', error);
      setErrors({ submit: 'Failed to create project. Please try again.' });
      showErrorToast('Failed to create project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProjectFormData) => {
    return (value: string | React.ChangeEvent<HTMLInputElement>) => {
      const finalValue = typeof value === 'string' ? value : value.target.value;
      setFormData(prev => ({ ...prev, [field]: finalValue }));
      // Clear error for this field when user starts typing
      if (errors[field]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    };
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      // Reset form when closing
      setFormData({
        name: '',
        pathOrUrl: '',
        type: 'frontend',
      });
      setErrors({});
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Project
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div>
            <Label htmlFor="name" className="text-sm font-medium">
              Project Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleInputChange('name')}
              placeholder="my-awesome-project"
              className={cn('mt-1', errors.name && 'border-destructive')}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name}</p>
            )}
          </div>

          {/* Project Path or Git URL */}
          <div>
            <Label htmlFor="pathOrUrl" className="text-sm font-medium">
              Project Path or Git URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="pathOrUrl"
              value={formData.pathOrUrl}
              onChange={handleInputChange('pathOrUrl')}
              placeholder="/Users/username/projects/my-project"
              className={cn('mt-1', errors.pathOrUrl && 'border-destructive')}
              disabled={isLoading}
            />
            {errors.pathOrUrl && (
              <p className="text-sm text-destructive mt-1">{errors.pathOrUrl}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Enter local path or Git repository URL
            </p>
          </div>

          {/* Project Type */}
          <div>
            <Label htmlFor="type" className="text-sm font-medium">
              Project Type <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Select value={formData.type} onValueChange={handleInputChange('type')}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select project type" />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Form Error */}
          {errors.submit && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
              <p className="text-sm text-destructive">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="min-w-[100px]">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
