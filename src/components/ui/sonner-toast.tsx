import { Toaster } from 'sonner';
import { cn } from '@/lib/utils';

export function SonnerToaster() {
  return (
    <Toaster
      theme="light"
      position="top-right"
      expand={false}
      richColors
      closeButton
      className={cn(
        'toaster group',
        'font-sans',
        'border-border/50',
        'backdrop-blur-sm',
        'bg-background/95'
      )}
      toastOptions={{
        classNames: {
          toast: cn(
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
            'group-[.toaster]:border-border/50',
            'group-[.toaster]:shadow-lg'
          ),
          description: cn('group-[.toast]:text-muted-foreground'),
          actionButton: cn(
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground'
          ),
          cancelButton: cn(
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground'
          ),
          success: cn(
            'group-[.toast]:border-green-500/20 group-[.toast]:bg-green-50 group-[.toast]:text-green-800',
            'dark:group-[.toast]:border-green-500/30 dark:group-[.toast]:bg-green-950 dark:group-[.toast]:text-green-200'
          ),
          error: cn(
            'group-[.toast]:border-red-500/20 group-[.toast]:bg-red-50 group-[.toast]:text-red-800',
            'dark:group-[.toast]:border-red-500/30 dark:group-[.toast]:bg-red-950 dark:group-[.toast]:text-red-200'
          ),
          warning: cn(
            'group-[.toast]:border-yellow-500/20 group-[.toast]:bg-yellow-50 group-[.toast]:text-yellow-800',
            'dark:group-[.toast]:border-yellow-500/30 dark:group-[.toast]:bg-yellow-950 dark:group-[.toast]:text-yellow-200'
          ),
          info: cn(
            'group-[.toast]:border-blue-500/20 group-[.toast]:bg-blue-50 group-[.toast]:text-blue-800',
            'dark:group-[.toast]:border-blue-500/30 dark:group-[.toast]:bg-blue-950 dark:group-[.toast]:text-blue-200'
          ),
          loading: cn(
            'group-[.toast]:border-blue-500/20 group-[.toast]:bg-blue-50 group-[.toast]:text-blue-800',
            'dark:group-[.toast]:border-blue-500/30 dark:group-[.toast]:bg-blue-950 dark:group-[.toast]:text-blue-200'
          ),
        },
      }}
    />
  );
}
