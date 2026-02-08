# Toast Notifications Guide

This guide explains how to use the modern toast notification system in DevOS.

## Overview

The DevOS frontend uses **Sonner** for modern, beautiful toast notifications with full TypeScript support and customizable styling.

## Quick Usage

### 1. Import the utilities

```typescript
import { showSuccessToast, showErrorToast, showInfoToast, showWarningToast, showLoadingToast } from '@/utils/toast-utils';
```

### 2. Basic usage

```typescript
// Success toast
showSuccessToast('Operation completed successfully!');

// Error toast
showErrorToast('Something went wrong. Please try again.');

// Info toast
showInfoToast('Here is some useful information.');

// Warning toast
showWarningToast('Please be careful with this action.');

// Loading toast
const loadingId = showLoadingToast('Processing...');
```

### 3. Advanced usage with the hook

```typescript
import { useToast } from '@/hooks/useToast';

const MyComponent = () => {
  const toast = useToast();
  
  const handleAction = () => {
    toast.success('Success!', {
      duration: 5000,
      description: 'Detailed description here',
      action: {
        label: 'Undo',
        onClick: () => console.log('Undo action')
      }
    });
  };
};
```

## API Reference

### Toast Types

- **success**: Green toast for successful operations
- **error**: Red toast for errors and failures
- **warning**: Yellow toast for warnings
- **info**: Blue toast for informational messages
- **loading**: Spinner toast for async operations

### Options

```typescript
interface ToastOptions {
  duration?: number;        // Auto-dismiss time (ms)
  position?: string;       // Toast position
  description?: string;     // Additional description
  action?: {               // Action button
    label: string;
    onClick: () => void;
  };
  cancel?: {               // Cancel button
    label: string;
    onClick?: () => void;
  };
  onDismiss?: () => void;  // Callback when dismissed
  onAutoClose?: () => void; // Callback when auto-closed
}
```

## Best Practices

### 1. Use appropriate toast types

```typescript
// ✅ Good
showSuccessToast('User created successfully!');
showErrorToast('Failed to create user. Please try again.');
showWarningToast('This action cannot be undone.');
showInfoToast('New features available!');

// ❌ Bad
showErrorToast('User created successfully!'); // Wrong type
```

### 2. Provide clear, concise messages

```typescript
// ✅ Good
showSuccessToast('Project "MyApp" created successfully!');
showErrorToast('Invalid email format');

// ❌ Bad
showSuccessToast('The project has been successfully created and is now available in your workspace');
showErrorToast('There was an error with the email address you provided because it does not match the required format for email addresses');
```

### 3. Use loading toasts for async operations

```typescript
const handleSave = async () => {
  const loadingId = showLoadingToast('Saving project...');
  
  try {
    await saveProject();
    showSuccessToast('Project saved successfully!');
  } catch (error) {
    showErrorToast('Failed to save project');
  }
};
```

### 4. Handle validation errors

```typescript
const handleSubmit = (data: FormData) => {
  if (!data.name) {
    showErrorToast('Project name is required');
    return;
  }
  
  if (data.name.length < 3) {
    showErrorToast('Project name must be at least 3 characters');
    return;
  }
  
  // Proceed with submission
};
```

## Integration Examples

### API Error Handling

The API client automatically shows toast notifications for errors:

```typescript
// Automatic toast for API errors
try {
  await apiClient.post('/projects', projectData);
  showSuccessToast('Project created!');
} catch (error) {
  // Toast is automatically shown by the API client
  // No need to manually handle errors here
}
```

### Form Validation

```typescript
const validateForm = (formData: FormData) => {
  const errors: string[] = [];
  
  if (!formData.email) errors.push('Email is required');
  if (!formData.password) errors.push('Password is required');
  
  if (errors.length > 0) {
    showErrorToast(errors[0]); // Show first error
    return false;
  }
  
  return true;
};
```

### Promise-based Operations

```typescript
const { promise } = useToast();

const handleUpload = async (file: File) => {
  await promise(
    uploadFile(file),
    {
      loading: 'Uploading file...',
      success: 'File uploaded successfully!',
      error: 'Failed to upload file'
    }
  );
};
```

## Styling

The toast system is fully styled with Tailwind CSS and supports both light and dark themes. The styling is defined in `src/components/ui/sonner-toast.tsx`.

### Custom Colors

- **Success**: Green theme with checkmark icon
- **Error**: Red theme with X icon  
- **Warning**: Yellow theme with warning icon
- **Info**: Blue theme with info icon
- **Loading**: Blue theme with spinner

## Global Configuration

Toast settings can be configured globally in `src/components/ui/sonner-toast.tsx`:

```typescript
<Toaster
  theme="light"
  position="top-right"
  expand={false}
  richColors
  closeButton
  className="toaster group font-sans border-border/50 backdrop-blur-sm bg-background/95"
  toastOptions={{
    classNames: {
      // Custom styling for different toast types
    }
  }}
/>
```

## Troubleshooting

### Toast not showing

1. Ensure `SonnerToaster` is rendered in `App.tsx`
2. Check if you're importing from the correct path
3. Verify the toast utility functions are imported

### Custom styling not working

1. Check the class names in `sonner-toast.tsx`
2. Ensure Tailwind CSS is properly configured
3. Verify the theme is applied correctly

### TypeScript errors

1. Ensure you're using the correct import paths
2. Check if the types are properly exported
3. Verify the utility functions are typed correctly
