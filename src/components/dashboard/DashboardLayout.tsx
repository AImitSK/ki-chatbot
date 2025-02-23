// src/components/dashboard/DashboardLayout.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MessageSquare, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface DashboardStats {
    dailyStats: Array<{
        date: string;
        messageCount: number;
        userCount: number;
    }>;
    totalStats: {
        totalMessages: number;
        totalUsers: number;
        totalConversations: number;
        totalTokens: number;
    };
}

interface DashboardLayoutProps {
    projectId: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ projectId }) => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');

    useEffect(() => {
        let isSubscribed = true;

        const fetchData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/stats/${projectId}?days=${timeRange}`);
                if (!response.ok) throw new Error('Failed to fetch');
                const data = await response.json();
                if (isSubscribed) {
                    setStats(data.data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                if (isSubscribed) {
                    setIsLoading(false);
                }
            }
        };

        void fetchData();
        const interval = setInterval(() => void fetchData(), 5 * 60 * 1000);

        return () => {
            isSubscribed = false;
            clearInterval(interval);
        };
    }, [projectId, timeRange]);

    if (isLoading || !stats) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500 text-lg">Lade Daten...</div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Time Range Selector */}
            <div className="flex justify-end space-x-2">
                <Button
                    color={timeRange === '7' ? 'blue' : 'zinc'}
                    onClick={() => setTimeRange('7')}
                >
                    7 Tage
                </Button>
                <Button
                    color={timeRange === '30' ? 'blue' : 'zinc'}
                    onClick={() => setTimeRange('30')}
                >
                    30 Tage
                </Button>
                <Button
                    color={timeRange === '90' ? 'blue' : 'zinc'}
                    onClick={() => setTimeRange('90')}
                >
                    90 Tage
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Nachrichten</p>
                            <h3 className="text-2xl font-bold">{stats.totalStats.totalMessages}</h3>
                        </div>
                        <MessageSquare className="h-8 w-8 text-[#0693e3]" />
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Nutzer</p>
                            <h3 className="text-2xl font-bold">{stats.totalStats.totalUsers}</h3>
                        </div>
                        <Users className="h-8 w-8 text-[#0693e3]" />
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Konversationen</p>
                            <h3 className="text-2xl font-bold">{stats.totalStats.totalConversations}</h3>
                        </div>
                        <MessageSquare className="h-8 w-8 text-[#0693e3]" />
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">KI Nutzung</p>
                            <h3 className="text-2xl font-bold">{stats.totalStats.totalTokens || 0}</h3>
                        </div>
                        <Clock className="h-8 w-8 text-[#0693e3]" />
                    </div>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Message Activity Chart */}
                <Card className="p-4">
                    <h3 className="text-lg font-medium mb-4">Nachrichtenaktivität</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.dailyStats}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(date) => format(new Date(date), 'd.M')}
                                    interval="preserveStartEnd"
                                />
                                <YAxis />
                                <Tooltip
                                    labelFormatter={(date) => format(new Date(date), 'dd.MM.yyyy')}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="messageCount"
                                    stroke="#f97316"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* User Activity Chart */}
                <Card className="p-4">
                    <h3 className="text-lg font-medium mb-4">Nutzeraktivität</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.dailyStats}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(date) => format(new Date(date), 'd.M')}
                                    interval="preserveStartEnd"
                                />
                                <YAxis />
                                <Tooltip
                                    labelFormatter={(date) => format(new Date(date), 'dd.MM.yyyy')}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="userCount"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default DashboardLayout;