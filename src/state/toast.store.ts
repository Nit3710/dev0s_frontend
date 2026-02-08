import { create } from 'zustand';
import { toast } from 'sonner';

interface ToastStore {
  success: (message: string, options?: any) => void;
  error: (message: string, options?: any) => void;
  warning: (message: string, options?: any) => void;
  info: (message: string, options?: any) => void;
  dismiss: (id?: string | number) => void;
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    },
    options?: any
  ) => Promise<T>;
}

export const useToastStore = create<ToastStore>((set, get) => ({
  success: (message: string, options?: any) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
      ...options,
    });
  },

  error: (message: string, options?: any) => {
    toast.error(message, {
      duration: 5000,
      position: 'top-right',
      ...options,
    });
  },

  warning: (message: string, options?: any) => {
    toast.warning(message, {
      duration: 4000,
      position: 'top-right',
      ...options,
    });
  },

  info: (message: string, options?: any) => {
    toast.info(message, {
      duration: 4000,
      position: 'top-right',
      ...options,
    });
  },

  dismiss: (id?: string | number) => {
    toast.dismiss(id);
  },

  promise: async <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    },
    options?: any
  ): Promise<T> => {
    const result = await toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      position: 'top-right',
      ...options,
    });
    return result as T;
  },
}));

export default useToastStore;
