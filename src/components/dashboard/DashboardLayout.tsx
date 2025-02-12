'use client'

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Settings } from 'lucide-react';
import { BudgetModal } from './BudgetModal';
import toast from 'react-hot-toast';
import { getProjectStats, getProjectHistory } from '@/lib/api/projects';

interface DashboardLayoutProps {
    projectId: string;
}

interface DashboardStats {
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

const StatCard = ({ title, value, subtitle }: { title: string; value: number | string; subtitle: string }) => (
    <Card className="w-full">
        console.log(`Rendering StatCard – Title: ${title}, Value: ${value}, Subtitle: ${subtitle}`);
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
        <span className="text-xs text-gray-500">{subtitle}</span>
    </Card>
);

const DashboardLayout = ({ projectId }: DashboardLayoutProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [stats, setStats] = useState<DashboardStats>({
        aiSpendLimit: 0,
        aiSpend: 0,
        messages: {
            total: 0,
            bot: 0,
            user: 0
        },
        sessions: 0,
        users: {
            total: 0,
            new: 0,
            returning: 0
        }
    });

    // State für historische Daten
    const [historicalData, setHistoricalData] = useState<any[]>([]);

    // Initialer Daten-Load
    useEffect(() => {
        const loadDashboardData = async () => {
            console.log(`Executing query for projectId: ${projectId}`);
            try {
                setIsLoading(true);

                // Hole Statistiken
                const projectStats = await getProjectStats(projectId);
                console.log(`Project Stats for project ${projectId}:`, JSON.stringify(projectStats, null, 2));

                // Überprüfe, ob die erwarteten Felder vorhanden sind
                if (!projectStats || !projectStats.stats) {
                    throw new Error('Ungültige Datenstruktur bei projectStats');
                }

                setStats({
                    aiSpendLimit: projectStats.aiSpendLimit,
                    aiSpend: projectStats.stats.aiSpend,
                    messages: {
                        total: projectStats.stats.messages,
                        bot: projectStats.stats.botMessages,
                        user: projectStats.stats.userMessages
                    },
                    sessions: projectStats.stats.sessions,
                    users: projectStats.stats.users
                });

                // Hole historische Daten
                const history = await getProjectHistory(projectId);
                console.log(`Historical data for project ${projectId}:`, JSON.stringify(history, null, 2));
                setHistoricalData(history);
            } catch (error) {
                toast.error('Fehler beim Laden der Daten');
                console.error('Error loading dashboard data:', error);
            } finally {
                setIsLoading(false);
                console.log('Dashboard data loading complete.');
            }
        };

        loadDashboardData();

        // Aktualisiere Daten alle 5 Minuten
        const interval = setInterval(() => {
            console.log('Aktualisiere Dashboard-Daten...');
            loadDashboardData();
        }, 5 * 60 * 1000);
        return () => {
            clearInterval(interval);
            console.log('Daten-Aktualisierungsintervall wurde abgemeldet.');
        };
    }, [projectId]);

    const handleBudgetClick = () => {
        console.log('Budget Modal öffnen.');
        setIsModalOpen(true);
    };

    const handleSaveBudget = async (newBudget: number) => {
        setIsUpdating(true);
        console.log(`Versuche Budget zu aktualisieren. Neuer Budgetwert: ${newBudget}`);
        try {
            // API Call zum Budget Update
            const response = await fetch('/api/projects/budget', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ projectId, newBudget }),
            });

            console.log(`Antwort vom Budget-Update für project ${projectId}:`, response);
            if (!response.ok) {
                throw new Error(`API-Fehler: ${response.statusText}`);
            }

            setStats(prev => ({
                ...prev,
                aiSpendLimit: newBudget
            }));

            toast.success('Budget erfolgreich aktualisiert');
            setIsModalOpen(false);
            console.log('Budget Update erfolgreich abgeschlossen.');
        } catch (error) {
            toast.error('Fehler beim Aktualisieren des Budgets');
            console.error('Error updating budget:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const colors = ['#60a5fa', '#fbbf24'];

    if (isLoading) {
        console.log('Dashboard-Daten werden geladen...');
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    // Berechne den Fortschrittsprozentsatz für den AI Spend
    const progressPercentage = stats.aiSpendLimit > 0 ? (stats.aiSpend / stats.aiSpendLimit) * 100 : 0;
    console.log(`Berechneter AI Spend Fortschritt: ${progressPercentage}% (aiSpend: ${stats.aiSpend}, aiSpendLimit: ${stats.aiSpendLimit})`);

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500">Chatbot-Aktivitäten des letzten Monats</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Februar 2024</span>
                </div>
            </div>

            <div className="space-y-6">
                {/* Statistiken */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        title="Bot Nachrichten"
                        value={stats.messages.bot}
                        subtitle="Letzter Monat"
                    />
                    <StatCard
                        title="Benutzer Nachrichten"
                        value={stats.messages.user}
                        subtitle="Letzter Monat"
                    />
                    <StatCard
                        title="Sessions"
                        value={stats.sessions}
                        subtitle="Letzter Monat"
                    />
                </div>

                {/* AI Spend Card */}
                <Card>
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">AI Spend</h3>
                            <p className="text-2xl font-bold">{stats.aiSpend}€</p>
                        </div>
                        <Button
                            onClick={handleBudgetClick}
                            className="flex items-center gap-1"
                            disabled={isUpdating}
                        >
                            <Settings className="w-3 h-3" />
                            {isUpdating ? 'Wird aktualisiert...' : 'Budget'}
                        </Button>
                    </div>
                    <div className="mt-2 h-2 bg-gray-100 rounded-full">
                        <div
                            className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                    <span className="text-xs text-gray-500">von {stats.aiSpendLimit}€ Budget</span>
                </Card>

                {/* Nachrichten & Sessions Chart */}
                <Card>
                    <h3 className="text-lg font-medium mb-4">Nachrichten & Sessions</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={historicalData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="messages" stroke="#2563eb" strokeWidth={2} name="Nachrichten" />
                                <Line type="monotone" dataKey="sessions" stroke="#fbbf24" strokeWidth={2} name="Sessions" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Benutzertypen Chart */}
                <Card>
                    <h3 className="text-lg font-medium mb-4">Benutzertypen (Letzter Monat)</h3>
                    <div className="h-64 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Neue Nutzer', value: stats.users.new },
                                        { name: 'Wiederkehrende', value: stats.users.returning }
                                    ]}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {[0, 1].map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={colors[index]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-4">
                        {['Neue Nutzer', 'Wiederkehrende'].map((name, index) => (
                            <div key={name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index] }} />
                                <span className="text-sm text-gray-600">{name}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            <BudgetModal
                isOpen={isModalOpen}
                onClose={() => {
                    console.log('Budget Modal geschlossen.');
                    setIsModalOpen(false);
                }}
                currentBudget={stats.aiSpendLimit}
                onSave={handleSaveBudget}
            />
        </div>
    );
};

export default DashboardLayout;
