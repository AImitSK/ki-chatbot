'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { LineChart, PieChart, Line, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MessageSquare, Users, Brain, Clock, Settings, Repeat, UserPlus, AlertTriangle } from 'lucide-react';
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
    totalLlmCalls: number;
    totalLlmErrors: number;
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
    const [aiSpendLimit, setAiSpendLimit] = useState(50);
    const [newBudget, setNewBudget] = useState(50);

    // Zustandsvariablen für Dashboard-Daten
    const [stats, setStats] = useState<StatsData>({
        totalUsers: 0,
        newUsers: 0,
        returningUsers: 0,
        botMessages: 0,
        userMessages: 0,
        sessions: 0,
        totalCost: 0,
        aiSpendLimit: 50,
        totalLlmCalls: 0,
        totalLlmErrors: 0
    });

    // Daten für Graphen
    const [userGraph, setUserGraph] = useState<DailyUserData[]>([]);
    const [llmGraph, setLlmGraph] = useState<DailyLLMData[]>([]);
    const [dataFetched, setDataFetched] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Vermeide doppelte Datenabfragen
        if (dataFetched) return;

        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Zeitraum: Letzter Monat
                const lastMonth = subMonths(new Date(), 1);
                const startDate = startOfMonth(lastMonth);
                const endDate = endOfMonth(lastMonth);

                console.log(`Fetching dashboard data for ${projectId}`, {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                });

                // Daten abrufen
                const response = await fetch(`/api/analytics/${projectId}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);

                if (!response.ok) {
                    throw new Error(`API-Fehler: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                console.log('Dashboard API Response:', data);

                if (data?.data) {
                    const analyticsData = data.data;

                    // Dummy-Daten für die Entwicklung erzeugen
                    const dummyData = generateDummyData(startDate, endDate);

                    // Setze entweder die echten Daten oder die Dummy-Daten
                    const hasRealData = analyticsData.dailyStats && analyticsData.dailyStats.length > 0;

                    // Übersichtsdaten
                    setStats({
                        totalUsers: hasRealData ? analyticsData.totalStats.totalUsers : dummyData.totalUsers,
                        newUsers: hasRealData ? analyticsData.totalStats.newUsers : dummyData.newUsers,
                        returningUsers: hasRealData ? (analyticsData.totalStats.totalUsers - analyticsData.totalStats.newUsers) : dummyData.returningUsers,
                        botMessages: hasRealData ? analyticsData.totalStats.botMessages : dummyData.botMessages,
                        userMessages: hasRealData ? analyticsData.totalStats.userMessages : dummyData.userMessages,
                        sessions: hasRealData ? analyticsData.totalStats.totalConversations : dummyData.sessions,
                        totalCost: hasRealData ? analyticsData.totalStats.totalCost : dummyData.totalCost,
                        aiSpendLimit: analyticsData.aiSpendLimit || 50,
                        totalLlmCalls: hasRealData ? analyticsData.totalStats.totalLlmCalls : dummyData.totalLlmCalls,
                        totalLlmErrors: hasRealData ? analyticsData.totalStats.totalLlmErrors : dummyData.totalLlmErrors
                    });

                    setAiSpendLimit(analyticsData.aiSpendLimit || 50);
                    setNewBudget(analyticsData.aiSpendLimit || 50);

                    // Graph-Daten
                    setUserGraph(hasRealData ?
                        analyticsData.dailyStats.map((day: any) => ({
                            date: format(new Date(day.date), 'dd.MM.'),
                            newUsers: day.newUserCount || 0,
                            returningUsers: (day.userCount - day.newUserCount) || 0
                        })) :
                        dummyData.userGraph
                    );

                    setLlmGraph(hasRealData ?
                        analyticsData.dailyStats.map((day: any) => ({
                            date: format(new Date(day.date), 'dd.MM.'),
                            totalMessages: day.messageCount || 0,
                            llmCalls: day.llmCallCount || 0,
                            llmErrors: day.llmErrorCount || 0
                        })) :
                        dummyData.llmGraph
                    );
                } else {
                    // Fallback zu Dummy-Daten, wenn keine Daten zurückgegeben werden
                    const dummyData = generateDummyData(startDate, endDate);
                    setStats({
                        totalUsers: dummyData.totalUsers,
                        newUsers: dummyData.newUsers,
                        returningUsers: dummyData.returningUsers,
                        botMessages: dummyData.botMessages,
                        userMessages: dummyData.userMessages,
                        sessions: dummyData.sessions,
                        totalCost: dummyData.totalCost,
                        aiSpendLimit: 50,
                        totalLlmCalls: dummyData.totalLlmCalls,
                        totalLlmErrors: dummyData.totalLlmErrors
                    });
                    setUserGraph(dummyData.userGraph);
                    setLlmGraph(dummyData.llmGraph);
                }
            } catch (err) {
                console.error('Fehler beim Laden der Dashboard-Daten:', err);
                setError(err instanceof Error ? err.message : 'Unbekannter Fehler beim Laden der Daten');

                // Bei Fehler Dummy-Daten anzeigen
                const lastMonth = subMonths(new Date(), 1);
                const dummyData = generateDummyData(startOfMonth(lastMonth), endOfMonth(lastMonth));
                setStats({
                    totalUsers: dummyData.totalUsers,
                    newUsers: dummyData.newUsers,
                    returningUsers: dummyData.returningUsers,
                    botMessages: dummyData.botMessages,
                    userMessages: dummyData.userMessages,
                    sessions: dummyData.sessions,
                    totalCost: dummyData.totalCost,
                    aiSpendLimit: 50,
                    totalLlmCalls: dummyData.totalLlmCalls,
                    totalLlmErrors: dummyData.totalLlmErrors
                });
                setUserGraph(dummyData.userGraph);
                setLlmGraph(dummyData.llmGraph);

                toast({
                    title: 'Fehler',
                    description: 'Die Dashboard-Daten konnten nicht geladen werden. Es werden Beispieldaten angezeigt.',
                    variant: 'destructive'
                });
            } finally {
                setIsLoading(false);
                setDataFetched(true);
            }
        };

        fetchDashboardData();
    }, [projectId, toast, dataFetched]);

    // Beispieldaten generieren
    const generateDummyData = (startDate: Date, endDate: Date) => {
        const daysInPeriod = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const totalUsers = 20;
        const newUsers = 8;
        const returningUsers = totalUsers - newUsers;

        // Zufällige Tageswerte erzeugen
        const userGraphData: DailyUserData[] = [];
        const llmGraphData: DailyLLMData[] = [];

        for (let i = 0; i < daysInPeriod; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);

            // Nur für Tage mit Aktivität (ca. 60% der Tage)
            if (Math.random() > 0.4) {
                userGraphData.push({
                    date: format(currentDate, 'dd.MM.'),
                    newUsers: Math.floor(Math.random() * 2),
                    returningUsers: Math.floor(Math.random() * 3)
                });

                llmGraphData.push({
                    date: format(currentDate, 'dd.MM.'),
                    totalMessages: Math.floor(Math.random() * 12) + 5,
                    llmCalls: Math.floor(Math.random() * 8) + 3,
                    llmErrors: Math.floor(Math.random() * 2)
                });
            }
        }

        return {
            totalUsers,
            newUsers,
            returningUsers,
            botMessages: 86,
            userMessages: 74,
            sessions: 20,
            totalCost: 10.5,
            totalLlmCalls: 95,
            totalLlmErrors: 2,
            userGraph: userGraphData,
            llmGraph: llmGraphData
        };
    };

    // Manuelles Aktualisieren
    const refreshData = () => {
        setDataFetched(false);
    };

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
                description: 'Das Budget wurde erfolgreich aktualisiert.'
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

    // Ladebildschirm
    if (isLoading && !dataFetched) {
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
            {/* Fehlerbenachrichtigung */}
            {error && (
                <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-md">
                    <h3 className="text-red-800 font-medium">Fehler beim Laden der Daten</h3>
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                    <p className="text-red-600 text-sm mt-1">Es werden Beispieldaten angezeigt.</p>
                </div>
            )}

            {/* Überschrift und Budget-Button */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <div>
                    <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
                    <p className="text-gray-500">Übersicht für {lastMonthDate}</p>
                </div>
                <div className="flex mt-2 md:mt-0 gap-2">
                    <Button
                        onClick={refreshData}
                        className="flex items-center gap-2"
                        disabled={isLoading}
                    >
                        <Repeat className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        <span>{isLoading ? 'Wird geladen...' : 'Aktualisieren'}</span>
                    </Button>
                    <Button
                        onClick={() => setShowBudgetModal(true)}
                        className="flex items-center gap-2"
                    >
                        <Settings className="h-4 w-4" />
                        <span>AI Budget anpassen</span>
                    </Button>
                </div>
            </div>

            {/* Hauptkennzahlen-Karten */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="p-6 flex flex-col h-full">
                    <div className="flex items-center mb-2">
                        <Users className="h-6 w-6 text-blue-500 mr-2" />
                        <h3 className="text-lg font-semibold">Gesamtnutzer</h3>
                    </div>
                    <p className="text-3xl font-bold mt-2">{stats.totalUsers.toLocaleString()}</p>
                    <div className="mt-auto pt-4 text-sm text-gray-500">
                        <div className="flex items-center justify-between">
                            <span>Neue Nutzer:</span>
                            <span className="font-medium">{stats.newUsers.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                            <span>Wiederkehrende Nutzer:</span>
                            <span className="font-medium">{stats.returningUsers.toLocaleString()}</span>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 flex flex-col h-full">
                    <div className="flex items-center mb-2">
                        <MessageSquare className="h-6 w-6 text-green-500 mr-2" />
                        <h3 className="text-lg font-semibold">Nachrichten</h3>
                    </div>
                    <p className="text-3xl font-bold mt-2">{(stats.botMessages + stats.userMessages).toLocaleString()}</p>
                    <div className="mt-auto pt-4 text-sm text-gray-500">
                        <div className="flex items-center justify-between">
                            <span>Bot-Nachrichten:</span>
                            <span className="font-medium">{stats.botMessages.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                            <span>Nutzer-Nachrichten:</span>
                            <span className="font-medium">{stats.userMessages.toLocaleString()}</span>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 flex flex-col h-full">
                    <div className="flex items-center mb-2">
                        <Brain className="h-6 w-6 text-purple-500 mr-2" />
                        <h3 className="text-lg font-semibold">Sitzungen</h3>
                    </div>
                    <p className="text-3xl font-bold mt-2">{stats.sessions.toLocaleString()}</p>
                    <div className="mt-auto pt-4 text-sm text-gray-500">
                        <div className="flex items-center justify-between">
                            <span>LLM-Aufrufe:</span>
                            <span className="font-medium">{stats.totalLlmCalls.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                            <span>LLM-Fehler:</span>
                            <span className="font-medium">{stats.totalLlmErrors.toLocaleString()}</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* AI Spend-Karte */}
            <Card className="p-6">
                <div className="flex items-center mb-4">
                    <Settings className="h-6 w-6 text-slate-600 mr-2" />
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
                                    style={{ width: `${Math.min(stats.totalCost / (aiSpendLimit || 1) * 100, 100)}%` }}
                                ></div>
                            </div>
                            <span className="text-sm font-medium">
                                {Math.round(stats.totalCost / (aiSpendLimit || 1) * 100)}%
                            </span>
                        </div>
                    </div>
                </div>

                {stats.totalCost > aiSpendLimit && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-600">
                            Warnung: Das AI-Budget wurde im letzten Monat überschritten. Bitte passen Sie das Budget an oder
                            optimieren Sie die Nutzung Ihres Chatbots.
                        </p>
                    </div>
                )}
            </Card>

            {/* Graphen und Diagramme */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Nutzer-Graph */}
                <Card className="p-6">
                    <div className="flex items-center mb-4">
                        <Users className="h-6 w-6 text-blue-500 mr-2" />
                        <h3 className="text-lg font-semibold">Nutzerentwicklung</h3>
                    </div>
                    <div className="h-80">
                        {userGraph.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={userGraph}
                                    margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 12 }}
                                        tickMargin={10}
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #f0f0f0',
                                            borderRadius: '4px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                        }}
                                        formatter={(value) => [value.toLocaleString(), '']}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: 15 }} />
                                    <Line
                                        type="monotone"
                                        dataKey="newUsers"
                                        name="Neue Nutzer"
                                        stroke="#00C49F"
                                        strokeWidth={2}
                                        dot={{ r: 3 }}
                                        activeDot={{ r: 5 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="returningUsers"
                                        name="Wiederkehrende Nutzer"
                                        stroke="#0088FE"
                                        strokeWidth={2}
                                        dot={{ r: 3 }}
                                        activeDot={{ r: 5 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                <p>Keine Nutzerdaten für den ausgewählten Zeitraum verfügbar</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* LLM-Aktivitäts-Graph */}
                <Card className="p-6">
                    <div className="flex items-center mb-4">
                        <Brain className="h-6 w-6 text-purple-500 mr-2" />
                        <h3 className="text-lg font-semibold">LLM-Aktivität</h3>
                    </div>
                    <div className="h-80">
                        {llmGraph.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={llmGraph}
                                    margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 12 }}
                                        tickMargin={10}
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #f0f0f0',
                                            borderRadius: '4px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                        }}
                                        formatter={(value) => [value.toLocaleString(), '']}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: 15 }} />
                                    <Line
                                        type="monotone"
                                        dataKey="totalMessages"
                                        name="Gesamtnachrichten"
                                        stroke="#8884d8"
                                        strokeWidth={2}
                                        dot={{ r: 3 }}
                                        activeDot={{ r: 5 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="llmCalls"
                                        name="LLM-Aufrufe"
                                        stroke="#FF8042"
                                        strokeWidth={2}
                                        dot={{ r: 3 }}
                                        activeDot={{ r: 5 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="llmErrors"
                                        name="LLM-Fehler"
                                        stroke="#FF0000"
                                        strokeWidth={2}
                                        dot={{ r: 3 }}
                                        activeDot={{ r: 5 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                <p>Keine LLM-Aktivitätsdaten für den ausgewählten Zeitraum verfügbar</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Nutzer-Tortendiagramm und Detailkarten */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="p-6">
                    <div className="flex items-center mb-4">
                        <UserPlus className="h-6 w-6 text-green-500 mr-2" />
                        <h3 className="text-lg font-semibold">Nutzerverteilung</h3>
                    </div>
                    <div className="h-64">
                        {stats.totalUsers > 0 ? (
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
                                        label={({ name, percent }) =>
                                            `${name}: ${(percent * 100).toFixed(0)}%`
                                        }
                                    >
                                        {userPieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => [value.toLocaleString(), '']}
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #f0f0f0',
                                            borderRadius: '4px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                <p>Keine Nutzerverteilungsdaten verfügbar</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Detail-Karten */}
                <Card className="p-6 lg:col-span-2">
                    <div className="flex items-center mb-4">
                        <MessageSquare className="h-6 w-6 text-blue-500 mr-2" />
                        <h3 className="text-lg font-semibold">Detaillierte Statistiken</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                            <div className="flex items-center mb-2">
                                <UserPlus className="h-5 w-5 text-blue-500 mr-2" />
                                <h4 className="font-medium text-blue-800">Neue Nutzer</h4>
                            </div>
                            <p className="text-2xl font-bold text-blue-900">{stats.newUsers.toLocaleString()}</p>
                            <p className="text-sm text-blue-700 mt-1">
                                {stats.totalUsers > 0
                                    ? `${Math.round((stats.newUsers / stats.totalUsers) * 100)}% aller Nutzer`
                                    : '0% aller Nutzer'}
                            </p>
                        </div>

                        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                            <div className="flex items-center mb-2">
                                <Repeat className="h-5 w-5 text-green-500 mr-2" />
                                <h4 className="font-medium text-green-800">Wiederkehrende Nutzer</h4>
                            </div>
                            <p className="text-2xl font-bold text-green-900">{stats.returningUsers.toLocaleString()}</p>
                            <p className="text-sm text-green-700 mt-1">
                                {stats.totalUsers > 0
                                    ? `${Math.round((stats.returningUsers / stats.totalUsers) * 100)}% aller Nutzer`
                                    : '0% aller Nutzer'}
                            </p>
                        </div>

                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                            <div className="flex items-center mb-2">
                                <Brain className="h-5 w-5 text-purple-500 mr-2" />
                                <h4 className="font-medium text-purple-800">Bot-Nachrichten</h4>
                            </div>
                            <p className="text-2xl font-bold text-purple-900">{stats.botMessages.toLocaleString()}</p>
                            <p className="text-sm text-purple-700 mt-1">
                                {stats.botMessages + stats.userMessages > 0
                                    ? `${Math.round((stats.botMessages / (stats.botMessages + stats.userMessages)) * 100)}% aller Nachrichten`
                                    : '0% aller Nachrichten'}
                            </p>
                        </div>

                        <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                            <div className="flex items-center mb-2">
                                <MessageSquare className="h-5 w-5 text-orange-500 mr-2" />
                                <h4 className="font-medium text-orange-800">Nutzer-Nachrichten</h4>
                            </div>
                            <p className="text-2xl font-bold text-orange-900">{stats.userMessages.toLocaleString()}</p>
                            <p className="text-sm text-orange-700 mt-1">
                                {stats.botMessages + stats.userMessages > 0
                                    ? `${Math.round((stats.userMessages / (stats.botMessages + stats.userMessages)) * 100)}% aller Nachrichten`
                                    : '0% aller Nachrichten'}
                            </p>
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
                                onChange={(e) => setNewBudget(parseFloat(e.target.value) || 0)}
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