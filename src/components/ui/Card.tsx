// src/components/ui/Card.tsx
import { ReactNode } from 'react'

interface CardProps {
    children: ReactNode
    className?: string
}

export function Card({ children, className = '' }: CardProps) {
    return (
        <div className={`bg-white shadow-md rounded-lg p-6 ${className}`}>
            {children}
        </div>
    )
}
