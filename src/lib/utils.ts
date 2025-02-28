// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"

export function cn(...inputs: ClassValue[]) {
    // Vereinfachte Version ohne tailwind-merge
    return clsx(inputs);
}

export function formatDate(dateString: string): string {
    if (!dateString) return ''

    try {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date)
    } catch (error) {
        console.error('Error formatting date:', error)
        return dateString
    }
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount)
}

export function truncateText(text: string, maxLength: number = 100): string {
    if (!text || text.length <= maxLength) return text
    return `${text.substring(0, maxLength)}...`
}