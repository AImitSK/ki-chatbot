// src/lib/api/dashboard.ts
import type { DashboardStats, HistoricalData } from '@/types/dashboard';

export async function fetchStats(projectId: string): Promise<DashboardStats> {
    const response = await fetch(`/api/stats/${projectId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch stats');
    }
    return response.json();
}

export async function fetchHistory(projectId: string): Promise<HistoricalData[]> {
    const response = await fetch(`/api/stats/${projectId}/history`);
    if (!response.ok) {
        throw new Error('Failed to fetch history');
    }
    return response.json();
}