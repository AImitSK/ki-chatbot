// src/sanity.config.ts
import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import structureBuilder from './sanity/structure'
import { projectId, dataset, apiVersion } from './sanity/env'
import schemaTypes from './sanity/schemaTypes'

// Typdefinitionen für die Dokumentaktionen
import type { DocumentActionComponent } from 'sanity'

// Eine Funktion, die eine Dokumentaktion zurückgibt
const createSendNotificationAction = (): DocumentActionComponent => {
  return (props) => {
    // Diese Funktion wird für jedes Dokument aufgerufen
    const { type, id } = props

    // Nur für Support-Tickets anzeigen
    if (type !== 'supportTicket') {
      return null
    }

    return {
      label: 'Antwort-Benachrichtigung senden',
      onHandle: async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/support/tickets/${id}/notify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'reply',
              message: 'Eine neue Antwort wurde zu Ihrem Ticket hinzugefügt.'
            }),
          })

          if (response.ok) {
            return { message: 'Benachrichtigung erfolgreich gesendet' }
          } else {
            const errorData = await response.json()
            return { message: `Fehler: ${errorData.error || 'Unbekannter Fehler'}` }
          }
        } catch (error) {
          console.error('Fehler:', error)
          return { message: 'Ein Fehler ist aufgetreten' }
        }
      }
    }
  }
}

// Eine Funktion, die eine Dokumentaktion zum Schließen eines Tickets zurückgibt
const createCloseTicketAction = (): DocumentActionComponent => {
  return (props) => {
    const { type, id } = props

    // Nur für Support-Tickets anzeigen
    if (type !== 'supportTicket') {
      return null
    }

    return {
      label: 'Ticket schließen mit Benachrichtigung',
      onHandle: async () => {
        try {
          // 1. Benachrichtigung senden (ohne Statusänderung)
          const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/support/tickets/${id}/notify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'closed',
              message: `Das Ticket wurde geschlossen.`
            }),
          })

          if (response.ok) {
            return {
              message: 'Benachrichtigung gesendet. Bitte ändere den Status manuell auf "Geschlossen".'
            }
          } else {
            const errorData = await response.json()
            return {
              message: 'Benachrichtigung fehlgeschlagen',
              tone: 'caution'
            }
          }
        } catch (error) {
          console.error('Fehler:', error)
          return { message: 'Fehler beim Senden der Benachrichtigung', tone: 'critical' }
        }
      }
    }
  }
}

// Hauptkonfiguration
export default defineConfig({
  name: 'default',
  title: 'SK Online Marketing Dashboard',
  projectId,
  dataset,
  apiVersion,
  basePath: '/studio',
  plugins: [
    deskTool({
      structure: structureBuilder
    }),
    visionTool()
  ],
  schema: {
    types: schemaTypes
  },
  document: {
    // Benutzerdefinierte Aktionen für Support-Tickets
    actions: (prev) => [
      ...prev,
      createSendNotificationAction(),
      createCloseTicketAction()
    ]
  }
})