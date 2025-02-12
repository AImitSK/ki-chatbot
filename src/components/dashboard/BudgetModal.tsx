// src/components/dashboard/BudgetModal.tsx
'use client'

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';

interface BudgetModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentBudget: number;
    onSave: (newBudget: number) => void;
}

export function BudgetModal({ isOpen, onClose, currentBudget, onSave }: BudgetModalProps) {
    const [budget, setBudget] = useState(currentBudget);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(budget);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-200 p-4">
                        <h2 className="text-lg font-semibold">Budget anpassen</h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ×
                        </button>
                    </div>

                    <div className="space-y-4 p-4">
                        <div>
                            <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
                                Monatliches AI Budget (€)
                            </label>
                            <input
                                type="number"
                                id="budget"
                                value={budget}
                                onChange={(e) => setBudget(Number(e.target.value))}
                                min="0"
                                step="0.01"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg"
                            />
                        </div>

                        <p className="text-sm text-gray-500">
                            Aktuelles Budget: {currentBudget}€
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 bg-gray-50 px-4 py-3">
                        <Button
                            type="button"
                            onClick={onClose}
                            className="bg-white"
                        >
                            Abbrechen
                        </Button>
                        <Button
                            type="submit"
                        >
                            Speichern
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}