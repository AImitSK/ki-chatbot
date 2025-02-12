// src/hooks/useBudget.ts
import { useState } from 'react';

export function useBudget(initialBudget: number) {
    const [budget, setBudget] = useState(initialBudget);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateBudget = async (newBudget: number, projectId: string) => {
        setIsUpdating(true);
        setError(null);

        try {
            const response = await fetch('/api/projects/budget', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ projectId, newBudget }),
            });

            if (!response.ok) {
                throw new Error('Failed to update budget');
            }

            setBudget(newBudget);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update budget');
            throw err;
        } finally {
            setIsUpdating(false);
        }
    };

    return {
        budget,
        isUpdating,
        error,
        updateBudget,
    };
}