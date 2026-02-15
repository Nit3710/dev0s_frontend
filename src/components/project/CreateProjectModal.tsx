import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { showSuccessToast, showErrorToast } from '@/utils/toast-utils';
import { useProjectStore } from '@/state/project.store';
import { CreateProjectRequest } from '@/api/projects.api';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProjectFormData {
  name: string;
  description: string;
  pathOrUrl: string;
}



export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const { createProject } = useProjectStore();
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    pathOrUrl: '',
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

    try {
      // Determine if the pathOrUrl is a Git URL or local path
      const isGitUrl = formData.pathOrUrl.startsWith('http://') ||
        formData.pathOrUrl.startsWith('https://') ||
        formData.pathOrUrl.startsWith('git@');

      const projectData: CreateProjectRequest = {
        name: formData.name,
        description: formData.description || undefined,
        ...(isGitUrl
          ? { repositoryUrl: formData.pathOrUrl }
          : { localPath: formData.pathOrUrl }
        ),
      };

      await createProject(projectData);

      // Close modal on success
      onClose();

      // Reset form
      setFormData({
        name: '',
        description: '',
        pathOrUrl: '',
      });
      setErrors({});

      showSuccessToast(`Project "${formData.name}" created successfully!`);
    } catch (error: any) {
      console.error('Failed to create project:', error);

      let errorMessage = 'Failed to create project. Please try again.';
      if (error.response?.status === 403) {
        errorMessage = 'You have insufficient permissions (403 Forbidden). Please check if your user role is "VIEWER".';
      }

      setErrors({ submit: errorMessage });
      showErrorToast(errorMessage);
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
        description: '',
        pathOrUrl: '',
      });
      setErrors({});
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] w-[95%] max-h-[90vh] overflow-y-auto">
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

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              Description <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="description"
              value={formData.description}
              onChange={handleInputChange('description')}
              placeholder="A brief description of your project"
              className="mt-1"
              disabled={isLoading}
            />
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
