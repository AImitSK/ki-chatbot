// src/types/dashboard.ts

export interface DashboardStats {
    aiSpendLimit: number;
    aiSpend: number;
    messages: {
        total: number;
        bot: number;
        user: number;
    };
    sessions: number;
    users: {
        total: number;
        new: number;
        returning: number;
    };
}

export interface HistoricalData {
    date: string;
    messages: number;
    sessions: number;
}