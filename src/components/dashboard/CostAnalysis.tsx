// src/components/dashboard/CostAnalysis/CostAnalysis.tsx
'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';  // Korrigiert von 'card' zu 'Card'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Brain, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface CostData {
    dailyStats: Array<{
        date: string;
        messageCount: number;
        userCount: number;
        cost?: number;
    }>;
    totalStats: {
        totalMessages: number;
        totalUsers: number;
        totalConversations: number;
        totalTokens: number;
    };
    aiSpendLimit: number;
}

interface CostAnalysisProps {
    data: CostData;
}

export function CostAnalysis({ data }: CostAnalysisProps) {
    if (!data || !data.dailyStats) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-gray-500 text-lg">Lade Kostendaten...</div>
            </div>
        );
    }
    const costs = data.dailyStats.map(day => ({
        ...day,
        cost: day.cost || 0
    }));

    // Berechne durchschnittliche tägliche Kosten
    const avgDailyCost = costs.reduce((sum, day) => sum + day.cost, 0) / costs.length;

    // Prognostizierte Monatskosten basierend auf bisherigem Verbrauch
    const projectedCost = avgDailyCost * 30;

    // Prüfe ob wir über Budget liegen
    const isOverBudget = projectedCost > data.aiSpendLimit;

    return (
        <div className="space-y-6">
            {/* Budget Alert */}
            {isOverBudget && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                        <p className="text-red-700">
                            Achtung: Bei aktuellem Verbrauch wird das Budget von {data.aiSpendLimit}€
                            voraussichtlich überschritten (Prognose: {projectedCost.toFixed(2)}€)
                        </p>
                    </div>
                </div>
            )}

            {/* Cost Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="flex items-center space-x-2">
                        <Brain className="h-5 w-5 text-[#0693e3]" />
                        <h3 className="text-sm font-medium text-gray-500">Monatliches Budget</h3>
                    </div>
                    <p className="mt-2 text-2xl font-bold">
                        {data.aiSpendLimit.toFixed(2)}€
                    </p>
                    <p className="text-sm text-gray-500">Verfügbar</p>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-[#0693e3]" />
                        <h3 className="text-sm font-medium text-gray-500">Durchschn. Kosten</h3>
                    </div>
                    <p className="mt-2 text-2xl font-bold">
                        {avgDailyCost.toFixed(2)}€
                    </p>
                    <p className="text-sm text-gray-500">pro Tag</p>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center space-x-2">
                        <Brain className="h-5 w-5 text-[#0693e3]" />
                        <h3 className="text-sm font-medium text-gray-500">Prognose</h3>
                    </div>
                    <p className="mt-2 text-2xl font-bold">
                        {projectedCost.toFixed(2)}€
                    </p>
                    <p className="text-sm text-gray-500">pro Monat</p>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-[#0693e3]" />
                        <h3 className="text-sm font-medium text-gray-500">KI Nutzung</h3>
                    </div>
                    <p className="mt-2 text-2xl font-bold">
                        {data.totalStats.totalTokens || 0}
                    </p>
                    <p className="text-sm text-gray-500">Tokens</p>
                </Card>
            </div>

            {/* Cost Trends Chart */}
            <Card className="p-4">
                <h3 className="text-lg font-medium mb-4">Kostenentwicklung</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={costs}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(date) => format(new Date(date), 'd.M')}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                tickFormatter={(value) => `${value}€`}
                            />
                            <Tooltip
                                formatter={(value: number) => [`${value.toFixed(2)}€`, 'Kosten']}
                                labelFormatter={(date) => format(new Date(date), 'dd.MM.yyyy')}
                            />
                            <Line
                                type="monotone"
                                dataKey="cost"
                                stroke="#2563eb"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
}