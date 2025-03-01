// src/lib/sanity/queries.ts
import { client } from './client'

export const getUserData = async (userId: string) => {
    try {
        if (!userId) {
            console.error("getUserData: userId ist undefined oder leer");
            return null;
        }

        const userData = await client.fetch(
            `*[_type == "user" && _id == $userId][0]`,
            { userId }
        );
        return userData;
    } catch (error) {
        console.error('Fehler beim Abrufen der Benutzerdaten:', error);
        return null;
    }
};

export async function getCompanyData() {
    try {
        return await client.fetch(`
            *[_type == "unternehmen"][0] {
                _id,
                name,
                strasse,
                plz,
                ort,
                land,
                ustIdNr,
                telefon,
                email,
                webseite
            }
        `)
    } catch (error) {
        console.error('Fehler beim Abrufen der Unternehmensdaten:', error);
        return null;
    }
}

// Funktion für Vertragsdaten
export async function getContractData(userId: string) {
    try {
        if (!userId) {
            console.error("getContractData: userId ist undefined oder leer");
            return null;
        }

        console.log("Suche Vertragsdaten für Benutzer-ID:", userId);

        // Erweiterte Abfrage mit Dokumenten und Environment-Daten
        const contractData = await client.fetch(`
            *[_type == "projekte" && $userId in users[]._ref][0] {
                _id,
                titel,
                vertragsbeginn,
                vertragsende,
                aiSpendLimit,
                "environment": environment-> {
                    _id,
                    botId,
                    token,
                    workspaceId,
                    aktiv,
                    description
                },
                "vertragsmodell": vertragsmodell-> {
                    _id,
                    name,
                    beschreibung,
                    preis,
                    zahlungsintervall,
                    freeAiSpend,
                    supportlevel,
                    hitlFunktion,
                    mindestlaufzeit,
                    features[] {
                        feature,
                        included
                    }
                },
                "unternehmen": unternehmen-> {
                    _id,
                    name
                },
                "zusatzleistungen": zusatzleistungen[]-> {
                    _id,
                    leistung,
                    beschreibung,
                    preis,
                    kategorie,
                    einmalig
                },
                "dokumente": dokumente[]-> {
                    _id,
                    name,
                    typ,
                    erstellungsdatum,
                    beschreibung,
                    "datei": {
                        "asset": datei.asset->{
                            _id,
                            "url": url
                        }
                    }
                },
                notizen
            }
        `, {
            userId
        });

        if (!contractData) {
            console.log("Keine Vertragsdaten für Benutzer gefunden:", userId);
        } else {
            console.log("Vertragsdaten gefunden:", contractData.titel);
            // Zusätzliche Logausgabe für Environment-Daten
            if (contractData.environment) {
                console.log("Environment-Daten gefunden:",
                    `BotID: ${contractData.environment.botId}, ` +
                    `Token: ${contractData.environment.token ? "vorhanden" : "nicht vorhanden"}, ` +
                    `WorkspaceID: ${contractData.environment.workspaceId}`
                );
            } else {
                console.log("Keine Environment-Daten im Vertrag gefunden");
            }
        }

        return contractData;
    } catch (error) {
        console.error('Fehler beim Abrufen der Vertragsdaten:', error);
        return null;
    }
}

// Funktion für Rechnungen
export async function getInvoices(projectId: string) {
    try {
        if (!projectId) {
            console.error("getInvoices: projectId ist undefined oder leer");
            return [];
        }

        const invoices = await client.fetch(`
            *[_type == "rechnungen" && projekt._ref == $projectId] | order(rechnungsdatum desc) {
                _id,
                rechnungsnummer,
                rechnungsdatum,
                betrag,
                bezahlt,
                zahlungsdatum,
                "rechnungsPDF": {
                    "asset": rechnungsPDF.asset->{
                        _id,
                        "url": url
                    }
                }
            }
        `, { projectId });

        return invoices;
    } catch (error) {
        console.error('Fehler beim Abrufen der Rechnungen:', error);
        return [];
    }
}

// Funktion für Zusatzleistungen
export async function getAdditionalServices(contractId: string) {
    try {
        if (!contractId) {
            console.error("getAdditionalServices: contractId ist undefined oder leer");
            return [];
        }

        const additionalServices = await client.fetch(`
            *[_type == "projekte" && _id == $contractId][0] {
                "zusatzleistungen": zusatzleistungen[]-> {
                    _id,
                    leistung,
                    beschreibung,
                    preis,
                    kategorie,
                    einmalig
                }
            }
        `, { contractId });

        return additionalServices?.zusatzleistungen || [];
    } catch (error) {
        console.error('Fehler beim Abrufen der Zusatzleistungen:', error);
        return [];
    }
}

// Funktion für Vertragsdokumente
export async function getContractDocuments(projectId: string) {
    try {
        if (!projectId) {
            console.error("getContractDocuments: projectId ist undefined oder leer");
            return [];
        }

        // 1. Variante: Dokumente über direkte Referenz im Projekt abrufen
        const documents = await client.fetch(`
            *[_type == "projekte" && _id == $projectId][0] {
                "dokumente": dokumente[]-> {
                    _id,
                    name,
                    typ,
                    erstellungsdatum,
                    beschreibung,
                    "datei": {
                        "asset": datei.asset->{
                            _id,
                            "url": url
                        }
                    }
                }
            }
        `, { projectId });

        // 2. Alternative: Dokumente über Referenz von Dokumenten zum Projekt abrufen
        if (!documents?.dokumente || documents.dokumente.length === 0) {
            const altDocuments = await client.fetch(`
                *[_type == "vertragsdokumente" && projekt._ref == $projectId && aktiv == true] {
                    _id,
                    name,
                    typ,
                    erstellungsdatum,
                    beschreibung,
                    "datei": {
                        "asset": datei.asset->{
                            _id,
                            "url": url
                        }
                    }
                }
            `, { projectId });

            return altDocuments || [];
        }

        return documents.dokumente || [];
    } catch (error) {
        console.error('Fehler beim Abrufen der Vertragsdokumente:', error);
        return [];
    }
}

// Debugging-Funktion, um Projekte für einen Benutzer zu finden
export async function debugUserProjects(userId: string) {
    try {
        if (!userId) {
            console.error("debugUserProjects: userId ist undefined oder leer");
            return [];
        }

        console.log("Suche Projekte für Benutzer-ID:", userId);

        // Definiere einen Typ für die Projekt-Daten
        interface ProjectData {
            _id: string;
            titel: string;
            userIds: string[];
            environmentRef: string;
            environment?: {
                _id: string;
                botId?: string;
                token?: string;
                workspaceId?: string;
                aktiv?: boolean;
            };
        }

        const userProjects = await client.fetch<ProjectData[]>(`
            *[_type == "projekte" && $userId in users[]._ref] {
                _id,
                titel,
                "userIds": users[]._ref,
                "environmentRef": environment._ref,
                "environment": environment-> {
                    _id, 
                    botId,
                    token,
                    workspaceId,
                    aktiv
                }
            }
        `, { userId });

        if (userProjects && userProjects.length > 0) {
            console.log(`${userProjects.length} Projekt(e) für Benutzer gefunden:`);

            // Detaillierte Infos für jedes Projekt ausgeben
            userProjects.forEach((project: ProjectData, index: number) => {
                console.log(`Projekt ${index + 1}: ${project.titel} (ID: ${project._id})`);
                console.log(`  - Environment Ref: ${project.environmentRef || 'Keine'}`);

                if (project.environment) {
                    console.log(`  - Environment Daten gefunden:`);
                    console.log(`    - Bot ID: ${project.environment.botId || 'Keine'}`);
                    console.log(`    - Token: ${project.environment.token ? 'Vorhanden' : 'Nicht vorhanden'}`);
                    console.log(`    - Workspace ID: ${project.environment.workspaceId || 'Keine'}`);
                    console.log(`    - Aktiv: ${project.environment.aktiv ? 'Ja' : 'Nein'}`);
                } else {
                    console.log(`  - Keine Environment Daten vorhanden`);
                }

                // Überprüfen, ob der aktuelle Benutzer in der Benutzerliste enthalten ist
                const userFound = project.userIds.includes(userId);
                console.log(`  - Benutzer ${userId} ist ${userFound ? 'in' : 'NICHT in'} der Benutzerliste`);
            });
        } else {
            console.log("Keine Projekte für diesen Benutzer gefunden");
        }

        return userProjects;
    } catch (error) {
        console.error('Fehler beim Debuggen der Benutzerprojekte:', error);
        console.error(error);
        return [];
    }
}

// Debugging-Funktion, um ein spezifisches Environment-Dokument zu überprüfen
export async function debugEnvironment(environmentId: string) {
    try {
        if (!environmentId) {
            console.error("debugEnvironment: environmentId ist undefined oder leer");
            return null;
        }

        const envData = await client.fetch(`
            *[_type == "environment" && _id == $environmentId][0] {
                _id,
                botId,
                token,
                workspaceId,
                aktiv,
                description
            }
        `, { environmentId });

        console.log("Environment-Daten direkt:", envData);
        return envData;
    } catch (error) {
        console.error('Fehler beim Abrufen der Environment-Daten:', error);
        return null;
    }
}