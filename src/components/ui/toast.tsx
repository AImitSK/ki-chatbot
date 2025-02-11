// components/ui/toast.tsx
'use client'

import toast, { Toaster } from 'react-hot-toast'

// Funktion für Erfolgsmeldung
export const showSuccessToast = (message: string) => {
    toast.success(message, {
        duration: 4000,
        position: 'top-right',
    })
}

// Funktion für Fehlermeldung
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

// Diese Funktion wurde aktualisiert
export const showConfirmToast = async (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
        const isConfirmed = window.confirm(message) // Beispiel mit Browser-Dialog
        resolve(isConfirmed)
    })
}

// Warnungen anzeigen
export const showWarningToast = (message: string) => {
    toast(message, {
        duration: 4000,
        position: 'top-right',
        style: {
            background: '#facc15', // gelber Hintergrund für Warnungen
            color: '#000',
        },
    })
}