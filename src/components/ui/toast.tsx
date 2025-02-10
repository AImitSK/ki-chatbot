// components/ui/toast.tsx
'use client'

import toast, { Toaster } from 'react-hot-toast'

export const showSuccessToast = (message: string) => {
    toast.success(message, {
        duration: 4000,
        position: 'top-right',
    })
}

export const showErrorToast = (message: string) => {
    toast.error(message, {
        duration: 4000,
        position: 'top-right',
    })
}

// Toast Container Komponente
export function ToastContainer() {
    return (
        <Toaster />
    )
}

export const showWarningToast = (message: string) => {
    toast(message, {
        duration: 4000,
        position: 'top-right',
        style: {
            background: '#facc15', // Gelber Hintergrund für Warnungen
            color: '#000',
        },
    })
}
