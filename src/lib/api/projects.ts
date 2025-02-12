// src/lib/api/projects.ts
import { sanityClient } from '@/lib/sanity/client';
import { getBotpressStats, getMessageHistory } from './botpress';

interface ProjectStatsResponse {
    aiSpendLimit: number;
    stats: {
        messages: number;
        botMessages: number;
        userMessages: number;
        sessions: number;
        aiSpend: number;
        users: {
            total: number;
            new: number;
            returning: number;
        }
    }
}

export async function getProjectStats(projectId: string): Promise<ProjectStatsResponse> {
    console.log('Fetching project stats for projectId:', projectId); // DEBUG Startpunkt

    try {
        console.log('Executing sanity query for project data...');
        const project = await sanityClient.fetch(`
            *[_type == "projekte" && _id == $projectId][0]{
                aiSpendLimit,
                environment->{
                    botId,
                    token,
                    workspaceId
                }
            }
        `, { projectId });

        if (!project?.environment) {
            console.error('No environment configuration found for projectId:', projectId);
            throw new Error('No environment configuration found for project');
        }

        console.log('Project Data:', project); // DEBUG: Projekt-Daten anzeigen
        console.log('Fetching Botpress statistics...');

        const botpressStats = await getBotpressStats({
            botId: project.environment.botId,
            token: project.environment.token,
            workspaceId: project.environment.workspaceId
        });

        console.log('Botpress Stats:', botpressStats); // DEBUG: Botpress-Statistiken anzeigen

        const combinedData = {
            aiSpendLimit: project.aiSpendLimit,
            stats: {
                messages: botpressStats.messages.total,
                botMessages: botpressStats.messages.bot,
                userMessages: botpressStats.messages.user,
                sessions: botpressStats.sessions,
                aiSpend: botpressStats.aiSpend || 0,
                users: botpressStats.users
            }
        };

        console.log('Combined Project Stats:', combinedData); // DEBUG: Kombinierte Ergebnisse anzeigen
        return combinedData;

    } catch (error) {
        console.error('Error in getProjectStats:', error); // DEBUG: Fehler detailliert anzeigen
        throw new Error('Failed to load project statistics.');
    }
}

export async function getProjectHistory(projectId: string) {
    console.log('Fetching project history for projectId:', projectId); // DEBUG Startpunkt

    try {
        console.log('Executing sanity query for project history...');
        const project = await sanityClient.fetch(`
            *[_type == "projekte" && _id == $projectId][0]{
                environment->{
                    botId,
                    token,
                    workspaceId
                }
            }
        `, { projectId });

        if (!project?.environment) {
            console.error('No environment configuration found for projectId:', projectId);
            throw new Error('No environment configuration found for project');
        }

        console.log('Project Environment for History:', project.environment); // DEBUG: Projektumgebung mitgeben

        const history = await getMessageHistory({
            botId: project.environment.botId,
            token: project.environment.token,
            workspaceId: project.environment.workspaceId
        });

        console.log('Project History:', history); // DEBUG: Verlauf anzeigen
        return history;

    } catch (error) {
        console.error('Error in getProjectHistory:', error); // DEBUG Fehlerhandhabung
        throw new Error('Failed to load project history.');
    }
}

export async function updateProjectBudget(projectId: string, newBudget: number) {
    console.log('Updating budget for projectId:', projectId, 'New Budget:', newBudget); // DEBUG Startpunkt

    try {
        const response = await fetch('/api/projects/budget', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ projectId, newBudget }),
        });

        if (!response.ok) {
            console.error('Failed to update budget. Status Code:', response.status); // DEBUG
            throw new Error('Failed to update budget');
        }

        const result = await response.json();
        console.log('Updated Budget Response:', result); // DEBUG Erfolgreiche Antwort
        return result;

    } catch (error) {
        console.error('Error in updateProjectBudget:', error); // DEBUG Fehlerhandhabung
        throw new Error('Failed to update budget.');
    }
}