// src/lib/swr/fetcher.ts
export const fetcher = async (url: string) => {
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error('Ein Fehler ist beim Laden der Daten aufgetreten')
    }
    return response.json()
}