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

        // Erweiterte Abfrage mit Dokumenten
        const contractData = await client.fetch(`
            *[_type == "projekte" && $userId in users[]._ref][0] {
                _id,
                titel,
                vertragsbeginn,
                vertragsende,
                aiSpendLimit,
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