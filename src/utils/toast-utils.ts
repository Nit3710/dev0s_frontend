import { useToastStore } from '@/state/toast.store';

export interface ApiError {
  response?: {
    data?: {
      message?: string;
      error?: string;
      validationErrors?: Record<string, string>;
    };
  };
  message?: string;
}

export const handleApiError = (error: ApiError, defaultMessage: string = 'An error occurred') => {
  const toast = useToastStore.getState();
  
  // Try to extract the most specific error message
  const message = error.response?.data?.message || 
                 error.response?.data?.error || 
                 error.message || 
                 defaultMessage;
  
  // Handle validation errors
  if (error.response?.data?.validationErrors) {
    const validationErrors = error.response.data.validationErrors;
    const firstError = Object.values(validationErrors)[0];
    toast.error(firstError || message);
    return;
  }
  
  toast.error(message);
};

export const showSuccessToast = (message: string) => {
  const toast = useToastStore.getState();
  toast.success(message);
};

export const showErrorToast = (message: string) => {
  const toast = useToastStore.getState();
  toast.error(message);
};

export const showInfoToast = (message: string) => {
  const toast = useToastStore.getState();
  toast.info(message);
};

export const showWarningToast = (message: string) => {
  const toast = useToastStore.getState();
  toast.warning(message);
};
