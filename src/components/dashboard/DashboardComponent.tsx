'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { LineChart, PieChart, Line, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MessageSquare, Users, Brain, Clock, Settings, Repeat, UserPlus } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { de } from 'date-fns/locale';
import { useToast } from '@/hooks/useToast';

interface DashboardProps {
    projectId: string;
}

interface StatsData {
    totalUsers: number;
    newUsers: number;
    returningUsers: number;
    botMessages: number;
    userMessages: number;
    sessions: number;
    totalCost: number;
    aiSpendLimit: number;
}

interface DailyUserData {
    date: string;
    newUsers: number;
    returningUsers: number;
}

interface DailyLLMData {
    date: string;
    totalMessages: number;
    llmCalls: number;
    llmErrors: number;
}

interface UserPieData {
    name: string;
    value: number;
}

// Farben für Charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const DashboardComponent: React.FC<DashboardProps> = ({ projectId }) => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [aiSpendLimit, setAiSpendLimit] = useState(0);
    const [newBudget, setNewBudget] = useState(0);

    // Zustandsvariablen für Dashboard-Daten
    const [stats, setStats] = useState<StatsData>({
        totalUsers: 0,
        newUsers: 0,
        returningUsers: 0,
        botMessages: 0,
        userMessages: 0,
        sessions: 0,
        totalCost: 0,
        aiSpendLimit: 0
    });

    // Daten für Graphen
    const [userGraph, setUserGraph] = useState<DailyUserData[]>([]);
    const [llmGraph, setLlmGraph] = useState<DailyLLMData[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);

                // Zeitraum: Letzter Monat
                const lastMonth = subMonths(new Date(), 1);
                const startDate = startOfMonth(lastMonth);
                const endDate = endOfMonth(lastMonth);

                // API-Aufruf für Dashboard-Daten des letzten Monats
                const response = await fetch(`/api/analytics/${projectId}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);

                if (!response.ok) {
                    throw new Error('Fehler beim Laden der Dashboard-Daten');
                }

                const data = await response.json();

                // Daten aus API-Antwort extrahieren und State aktualisieren
                if (data.success && data.data) {
                    const analyticsData = data.data;

                    // Übersichtsdaten
                    setStats({
                        totalUsers: analyticsData.totalStats.totalUsers || 0,
                        newUsers: analyticsData.totalStats.newUsers || 0,
                        returningUsers: analyticsData.totalStats.totalUsers - analyticsData.totalStats.newUsers || 0,
                        botMessages: analyticsData.totalStats.botMessages || 0,
                        userMessages: analyticsData.totalStats.userMessages || 0,
                        sessions: analyticsData.totalStats.totalConversations || 0,
                        totalCost: analyticsData.totalStats.totalCost || 0,
                        aiSpendLimit: analyticsData.aiSpendLimit || 0
                    });

                    setAiSpendLimit(analyticsData.aiSpendLimit || 0);
                    setNewBudget(analyticsData.aiSpendLimit || 0);

                    // Daten für Graphen aufbereiten
                    if (analyticsData.dailyStats && analyticsData.dailyStats.length > 0) {
                        // Nutzer-Graph-Daten
                        const userGraphData: DailyUserData[] = analyticsData.dailyStats.map((day: any) => ({
                            date: format(new Date(day.date), 'dd.MM.yyyy'),
                            newUsers: day.newUserCount || 0,
                            returningUsers: day.userCount - day.newUserCount || 0
                        }));
                        setUserGraph(userGraphData);

                        // LLM-Aktivitäts-Graph-Daten
                        const llmGraphData: DailyLLMData[] = analyticsData.dailyStats.map((day: any) => ({
                            date: format(new Date(day.date), 'dd.MM.yyyy'),
                            totalMessages: day.messageCount || 0,
                            llmCalls: day.llmCallCount || 0,
                            llmErrors: day.llmErrorCount || 0
                        }));
                        setLlmGraph(llmGraphData);
                    }
                }
            } catch (error) {
                console.error('Fehler beim Laden der Dashboard-Daten:', error);
                toast({
                    title: 'Fehler',
                    description: 'Die Dashboard-Daten konnten nicht geladen werden.',
                    variant: 'destructive'
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
        // Daten alle 5 Minuten aktualisieren
        const interval = setInterval(() => fetchDashboardData(), 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [projectId, toast]);

    // Budget aktualisieren
    const updateBudget = async () => {
        try {
            const response = await fetch('/api/projects/budget', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    projectId,
                    newBudget
                })
            });

            if (!response.ok) {
                throw new Error('Fehler beim Aktualisieren des Budgets');
            }

            setAiSpendLimit(newBudget);
            setShowBudgetModal(false);
            toast({
                title: 'Erfolg',
                description: 'Das Budget wurde erfolgreich aktualisiert.',
            });
        } catch (error) {
            console.error('Fehler beim Aktualisieren des Budgets:', error);
            toast({
                title: 'Fehler',
                description: 'Das Budget konnte nicht aktualisiert werden.',
                variant: 'destructive'
            });
        }
    };

    // Daten für Nutzer-Tortendiagramm
    const userPieData: UserPieData[] = [
        { name: 'Neue Nutzer', value: stats.newUsers },
        { name: 'Wiederkehrende Nutzer', value: stats.returningUsers }
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-lg text-gray-700">Lade Dashboard-Daten...</span>
            </div>
        );
    }

    const lastMonthDate = format(subMonths(new Date(), 1), 'MMMM yyyy', { locale: de });

    return (
        <div className="p-6 space-y-6">
            {/* Überschrift und Budget-Button */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <div>
                    <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
                    <p className="text-gray-500">Übersicht für {lastMonthDate}</p>
                </div>
                <Button
                    onClick={() => setShowBudgetModal(true)}
                    className="mt-2 md:mt-0 flex items-center gap-2"
                >
                    <Settings className="h-4 w-4" />
                    <span>AI Budget anpassen</span>
                </Button>
            </div>

            {/* Kennzahlen-Karten in der ersten Reihe */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Gesamtnutzer</p>
                            <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
                        </div>
                        <Users className="h-8 w-8 text-blue-500" />
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Sitzungen</p>
                            <h3 className="text-2xl font-bold">{stats.sessions}</h3>
                        </div>
                        <MessageSquare className="h-8 w-8 text-green-500" />
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Bot-Nachrichten</p>
                            <h3 className="text-2xl font-bold">{stats.botMessages}</h3>
                        </div>
                        <Brain className="h-8 w-8 text-purple-500" />
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Nutzer-Nachrichten</p>
                            <h3 className="text-2xl font-bold">{stats.userMessages}</h3>
                        </div>
                        <MessageSquare className="h-8 w-8 text-orange-500" />
                    </div>
                </Card>
            </div>

            {/* Budget-Karte */}
            <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">AI Spend</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col">
                        <p className="text-sm text-gray-500 mb-1">Monatliches Limit</p>
                        <p className="text-xl font-semibold">{aiSpendLimit.toFixed(2)} €</p>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-sm text-gray-500 mb-1">Verbraucht im letzten Monat</p>
                        <p className="text-xl font-semibold">{stats.totalCost.toFixed(2)} €</p>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-sm text-gray-500 mb-1">Verbrauch</p>
                        <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                <div
                                    className={`h-2.5 rounded-full ${stats.totalCost > aiSpendLimit ? 'bg-red-500' : 'bg-blue-500'}`}
                                    style={{ width: `${Math.min(stats.totalCost / aiSpendLimit * 100, 100)}%` }}
                                ></div>
                            </div>
                            <span className="text-sm font-medium">
                                {Math.round(stats.totalCost / aiSpendLimit * 100)}%
                            </span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Graphen und Diagramme */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Nutzer-Graph */}
                <Card className="p-4">
                    <h3 className="text-lg font-semibold mb-4">Nutzerentwicklung</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={userGraph}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="newUsers"
                                    name="Neue Nutzer"
                                    stroke="#00C49F"
                                    strokeWidth={2}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="returningUsers"
                                    name="Wiederkehrende Nutzer"
                                    stroke="#0088FE"
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* LLM-Aktivitäts-Graph */}
                <Card className="p-4">
                    <h3 className="text-lg font-semibold mb-4">LLM-Aktivität</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={llmGraph}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="totalMessages"
                                    name="Gesamtnachrichten"
                                    stroke="#8884d8"
                                    strokeWidth={2}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="llmCalls"
                                    name="LLM-Calls"
                                    stroke="#FF8042"
                                    strokeWidth={2}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="llmErrors"
                                    name="LLM-Fehler"
                                    stroke="#FF0000"
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Nutzer-Tortendiagramm und Kennzahlen */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="p-4 lg:col-span-1">
                    <h3 className="text-lg font-semibold mb-4">Nutzerverteilung</h3>
                    <div className="h-64 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={userPieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {userPieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Legend />
                                <Tooltip formatter={(value) => [`${value}`, '']} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="p-4 lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">Detaillierte Nutzerstatistiken</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <UserPlus className="h-8 w-8 text-green-500 mr-3" />
                            <div>
                                <p className="text-sm text-gray-500">Neue Nutzer</p>
                                <p className="text-xl font-semibold">{stats.newUsers}</p>
                            </div>
                        </div>

                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <Repeat className="h-8 w-8 text-blue-500 mr-3" />
                            <div>
                                <p className="text-sm text-gray-500">Wiederkehrende Nutzer</p>
                                <p className="text-xl font-semibold">{stats.returningUsers}</p>
                            </div>
                        </div>

                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <Brain className="h-8 w-8 text-purple-500 mr-3" />
                            <div>
                                <p className="text-sm text-gray-500">Gesamtzahl LLM-Aufrufe</p>
                                <p className="text-xl font-semibold">
                                    {llmGraph.reduce((sum, day) => sum + (day.llmCalls || 0), 0)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <Clock className="h-8 w-8 text-orange-500 mr-3" />
                            <div>
                                <p className="text-sm text-gray-500">Durchschn. Sitzungsdauer</p>
                                <p className="text-xl font-semibold">
                                    {stats.sessions > 0 ?
                                        `${Math.round((llmGraph.reduce((sum, day) => sum + (day.totalMessages || 0), 0) / stats.sessions))} Nachrichten` :
                                        'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Budget-Modal */}
            {showBudgetModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="p-6 max-w-md w-full">
                        <h3 className="text-xl font-semibold mb-4">AI Budget anpassen</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Legen Sie das monatliche Budget für Ihren Chatbot fest.
                            Aktuelles Budget: {aiSpendLimit.toFixed(2)} €
                        </p>

                        <div className="mb-4">
                            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
                                Neues Budget (€)
                            </label>
                            <input
                                type="number"
                                id="budget"
                                min="0"
                                step="0.01"
                                value={newBudget}
                                onChange={(e) => setNewBudget(parseFloat(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                onClick={() => setShowBudgetModal(false)}
                            >
                                Abbrechen
                            </Button>
                            <Button
                                onClick={updateBudget}
                            >
                                Speichern
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default DashboardComponent;