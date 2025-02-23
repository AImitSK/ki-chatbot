// src/hooks/useToast.ts
import toast from 'react-hot-toast';

interface ToastOptions {
    title?: string;
    description: string;
    variant?: 'default' | 'destructive';
}

export function useToast() {
    const showToast = ({ title, description, variant = 'default' }: ToastOptions) => {
        if (variant === 'destructive') {
            toast.error(description);
        } else {
            toast.success(description);
        }
    };

    return { toast: showToast };
}