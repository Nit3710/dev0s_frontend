import { toast } from 'sonner';

export interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
  icon?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  onAutoClose?: () => void;
}

export const useToast = () => {
  const success = (message: string, options?: ToastOptions) => {
    return toast.success(message, {
      duration: 4000,
      position: 'top-right',
      ...options,
    });
  };

  const error = (message: string, options?: ToastOptions) => {
    return toast.error(message, {
      duration: 5000,
      position: 'top-right',
      ...options,
    });
  };

  const warning = (message: string, options?: ToastOptions) => {
    return toast.warning(message, {
      duration: 4000,
      position: 'top-right',
      ...options,
    });
  };

  const info = (message: string, options?: ToastOptions) => {
    return toast.info(message, {
      duration: 4000,
      position: 'top-right',
      ...options,
    });
  };

  const dismiss = (id?: string | number) => {
    toast.dismiss(id);
  };

  const promise = <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    },
    options?: Omit<ToastOptions, 'duration'>
  ) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      position: 'top-right',
      ...options,
    });
  };

  return {
    success,
    error,
    warning,
    info,
    dismiss,
    promise,
  };
};

export default useToast;
