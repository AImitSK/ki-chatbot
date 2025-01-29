# Chatbot Kunden-Backend - Inhaltsverzeichnis
1. Projektübersicht
1.1 Ziel & Zweck 
1.2 Hauptfunktionen 
1.3 Zielgruppe 
1.4 Erwartetes Nutzerverhalten
2. Technischer Stack
2.1 Core Technologies (Next.js, TypeScript, Tailwind) 
2.2 Backend & CMS (Sanity, NextAuth) 
2.3 Externe Services (Botpress, Sendgrid) 
2.4 UI Framework (Catalyst UI)
3. Projektstruktur
3.1 Verzeichnisstruktur 
3.2 Komponentenorganisation
3.3 API-Struktur 3.4 Asset-Management
4. Datenmodell (Sanity Schemas)
4.1 Projekte (projekte.ts) 
4.2 Benutzer (user.ts) 
4.3 Unternehmen (unternehmen.ts) 
4.4 Vertragsmodelle (vertragsmodelle.ts)
4.5 Zusatzleistungen (zusatzleistungen.ts) 
4.6 Environment (environment.ts) 
4.7 Rechnungen (rechnungen.ts) 
4.8 Schema-Beziehungen
5. Frontend-Architektur
5.1 Dashboard 
5.2 Profil 
5.3 Unternehmen 
5.4 Vertrag 
5.5 Support 
5.6 Shared Components 
5.7 Forms & Validation
6. Backend-Architektur
6.1 API-Routes 
6.2 Authentication & Authorization 
6.3 Middleware 
6.4 Error Handling 
6.5 Data Validation
7. Integrationen
7.1 Botpress Integration 
7.2 Sanity Integration 
7.3 Sendgrid Integration
8. Authentifizierung & Berechtigungen
8.1 Benutzerrollen 
8.2 Zugriffsrechte 
8.3 Session-Management 
8.4 Password-Reset Flow
9. Geschäftsprozesse
9.1 Onboarding 
9.2 Rechnungsstellung 
9.3 Support-Workflow 
9.4 Vertragsänderungen
10. State Management
10.1 Frontend State
10.2 Cache-Strategie
10.3 Real-time Updates
11. Testing
11.1 Unit Tests
11.2 Integration Tests
11.3 E2E Tests
11.4 Test Coverage
12. Deployment
12.1 Environment Setup
12.2 CI/CD Pipeline
12.3 Monitoring
12.4 Backup-Strategie
13. Sicherheit
13.1 CORS
13.2 Rate Limiting
13.3 Input Validation
13.4 XSS Protection
14. Performance
14.1 Caching
14.2 Optimierungen
14.3 Monitoring
15. Dokumentation
15.1 API-Dokumentation
15.2 Entwickler-Guidelines
15.3 Benutzerhandbuch
15.4 Wartungshandbuch


 
# 1. Projektübersicht
## 1.1 Ziel & Zweck
Das Kunden-Backend dient als zentrale Verwaltungsplattform für Unternehmen, die KI-Chatbots von SK Online Marketing nutzen. Es ermöglicht Kunden die eigenständige Verwaltung und Überwachung ihrer Chatbot-Dienste, ohne direkten Zugriff auf die Botpress-Plattform zu benötigen.
Hauptziele:
-	Transparenz über Chatbot-Aktivitäten
-	Selbstverwaltung von Unternehmens- und Nutzerdaten
-	Kontrolle über AI Spend-Limits
-	Zentraler Zugang zu Support und Dokumentation
-	Einsicht in Vertragsdaten und Rechnungen
## 1.2 Hauptfunktionen
**Chatbot-Monitoring**
-	Echtzeit-Statistiken zur Bot-Nutzung
-	Einsicht in Chatverläufe
-	Überwachung des AI Spend-Limits

**Benutzerverwaltung**
 Zwei Admin-Rollen:
    1. Standard-Admin (voller Zugriff auf Bot & Daten)
    2. Rechnungs-Admin (zusätzlich Rechnungsempfänger)
Verwaltung von Benutzerrechten
-	Profilverwaltung

**Dokumentenverwaltung**
-	Einsicht in Rechnungen (PDF-Format, aus Lexoffice)
-	Vertragsdokumente
-	Technische Dokumentation

**Support & Hilfe**
-	Direkter Zugang zum Support-System
-	Integrierte Dokumentation
-	FAQ-Bereich

## 1.3 Zielgruppe
-	Primär: Kleine und mittlere Unternehmen (KMU)
-	Erwartete Nutzerbasis: 20-30 Unternehmen
-	Typische Benutzer:
o	Geschäftsführer/Marketing-Verantwortliche (Rechnungs-Admins)
o	Marketing-/Projekt-Manager (Standard-Admins)

## 1.4 Erwartetes Nutzerverhalten
**Regelmäßige Nutzung**
-	Tägliche/wöchentliche Prüfung der Bot-Statistiken
-	Monatliche Überprüfung des AI Spend-Limits
-	Gelegentliche Anpassung von Unternehmensdaten

**Sporadische Nutzung**
-	Einsicht in neue Rechnungen
-	Zugriff auf Support bei Bedarf
-	Anpassung von Benutzereinstellungen

**Seltene Aktionen**
-	Änderung von Vertragsdaten
-	Update von Unternehmensinfos
-	Pas# 2. Technischer Stack

## 2.1 Core Technologies

### Next.js
-	Version: 14 (App Router)
-	Begründung:
o	Server-Side Rendering für bessere Performance
o	Optimierte Routing-Struktur
o	Integrierte API-Routes
o	Einfache Integration mit Sanity und Botpress
-	Kernfunktionen:
o	Server Components
o	Route Groups
o	API Routes für Botpress & Sendgrid Integration

### TypeScript
-	Strikte Typisierung für:
o	Sanity Schemas
o	API Responses
o	Frontend Components
-	Type Definitionen für:
o	Botpress API Responses
o	Sanity Documents
o	NextAuth Session

### Tailwind CSS
-	Styling-Lösung
-	Integration mit Catalyst UI
-	Custom Utility Classes für:
o	Dashboard Layout
o	Responsive Design
o	Komponenten-Themes

## 2.2 Backend & CMS

### Sanity CMS
-	Version: Latest
-	Installation: `npx sanity@latest init`
-	Hauptfunktionen:
o	Content Management
o	Benutzerverwaltung
o	Dokumentenspeicher
-	Custom Components für:
o	Rechnungsanzeige
o	Benutzer-Dashboard
o	Statistik-Visualisierung

### NextAuth mit Sanity
-	Installation: `npm i next-auth-sanity`
-	Funktionen:
o	Benutzerauthentifizierung
o	Session Management
o	Rollenbasierte Zugriffskontrolle
-	Integration mit:
o	Sanity User Schema
o	Email-basierte Authentifizierung

## 2.3 Externe Services

### Botpress
-	Integration via Client
-	Installation: `npm install --save @botpress/client`
-	Hauptfunktionen:
o	Chat-Statistiken Abruf
o	Konversationshistorie
o	Webhook-Integration
-	API-Endpoints für:
o	Statistik-Abfragen
o	Chat-Verlauf
o	Bot-Konfiguration

### Sendgrid
-	Installation: `npm install --save @sendgrid/client`
-	Verwendung für:
o	Support-Benachrichtigungen
o	Password-Reset Emails
o	System-Benachrichtigungen
-	Templates für:
o	Willkommens-Emails
o	Reset-Password
o	Support-Tickets

## 2.4 UI Framework

### Catalyst UI
-	Documentation: https://catalyst.tailwindui.com/docs
-	Komponenten für:
o	Dashboard Layout
o	Navigation
o	Formulare
o	Tabellen
o	Charts
-	Custom Components:
o	Statistik-Widgets
o	Chat-Verlauf Anzeige
o	Rechnungs-Übersichtsword-Reset

# 3. Projektstruktur

## 3.1 Verzeichnisstruktur

```
src/
├── app/                    # Next.js App Router Struktur
│   ├── api/               # API Endpoints
│   │   ├── auth/         # Auth API Routes
│   │   ├── botpress/     # Botpress Integration
│   │   ├── user/         # User Management
│   │   └── webhook/      # Webhook Endpoints
│   ├── auth/             # Auth Pages
│   │   ├── login/
│   │   └── newPassword/
│   ├── studio/           # Sanity Studio
│   │   └── [[...tool]]/
│   └── dashboard/        # Frontend Routes
│       ├── profil/
│       ├── unternehmen/
│       ├── vertrag/
│       └── support/
├── components/           # React Components
│   ├── dashboard/        # Dashboard spezifische Komponenten
│   │   ├── Statistics.tsx
│   │   ├── ChatHistory.tsx
│   │   └── SpendLimit.tsx
│   ├── forms/           # Formulare
│   │   ├── ProfileForm.tsx
│   │   └── CompanyForm.tsx
│   └── ui/             # Wiederverwendbare UI Komponenten
│       ├── Button.tsx
│       └── Card.tsx
├── lib/                # Utility Functions & Configs
│   ├── sendgrid/      # Sendgrid Integration
│   │   ├── client.ts
│   │   └── templates.ts
│   ├── sanity/        # Sanity Configuration
│   │   ├── client.ts
│   │   └── queries.ts
│   ├── botpress/      # Botpress Integration
│   │   ├── client.ts
│   │   └── types.ts
│   └── auth/          # Auth Configuration
│       └── options.ts
├── types/             # TypeScript Definitionen
│   ├── sanity.ts
│   ├── botpress.ts
│   └── next-auth.d.ts
└── sanity/           # Sanity CMS
├── schemaTypes/  # Content Schemas
│   ├── projekte.ts
│   ├── user.ts
│   └── ...
└── utils/        # Sanity Utilities
```

## 3.2 Komponentenorganisation

### Shared Components
-	Wiederverwendbare UI-Komponenten
-	Form-Komponenten
-	Layout-Komponenten
-	Chart & Statistik Komponenten

### Page-Specific Components
-	Dashboard Widgets
-	Profilansicht
-	Unternehmensansicht
-	Vertragsübersicht
-	Support-Interface

## 3.3 API-Struktur

### Authentication
```
/api/auth/
├── [...nextauth]    # NextAuth Routes
├── register        # Neue Benutzer
└── password-reset  # Passwort zurücksetzen
```
### Botpress Integration
```
/api/botpress/
├── statistics      # Chat Statistiken
├── conversations   # Chatverlauf
└── webhook         # Botpress Webhooks
```
### User Management
```
/api/user/
├── profile         # Profilverwaltung
└── settings        # Benutzereinstellungen
```
### Data Management
```
/api/data/
├── company         # Unternehmensdaten
└── contract        # Vertragsdaten
```

## 3.4 Asset-Management
### Statische Assets
-	Logo & Branding
-	UI Icons
-	Standardbilder

### Dynamische Assets
-	Benutzer-Avatare
-	Rechnungs-PDFs
-	Vertragsdokumente

### Asset Storage
-	Sanity für Bilder & Dokumente
-	Lokales Caching für Performance
-	CDN Integration für schnelle Auslieferung
Die Struktur wurde so gewählt, weil sie:
-	Klare Trennung von Verantwortlichkeiten bietet
-	Einfache Navigation im Code ermöglicht
-	Skalierbar für zukünftige Erweiterungen ist
-	Best Practices von Next.js und React folgt
-	Einfaches Testing ermöglicht


# 4. Datenmodell (Sanity Schemas)

## 4.1 Projekte (projekte.ts)
```typescript
{
  name: 'projekte',
  title: 'Projekte',
  type: 'document',
  fields: [
    {
      name: 'titel',
      title: 'Titel',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'titel',
        maxLength: 96
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'users',
      title: 'Berechtigte User',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'user'}]}],
      validation: Rule => Rule.required().min(1)
    },
    {
      name: 'unternehmen',
      title: 'Unternehmen',
      type: 'reference',
      to: [{type: 'unternehmen'}],
      validation: Rule => Rule.required()
    },
    {
      name: 'rechnungsempfaenger',
      title: 'Rechnungsempfänger',
      type: 'reference',
      to: [{type: 'user'}],
      validation: Rule => Rule.required()
    },
    {
      name: 'vertragsmodell',
      title: 'Vertragsmodell',
      type: 'reference',
      to: [{type: 'vertragsmodelle'}],
      validation: Rule => Rule.required()
    },
    {
      name: 'vertragsbeginn',
      title: 'Vertragsbeginn',
      type: 'date',
      validation: Rule => Rule.required()
    },
    {
      name: 'vertragsende',
      title: 'Vertragsende',
      type: 'date'
    },
    {
      name: 'aiSpendLimit',
      title: 'AI Spend-Limit',
      type: 'number',
      validation: Rule => Rule.required().min(0)
    },
    {
      name: 'zusatzleistungen',
      title: 'Zusatzleistungen',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'zusatzleistungen'}]}]
    },
    {
      name: 'environment',
      title: 'Environment',
      type: 'reference',
      to: [{type: 'environment'}],
      validation: Rule => Rule.required()
    },
    {
      name: 'notizen',
      title: 'Notizen',
      type: 'text',
      rows: 4
    }
  ],
  preview: {
    select: {
      title: 'titel',
      company: 'unternehmen.name'
    },
    prepare: ({title, company}) => ({
      title: title,
      subtitle: company
    })
  }
}
```

4.2 Benutzer (user.ts)
```typescript
{
  name: 'user',
  title: 'Users',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: Rule => Rule.required().email()
    },
    {
      name: 'telefon',
      title: 'Telefon',
      type: 'string'
    },
    {
      name: 'position',
      title: 'Position',
      type: 'string'
    },
    {
      name: 'avatar',
      title: 'Avatar',
      type: 'image',
      options: {
        hotspot: true
      }
    },
    {
      name: 'aktiv',
      title: 'Aktiv',
      type: 'boolean',
      initialValue: true
    },
    {
      name: 'createdAt',
      title: 'Created at',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    },
    {
      name: 'updatedAt',
      title: 'Updated at',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    },
    {
      name: 'password',
      type: 'string',
      hidden: true
    }
  ]
}
```

4.3 Unternehmen (unternehmen.ts)
```typescript
{
  name: 'unternehmen',
  title: 'Unternehmen',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Unternehmen',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'strasse',
      title: 'Straße',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'plz',
      title: 'PLZ',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'ort',
      title: 'Ort',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'land',
      title: 'Land',
      type: 'string',
      validation: Rule => Rule.required(),
      initialValue: 'Deutschland'
    },
    {
      name: 'ustIdNr',
      title: 'UST IDNr.',
      type: 'string'
    },
    {
      name: 'telefon',
      title: 'Telefon',
      type: 'string'
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: Rule => Rule.email()
    },
    {
      name: 'webseite',
      title: 'Webseite',
      type: 'url'
    }
  ]
}
```


## 4.4 Vertragsmodelle (vertragsmodelle.ts)
```typescript
{
  name: 'vertragsmodelle',
  title: 'Vertragsmodelle',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'beschreibung',
      title: 'Beschreibung',
      type: 'text',
      rows: 4
    },
    {
      name: 'preis',
      title: 'Preis',
      type: 'number',
      validation: Rule => Rule.required().min(0)
    },
    {
      name: 'zahlungsintervall',
      title: 'Zahlungsintervall',
      type: 'string',
      options: {
        list: [
          {title: 'Monatlich', value: 'monthly'},
          {title: 'Jährlich', value: 'yearly'}
        ]
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'freeAiSpend',
      title: 'Free AI Spend',
      type: 'number',
      validation: Rule => Rule.required().min(0)
    },
    {
      name: 'supportlevel',
      title: 'Supportlevel',
      type: 'string',
      options: {
        list: [
          {title: 'Email', value: 'email'},
          {title: 'Email und Telefon', value: 'email_phone'},
          {title: 'Premium Support', value: 'premium'}
        ]
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'hitlFunktion',
      title: 'HITL-Funktion',
      type: 'boolean',
      initialValue: false
    }
  ]
}
```


## 4.5 Zusatzleistungen (zusatzleistungen.ts)
```typescript
{
  name: 'zusatzleistungen',
  title: 'Zusatzleistungen',
  type: 'document',
  fields: [
    {
      name: 'leistung',
      title: 'Leistung',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'beschreibung',
      title: 'Beschreibung',
      type: 'text',
      rows: 3
    },
    {
      name: 'preis',
      title: 'Preis',
      type: 'number',
      validation: Rule => Rule.required().min(0)
    }
  ]
}
```

## 4.6 Environment (environment.ts)
```typescript
{
  name: 'environment',
  title: 'Environment',
  type: 'document',
  fields: [
    {
      name: 'botId',
      title: 'NEXT_PUBLIC_BOTPRESS_BOT_ID',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'token',
      title: 'NEXT_PUBLIC_BOTPRESS_TOKEN',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'workspaceId',
      title: 'NEXT_PUBLIC_BOTPRESS_WORKSPACE_ID',
      type: 'string',
      validation: Rule => Rule.required()
    }
  ]
}
```


## 4.7 Rechnungen (rechnungen.ts)
```typescript
{
  name: 'rechnungen',
  title: 'Rechnungen',
  type: 'document',
  fields: [
    {
      name: 'rechnungsnummer',
      title: 'Rechnungsnummer',
      type: 'number',
      validation: Rule => Rule.required()
    },
    {
      name: 'rechnungsdatum',
      title: 'Rechnungsdatum',
      type: 'date',
      validation: Rule => Rule.required()
    },
    {
      name: 'projekt',
      title: 'Projekt',
      type: 'reference',
      to: [{type: 'projekte'}],
      validation: Rule => Rule.required()
    },
    {
      name: 'rechnungsPDF',
      title: 'Rechnung als PDF',
      type: 'file',
      validation: Rule => Rule.required()
    }
  ],
  preview: {
    select: {
      title: 'rechnungsnummer',
      date: 'rechnungsdatum',
      project: 'projekt.titel'
    },
    prepare: ({title, date, project}) => ({
      title: `Rechnung ${title}`,
      subtitle: `${project} - ${new Date(date).toLocaleDateString()}`
    })
  }
}
```

## 4.8 Schema-Beziehungen
Die wichtigsten Beziehungen sind:
1.	Projekt-zentrische Beziehungen 
o	Projekt → User (mehrere, inkl. Rechnungsempfänger)
o	Projekt → Unternehmen (1:1)
o	Projekt → Vertragsmodell (1:1)
o	Projekt → Zusatzleistungen (mehrere)
o	Projekt → Environment (1:1)
o	Projekt ← Rechnungen (mehrere)
2.	Berechtigungsbeziehungen 
o	User ← Projekte (mehrere)
o	User als Rechnungsempfänger ← Projekte (mehrere)
3.	Vertragliche Beziehungen 
o	Vertragsmodell ← Projekte (mehrere)
o	Zusatzleistungen ← Projekte (mehrere)
4.	Dokumentenbeziehungen 
o	Rechnungen → Projekt (1:1)

# 5. Frontend-Architektur

## 5.1 Dashboard
### Hauptkomponente
```typescript
// app/dashboard/page.tsx
import { BotStats } from '@/components/dashboard/BotStats'
import { ChatHistory } from '@/components/dashboard/ChatHistory'
import { SpendingOverview } from '@/components/dashboard/SpendingOverview'

export default async function DashboardPage() {
  // Server Component für initiale Datenladung
  const stats = await getBotStats()
  const chats = await getRecentChats()
  const spending = await getSpendingData()

  return (
    <div className="space-y-6">
      <BotStats data={stats} />
      <SpendingOverview data={spending} />
      <ChatHistory chats={chats} />
    </div>
  )
}

```

Unterkomponenten
•	BotStats: Chatbot Statistiken (Nachrichten, Nutzer, etc.)
•	ChatHistory: Letzte Konversationen
•	SpendingOverview: AI Spend-Limit Übersicht
•	NotificationArea: System & Support Benachrichtigungen
## 5.2 Profil
### Hauptkomponente
```typescript
// app/dashboard/profil/page.tsx
import { ProfileForm } from '@/components/forms/ProfileForm'
import { AccountSettings } from '@/components/profile/AccountSettings'

export default async function ProfilPage() {
  const userData = await getCurrentUser()
  
  return (
    <div className="space-y-8">
      <ProfileForm initialData={userData} />
      <AccountSettings />
    </div>
  )
}

```

Unterkomponenten
•	ProfileForm: Persönliche Daten bearbeiten
•	AccountSettings: Kontoeinstellungen
•	AvatarUpload: Profilbild-Upload
•	SecuritySettings: Passwort & Sicherheit
## 5.3 Unternehmen
Hauptkomponente
```typescript
// app/dashboard/unternehmen/page.tsx
import { CompanyForm } from '@/components/forms/CompanyForm'
import { BillingInfo } from '@/components/company/BillingInfo'

export default async function UnternehmenPage() {
  const companyData = await getCompanyData()
  
  return (
    <div className="space-y-8">
      <CompanyForm initialData={companyData} />
      <BillingInfo />
    </div>
  )
}
```

Unterkomponenten
•	CompanyForm: Unternehmensdaten bearbeiten
•	BillingInfo: Rechnungsinformationen
•	CompanyUsers: Benutzerverwaltung
•	DocumentsOverview: Wichtige Dokumente
## 5.4 Vertrag
Hauptkomponente
```typescript
// app/dashboard/vertrag/page.tsx
import { ContractOverview } from '@/components/contract/ContractOverview'
import { AdditionalServices } from '@/components/contract/AdditionalServices'
import { InvoiceList } from '@/components/contract/InvoiceList'

export default async function VertragPage() {
  const contractData = await getContractData()
  
  return (
    <div className="space-y-8">
      <ContractOverview data={contractData} />
      <AdditionalServices />
      <InvoiceList />
    </div>
  )
}

```

Unterkomponenten
•	ContractOverview: Vertragsdetails
•	AdditionalServices: Zusatzleistungen verwalten
•	InvoiceList: Rechnungsübersicht
•	ContractDocuments: Vertragsdokumente

## 5.5 Support
Hauptkomponente
```typescript
// app/dashboard/support/page.tsx
import { FAQSection } from '@/components/support/FAQSection'
import { SupportTickets } from '@/components/support/SupportTickets'
import { Documentation } from '@/components/support/Documentation'

export default async function SupportPage() {
  return (
    <div className="space-y-8">
      <FAQSection />
      <SupportTickets />
      <Documentation />
    </div>
  )
}

```

Unterkomponenten
•	FAQSection: Häufig gestellte Fragen
•	SupportTickets: Ticket-System
•	Documentation: Integrationsdokumentation
•	ContactOptions: Kontaktmöglichkeiten
## 5.6 Shared Components
Layout Components
```typescript
// components/layout/DashboardLayout.tsx
export function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="ml-64 p-8">
        <TopNav />
        {children}
      </main>
    </div>
  )
}
```
UI Components
•	Button: Wiederverwendbare Button-Komponente
•	Card: Container für Inhaltsblöcke
•	Table: Datentabellen
•	Modal: Dialogfenster
•	Alert: Benachrichtigungen
## 5.7 Forms & Validation
Form-Handling
•	Verwendung von React Hook Form
•	Zod für Schema-Validation
•	Custom Error Handling
•	Automatische Speicherung
Validation Rules
•	Email-Validierung
•	Pflichtfelder
•	Numerische Grenzen
•	Format-Überprüfungen
# 6. Backend-Architektur

## 6.1 API-Routes

### Authentication Routes
```typescript
// app/api/auth/[...nextauth]/route.ts
import { authOptions } from '@/lib/auth/options'
import NextAuth from 'next-auth'

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

Botpress Integration Routes
```typescript
// app/api/botpress/statistics/route.ts
import { NextResponse } from 'next/server'
import { getBotpressClient } from '@/lib/botpress/client'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  
  try {
    const client = getBotpressClient()
    const stats = await client.getStatistics(projectId)
    return NextResponse.json(stats)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
```

User Management Routes
```typescript
// app/api/user/profile/route.ts
import { getServerSession } from 'next-auth'
import { sanityClient } from '@/lib/sanity/client'

export async function PUT(req: Request) {
  const session = await getServerSession()
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  const data = await req.json()
  // Update user profile in Sanity
}
```


## 6.2 Authentication & Authorization
Middleware
```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token
  },
  pages: {
    signIn: '/auth/login'
  }
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*'
  ]
}
```

Protected API Routes
```typescript
// lib/auth/checkAccess.ts
export async function checkProjectAccess(
  userId: string,
  projectId: string
) {
  const project = await sanityClient.fetch(
    `*[_type == "projekte" && _id == $projectId][0]{
      "hasAccess": $userId in users[]._ref
    }`,
    { userId, projectId }
  )
  return project?.hasAccess
}
```

## 6.3 Middleware
Request Logging
```typescript
// middleware/logging.ts
export async function logRequest(
  req: Request,
  res: Response,
  next: () => void
) {
  const start = Date.now()
  await next()
  const duration = Date.now() - start
  
  console.log(`${req.method} ${req.url} ${duration}ms`)
}
```

Rate Limiting
```typescript
// middleware/rateLimit.ts
import rateLimit from 'express-rate-limit'

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 100 // Limit pro IP
})
```

## 6.4 Error Handling
Global Error Handler
```typescript
// lib/errors/handler.ts
export function handleApiError(error: unknown) {
  if (error instanceof SanityError) {
    return new Response('Database Error', { status: 500 })
  }
  
  if (error instanceof BotpressError) {
    return new Response('Chatbot Error', { status: 503 })
  }
  
  return new Response('Internal Server Error', { status: 500 })
}

Custom Error Types
```typescript
// types/errors.ts
export class SanityError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SanityError'
  }
}

export class BotpressError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BotpressError'
  }
}
```

## 6.5 Data Validation
Input Validation
```typescript
// lib/validation/schemas.ts
import { z } from 'zod'

export const profileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  telefon: z.string().optional(),
  position: z.string().optional()
})

export const companySchema = z.object({
  name: z.string().min(2),
  strasse: z.string(),
  plz: z.string().regex(/^\d{5}$/),
  ort: z.string(),
  ustIdNr: z.string().optional()
})
```

Validation Middleware
```typescript
// middleware/validate.ts
import { ZodSchema } from 'zod'

export function validateBody(schema: ZodSchema) {
  return async (req: Request) => {
    const body = await req.json()
    return schema.parse(body)
  }
}
```

# 7. Integrationen

## 7.1 Botpress Integration

### Webhook Setup
```typescript
// lib/botpress/webhooks.ts
export async function handleBotpressWebhook(
  req: Request
): Promise<Response> {
  const data = await req.json()
  
  // Validiere Webhook Signatur
  if (!isValidSignature(req.headers, data)) {
    return new Response('Invalid signature', { status: 401 })
  }

  // Verarbeite verschiedene Event-Typen
  switch (data.type) {
    case 'conversation.started':
      await trackNewConversation(data)
      break
    case 'message.received':
      await trackNewMessage(data)
      break
    case 'session.ended':
      await updateStatistics(data)
      break
  }

  return new Response('OK', { status: 200 })
}
```

Statistik-Abruf
```typescript
// lib/botpress/stats.ts
export class BotpressStats {
  private client: BotpressClient

  constructor(client: BotpressClient) {
    this.client = client
  }

  async getDailyStats(botId: string) {
    return await this.client.analytics.getDailyStats({
      botId,
      metrics: [
        'msg_received',
        'msg_sent',
        'sessions_started',
        'users_active'
      ]
    })
  }

  async getAIUsage(botId: string) {
    return await this.client.analytics.getTokenUsage({
      botId,
      period: 'month'
    })
  }
}
```


Chat-Verlauf
```typescript
// lib/botpress/conversations.ts
export async function getConversationHistory(
  botId: string,
  limit: number = 50
) {
  const client = getBotpressClient()
  
  const conversations = await client.conversations.list({
    botId,
    limit,
    orderBy: 'createdAt',
    direction: 'desc'
  })

  return conversations.map(formatConversation)
}
```

## 7.2 Sanity Integration
Custom Components
```typescript
// components/sanity/SpendLimitInput.tsx
import { NumberInputProps } from 'sanity'

export function SpendLimitInput(props: NumberInputProps) {
  return (
    <div>
      <NumberInput {...props} />
      <SpendLimitChart value={props.value} />
    </div>
  )
}
```
Queries & Mutations
```typescript
// lib/sanity/queries.ts
export const projectQueries = {
  getProjectWithStats: `*[_type == "projekte" && _id == $projectId][0]{
    ...,
    "stats": {
      "messageCount": *[_type == "botStats" && projectId == ^._id][0].messageCount,
      "activeUsers": *[_type == "botStats" && projectId == ^._id][0].activeUsers,
      "aiSpendCurrent": *[_type == "botStats" && projectId == ^._id][0].aiSpend
    },
    unternehmen->,
    vertragsmodell->,
    "rechnungen": *[_type == "rechnungen" && references(^._id)]
  }`
}
```

## 7.3 Sendgrid Integration
Email-Templates
```typescript
// lib/sendgrid/templates.ts
export const emailTemplates = {
  welcome: {
    id: 'd-xxx...', // Sendgrid Template ID
    data: (user: User) => ({
      name: user.name,
      loginUrl: `${process.env.NEXT_PUBLIC_URL}/auth/login`
    })
  },
  passwordReset: {
    id: 'd-yyy...',
    data: (user: User, token: string) => ({
      resetUrl: `${process.env.NEXT_PUBLIC_URL}/auth/reset-password?token=${token}`
    })
  },
  invoiceNotification: {
    id: 'd-zzz...',
    data: (invoice: Invoice) => ({
      invoiceNumber: invoice.number,
      amount: invoice.amount,
      dueDate: invoice.dueDate
    })
  }
}
```

Trigger-Events
```typescript
// lib/sendgrid/notifications.ts
export class EmailNotifications {
  private client: SendgridClient

  async sendWelcome(user: User) {
    const template = emailTemplates.welcome
    await this.client.send({
      to: user.email,
      templateId: template.id,
      dynamicTemplateData: template.data(user)
    })
  }

  async sendPasswordReset(user: User, token: string) {
    const template = emailTemplates.passwordReset
    await this.client.send({
      to: user.email,
      templateId: template.id,
      dynamicTemplateData: template.data(user, token)
    })
  }

  async notifyInvoice(invoice: Invoice, user: User) {
    const template = emailTemplates.invoiceNotification
    await this.client.send({
      to: user.email,
      templateId: template.id,
      dynamicTemplateData: template.data(invoice)
    })
  }
}
```


Fehlerbehandlung
```typescript
// lib/sendgrid/errorHandler.ts
export async function handleSendgridError(error: any) {
  if (error.response) {
    console.error('SendGrid API Error:', {
      status: error.response.status,
      body: error.response.body
    })
    
    // Retry bei temporären Fehlern
    if (error.response.status >= 500) {
      return await retryDelivery(error.config)
    }
  }
  
  throw new EmailDeliveryError(error.message)
}
```

# 8. Authentifizierung & Berechtigungen

## 8.1 Benutzerrollen
```typescript
// types/auth.ts
export enum UserRole {
  ADMIN = 'admin',           // SK Online Marketing Admin
  CLIENT_ADMIN = 'client_admin',     // Kunde mit Rechnungszugriff
  CLIENT_USER = 'client_user'        // Normaler Kundenuser
}
```
```typescript
// lib/auth/permissions.ts
export const rolePermissions = {
  admin: {
    canManageUsers: true,
    canViewAllProjects: true,
    canManageBilling: true,
    canAccessStudio: true
  },
  client_admin: {
    canManageUsers: false,
    canViewAllProjects: false,
    canManageBilling: true,
    canAccessStudio: false
  },
  client_user: {
    canManageUsers: false,
    canViewAllProjects: false,
    canManageBilling: false,
    canAccessStudio: false
  }
}
```
## 8.2 Zugriffsrechte
Middleware für Zugriffskontrolle
```typescript
// middleware/checkAccess.ts
export async function checkProjectAccess(
  userId: string,
  projectId: string,
  requiredPermission: string
) {
  // Prüfe User-Rolle
  const user = await getUserWithRole(userId)
  
  // Admin hat immer Zugriff
  if (user.role === UserRole.ADMIN) return true
  
  // Prüfe Projekt-Zugehörigkeit
  const hasAccess = await sanityClient.fetch(`
    *[_type == "projekte" && _id == $projectId][0] {
      "hasAccess": $userId in users[]._ref
    }
  `, { projectId, userId })

  return hasAccess
}
```

Frontend Zugriffskontrolle
```typescript
// components/auth/ProtectedComponent.tsx
export function ProtectedComponent({ 
  children, 
  requiredRole 
}: {
  children: React.ReactNode
  requiredRole: UserRole
}) {
  const { user } = useAuth()
  
  if (!hasRequiredRole(user, requiredRole)) {
    return <AccessDenied />
  }

  return <>{children}</>
}
```

## 8.3 Session-Management
NextAuth Konfiguration
```typescript
// lib/auth/options.ts
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        return await authenticateUser(credentials)
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      // Füge Benutzerrolle und Projekt-IDs zur Session hinzu
      session.user.role = token.role
      session.user.projectIds = token.projectIds
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.projectIds = user.projectIds
      }
      return token
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
    newUser: '/auth/register'
  }
}
```

## 8.4 Password-Reset Flow
Password Reset Prozess
```typescript
// app/api/auth/reset-password/route.ts
export async function POST(req: Request) {
  const { email } = await req.json()
  
  // Generiere Reset Token
  const resetToken = generateResetToken()
  
  // Speichere Token in Sanity mit Ablaufdatum
  await sanityClient.create({
    _type: 'resetToken',
    email,
    token: resetToken,
    expiresAt: new Date(Date.now() + 3600000) // 1 Stunde
  })
  
  // Sende Reset Email
  await sendResetEmail(email, resetToken)
  
  return new Response('Reset email sent')
}
```

Reset Token Validierung
```typescript
// lib/auth/resetToken.ts
export async function validateResetToken(token: string) {
  const result = await sanityClient.fetch(`
    *[_type == "resetToken" && token == $token && expiresAt > now()][0]
  `, { token })
  
  if (!result) {
    throw new Error('Invalid or expired token')
  }
  
  return result.email
}
```

Passwort Update
```typescript

// app/api/auth/update-password/route.ts
export async function POST(req: Request) {
  const { token, password } = await req.json()
  
  // Validiere Token
  const email = await validateResetToken(token)
  
  // Update Passwort
  const hashedPassword = await hashPassword(password)
  await updateUserPassword(email, hashedPassword)
  
  // Lösche verwendeten Token
  await deleteResetToken(token)
  
  return new Response('Password updated')
}

```

# 9. Geschäftsprozesse

## 9.1 Onboarding

### Onboarding-Flow
```typescript
// lib/processes/onboarding.ts
export class OnboardingProcess {
  async createNewCustomer({
    company,
    primaryContact,
    contract
  }: NewCustomerData) {
    // 1. Erstelle Unternehmen
    const companyDoc = await sanityClient.create({
      _type: 'unternehmen',
      ...company
    })

    // 2. Erstelle Hauptbenutzer
    const user = await createUser({
      ...primaryContact,
      role: UserRole.CLIENT_ADMIN
    })

    // 3. Erstelle Projekt
    const project = await sanityClient.create({
      _type: 'projekte',
      unternehmen: { _ref: companyDoc._id },
      users: [{ _ref: user._id }],
      vertragsmodell: { _ref: contract.modelId },
      vertragsbeginn: contract.startDate,
      aiSpendLimit: contract.aiSpendLimit
    })

    // 4. Erstelle Botpress Bot
    const botConfig = await setupBotpress(project._id)

    // 5. Speichere Bot-Environment
    await sanityClient.create({
      _type: 'environment',
      projekt: { _ref: project._id },
      ...botConfig
    })

    // 6. Sende Willkommens-Emails
    await sendWelcomeEmails(user, project)
  }
}

```

Willkommens-Emails
```typescript
// lib/processes/welcome.ts
async function sendWelcomeEmails(user: User, project: Project) {
  const emailer = new EmailNotifications()
  
  // Zugangsdaten Email
  await emailer.sendWelcome(user)
  
  // Technische Setup Informationen
  await emailer.sendTechnicalSetup(project)
  
  // Erste Schritte Guide
  await emailer.sendGettingStarted(user)
}
```

## 9.2 Rechnungsstellung
Rechnungsimport aus Lexoffice
```typescript
// lib/processes/billing.ts
export class BillingProcess {
  async importInvoice(lexofficeInvoice: LexofficeInvoice) {
    // 1. Lade PDF von Lexoffice
    const pdfBuffer = await downloadInvoicePDF(lexofficeInvoice.id)
    
    // 2. Speichere PDF in Sanity
    const pdfAsset = await sanityClient.assets.upload(
      'file',
      pdfBuffer,
      { filename: `invoice-${lexofficeInvoice.number}.pdf` }
    )

    // 3. Erstelle Rechnungsdokument
    const invoice = await sanityClient.create({
      _type: 'rechnungen',
      rechnungsnummer: lexofficeInvoice.number,
      rechnungsdatum: lexofficeInvoice.date,
      projekt: { _ref: lexofficeInvoice.projectId },
      rechnungsPDF: {
        _type: 'file',
        asset: { _ref: pdfAsset._id }
      }
    })

    // 4. Benachrichtige Rechnungsempfänger
    await notifyInvoiceRecipient(invoice)
  }
}
```

## 9.3 Support-Workflow
Support-Ticket-Prozess
```typescript
// lib/processes/support.ts
export class SupportProcess {
  async createTicket(ticketData: TicketData) {
    // 1. Erstelle Ticket
    const ticket = await sanityClient.create({
      _type: 'supportTicket',
      ...ticketData,
      status: 'new',
      createdAt: new Date().toISOString()
    })

    // 2. Bestätige Eingang
    await sendTicketConfirmation(ticket)

    // 3. Benachrichtige Support-Team
    await notifySupportTeam(ticket)

    // 4. Prüfe Support-Level und Priorität
    if (requiresImmediate(ticket)) {
      await escalateTicket(ticket)
    }
  }
}
```

## 9.4 Vertragsänderungen
Vertragsanpassungen
```typescript
// lib/processes/contract.ts
export class ContractProcess {
  async updateContract({
    projectId,
    changes
  }: ContractUpdateData) {
    // 1. Validiere Änderungen
    await validateContractChanges(changes)

    // 2. Berechne neue Kosten
    const newCosts = calculateNewCosts(changes)

    // 3. Aktualisiere Projekt
    const updatedProject = await sanityClient.patch(projectId)
      .set(changes)
      .commit()

    // 4. Erstelle Änderungsprotokoll
    await createChangeLog(projectId, changes)

    // 5. Sende Bestätigungen
    await sendContractUpdateConfirmation(updatedProject)

    // 6. Update Botpress wenn nötig
    if (changes.aiSpendLimit) {
      await updateBotpressConfig(projectId, changes)
    }
  }
}
```

# 10. State Management

## 10.1 Frontend State

### Zustandsverwaltung mit React Context
```typescript
// context/AppState.tsx
interface AppState {
  user: User | null;
  currentProject: Project | null;
  notifications: Notification[];
  botStats: BotStats | null;
}

const AppStateContext = createContext<{
  state: AppState;
  dispatch: Dispatch<AppStateAction>;
}>({ state: initialState, dispatch: () => null });

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    // Initial data loading
    loadUserData();
    loadProjectData();
    initializeRealTimeUpdates();
  }, []);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
}
```

10.2 Cache-Strategie
SWR Konfiguration
```typescript
// lib/swr/config.ts
export const swrConfig = {
  // Automatisches Revalidieren alle 30 Sekunden
  refreshInterval: 30000,
  
  // Erneuter Versuch bei Fehler
  shouldRetryOnError: true,
  
  // Daten im Cache für 24 Stunden behalten
  dedupingInterval: 86400000,
  
  // Optimistische Updates
  optimisticData: (currentData: any, newData: any) => ({
    ...currentData,
    ...newData
  })
};
```

Data Fetching
```typescript

// hooks/useProjectData.ts
export function useProjectData(projectId: string) {
  const { data, error, mutate } = useSWR(
    `/api/projects/${projectId}`,
    fetcher,
    {
      ...swrConfig,
      revalidateOnFocus: false,
      revalidateOnMount: true
    }
  );

  return {
    project: data,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate
  };
}
```
```typescript

// hooks/useProjectData.ts
export function useProjectData(projectId: string) {
  const { data, error, mutate } = useSWR(
    `/api/projects/${projectId}`,
    fetcher,
    {
      ...swrConfig,
      revalidateOnFocus: false,
      revalidateOnMount: true
    }
  );

  return {
    project: data,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate
  };
}
```


## 10.3 Real-time Updates
WebSocket Integration
```typescript
// lib/realtime/websocket.ts
export class RealtimeUpdates {
  private ws: WebSocket;
  private subscribers: Map<string, Function>;

  constructor(projectId: string) {
    this.ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}?projectId=${projectId}`
    );
    this.subscribers = new Map();

    this.ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      this.handleUpdate(update);
    };
  }

  private handleUpdate(update: any) {
    const { type, data } = update;
    const subscribers = this.subscribers.get(type);
    if (subscribers) {
      subscribers(data);
    }
  }

  subscribe(type: string, callback: Function) {
    this.subscribers.set(type, callback);
  }

  unsubscribe(type: string) {
    this.subscribers.delete(type);
  }
}
```typescript

Botpress Updates
```typescript
// components/dashboard/BotStats.tsx
export function BotStats({ projectId }: { projectId: string }) {
  const [stats, setStats] = useState<BotStats | null>(null);
  const realtime = useRealtime(projectId);

  useEffect(() => {
    // Subscribe to real-time bot statistics
    realtime.subscribe('bot_stats', (newStats: BotStats) => {
      setStats(prevStats => ({
        ...prevStats,
        ...newStats
      }));
    });

    return () => {
      realtime.unsubscribe('bot_stats');
    };
  }, [projectId]);

  return (
    <StatsDisplay data={stats} />
  );
}
```

# 11. Testing

## 11.1 Unit Tests
```typescript
// __tests__/unit/utils/validation.test.ts
import { validateSpendLimit } from '@/lib/validation'

describe('Spend Limit Validation', () => {
 test('rejects negative values', () => {
   expect(validateSpendLimit(-100)).toBeFalsy()
 })

 test('accepts valid spend limits', () => {
   expect(validateSpendLimit(1000)).toBeTruthy()
 })
})

// __tests__/unit/components/SpendLimitInput.test.tsx
import { render, fireEvent } from '@testing-library/react'
import { SpendLimitInput } from '@/components/SpendLimitInput'

describe('SpendLimitInput Component', () => {
 test('updates value on valid input', () => {
   const onChangeMock = jest.fn()
   const { getByRole } = render(
     <SpendLimitInput value={0} onChange={onChangeMock} />
   )
   
   fireEvent.change(getByRole('spinbutton'), { 
     target: { value: '100' } 
   })
   
   expect(onChangeMock).toHaveBeenCalledWith(100)
 })
})
```typescript
## 11.2 Integration Tests
```typescript
// __tests__/integration/api/project.test.ts
import { createMocks } from 'node-mocks-http'
import { handleProjectUpdate } from '@/app/api/project/route'

describe('Project API', () => {
  test('updates project successfully', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
      body: {
        projectId: 'test-id',
        aiSpendLimit: 1000
      }
    })

    await handleProjectUpdate(req, res)
    expect(res._getStatusCode()).toBe(200)
  })
})
```
```typescript
// __tests__/integration/sanity/queries.test.ts
describe('Sanity Queries', () => {
  test('fetches project with related data', async () => {
    const project = await sanityClient.fetch(
      projectQueries.getProjectWithStats,
      { projectId: 'test-id' }
    )
    
    expect(project).toHaveProperty('stats')
    expect(project).toHaveProperty('unternehmen')
  })
})

```

## 11.3 E2E Tests
```typescript
// cypress/e2e/login.cy.ts
describe('Login Flow', () => {
  it('successfully logs in with valid credentials', () => {
    cy.visit('/auth/login')
    cy.get('input[name="email"]').type('test@example.com')
    cy.get('input[name="password"]').type('password123')
    cy.get('button[type="submit"]').click()
    
    cy.url().should('include', '/dashboard')
    cy.get('[data-test="user-menu"]').should('be.visible')
  })
})

// cypress/e2e/project-management.cy.ts
describe('Project Management', () => {
  beforeEach(() => {
    cy.login() // Custom command für Login
  })

  it('updates spend limit successfully', () => {
    cy.visit('/dashboard/project/settings')
    cy.get('[data-test="spend-limit-input"]')
      .clear()
      .type('2000')
    cy.get('[data-test="save-button"]').click()
    
    cy.get('[data-test="success-message"]')
      .should('be.visible')
  })
})
```

11.4 Test Coverage
Jest Konfiguration
```typescript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
}
```

Test Workflows
```typescript
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm ci
      - name: Run unit tests
        run: npm run test:unit
      - name: Run integration tests
        run: npm run test:integration
      - name: Run E2E tests
        run: npm run test:e2e
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

# 12. Deployment

## 12.1 Environment Setup

### Vercel Konfiguration
```json
// vercel.json
{
  "env": {
    "NEXT_PUBLIC_SANITY_PROJECT_ID": "@sanity_project_id",
    "NEXT_PUBLIC_SANITY_DATASET": "production",
    "NEXT_PUBLIC_URL": "@site_url",
    "SENDGRID_API_KEY": "@sendgrid_api_key"
  },
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "regions": ["fra1"],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    }
  ]
}
```
Multi-Environment Setup
```typescript
# .env.development
NEXT_PUBLIC_SANITY_DATASET=development
NEXT_PUBLIC_URL=http://localhost:3000
``` 
```typescript
# .env.production
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_URL=https://dashboard.sk-online-marketing.de
```

## 12.2 CI/CD Pipeline
GitHub Actions Workflow
```typescript
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install Dependencies
        run: npm ci
      
      - name: Run Tests
        run: npm test
      
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SANITY_PROJECT_ID: ${{ secrets.SANITY_PROJECT_ID }}
      
      - name: Deploy to Vercel
        uses: vercel/action@v2
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'

```

## 12.3 Monitoring
Application Monitoring
```typescript
// lib/monitoring/sentry.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ]
});

// Benutzerdefinierte Events
export const logError = (error: Error, context?: any) => {
  Sentry.captureException(error, {
    extra: context
  });
};
```

Performance Monitoring
```typescript
// lib/monitoring/performance.ts
export const metrics = {
  pageLoad: async (route: string, duration: number) => {
    await fetch('/api/metrics/page-load', {
      method: 'POST',
      body: JSON.stringify({
        route,
        duration,
        timestamp: new Date().toISOString()
      })
    });
  },
  
  apiLatency: async (endpoint: string, duration: number) => {
    await fetch('/api/metrics/api-latency', {
      method: 'POST',
      body: JSON.stringify({
        endpoint,
        duration,
        timestamp: new Date().toISOString()
      })
    });
  }
};
```

## 12.4 Backup-Strategie
Sanity Backup
```typescript
// scripts/backup.ts
import { sanityClient } from '../lib/sanity';
import { writeFileSync } from 'fs';

async function backupSanityData() {
  const timestamp = new Date().toISOString();
  const types = ['projekte', 'user', 'unternehmen', 'rechnungen'];
  
  for (const type of types) {
    const data = await sanityClient.fetch(
      `*[_type == $type]`,
      { type }
    );
    
    writeFileSync(
      `./backups/${type}-${timestamp}.json`,
      JSON.stringify(data, null, 2)
    );
  }
}

// Automatisiertes Backup
export const scheduleBackups = () => {
  // Täglich um 3 Uhr morgens
  cron.schedule('0 3 * * *', async () => {
    await backupSanityData();
    await uploadToS3('backups/');
  });
};

```

Deployment-Strategie beinhaltet:
•	Automatisierte Deployments via GitHub Actions
•	Multi-Environment Setup (Development, Staging, Production)
•	Umfangreiches Monitoring
•	Regelmäßige Backups
•	Zero-Downtime Deployments
Besondere Merkmale:
•	Automatische Preview Deployments für Pull Requests
•	Rollback-Möglichkeit bei Problemen
•	Getrennte Datenbanken pro Environment
•	Automatisierte Tests vor Deployment
•	Kontinuierliche Überwachung der Systemgesundheit

# 13. Sicherheit

## 13.1 CORS
```typescript
// middleware.ts
import { NextResponse } from 'next/server'

const allowedOrigins = [
  'https://dashboard.sk-online-marketing.de',
  'https://studio.sk-online-marketing.de'
]

export function middleware(request: Request) {
  const origin = request.headers.get('origin')
  
  // Nur API Routes schützen
  if (request.url.includes('/api/')) {
    if (origin && !allowedOrigins.includes(origin)) {
      return new NextResponse(null, {
        status: 403,
        statusText: 'Forbidden',
        headers: {
          'Content-Type': 'text/plain'
        }
      })
    }

    return NextResponse.next({
      headers: {
        'Access-Control-Allow-Origin': origin || '',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    })
  }

  return NextResponse.next()
}

```

## 13.2 Rate Limiting
```typescript
// lib/security/rateLimit.ts
import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 100, // Limit pro IP
  standardHeaders: true,
  store: new RedisStore({
    prefix: 'rate-limit:',
    // Separate Limits für verschiedene Endpoints
    keyPrefix: (req) => {
      return `${req.ip}:${req.path}`
    }
  })
})

// Strengere Limits für Auth-Endpoints
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 Stunde
  max: 5, // 5 Versuche pro Stunde
  message: 'Zu viele Login-Versuche. Bitte später erneut versuchen.'
})
```
## 13.3 Input Validation
```typescript
// lib/security/validation.ts
import { z } from 'zod'

// Validierungsschemas
export const schemas = {
  userInput: z.object({
    email: z.string().email(),
    name: z.string().min(2).max(50),
    password: z.string().min(8).regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Passwort muss Groß/Kleinbuchstaben, Zahlen und Sonderzeichen enthalten'
    )
  }),

  spendLimit: z.object({
    limit: z.number().min(0).max(10000)
  }),

  projectUpdate: z.object({
    title: z.string().min(3),
    aiSpendLimit: z.number().min(0),
    users: z.array(z.string().uuid())
  })
}

// Validierungsmiddleware
export const validateInput = (schema: z.ZodSchema) => {
  return async (req: Request) => {
    const body = await req.json()
    return schema.parse(body)
  }
}
```

## 13.4 XSS Protection
```typescript
// lib/security/sanitize.ts
import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'

const window = new JSDOM('').window
const purify = DOMPurify(window)

export const sanitizeHtml = (dirty: string) => {
  return purify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  })
}

// React Component für sicheres HTML-Rendering
export function SafeHTML({ content }: { content: string }) {
  return (
    <div 
      dangerouslySetInnerHTML={{ 
        __html: sanitizeHtml(content) 
      }} 
    />
  )
}
```

Zusätzliche Sicherheitsmaßnahmen:
1. HTTP Headers
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  }
]
```

2. API Security
```typescript
// lib/security/api.ts
export const secureApiHandler = (handler: any) => {
  return async (req: Request) => {
    // Validate JWT
    const token = req.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Verify CSRF Token
    const csrfToken = req.headers.get('X-CSRF-Token')
    if (!validateCsrfToken(csrfToken)) {
      return new Response('Invalid CSRF Token', { status: 403 })
    }

    return handler(req)
  }
}
```

Sicherheitsfeatures:
•	CORS-Schutz
•	Rate Limiting
•	Input Validierung
•	XSS-Schutz
•	CSRF-Schutz
•	Secure Headers
•	Sanitization von User Input
•	API-Absicherung


# 14. Performance

## 14.1 Caching

### Server-Side Caching
```typescript
// lib/cache/redis.ts
import { Redis } from 'ioredis'

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: 6379,
})

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key)
    return data ? JSON.parse(data) : null
  },

  async set(key: string, data: any, ttl: number = 3600) {
    await redis.setex(key, ttl, JSON.stringify(data))
  },

  async invalidate(pattern: string) {
    const keys = await redis.keys(pattern)
    if (keys.length) {
      await redis.del(keys)
    }
  }
}
```

React Query Konfiguration
```typescript
// lib/cache/queryClient.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 Sekunden
      cacheTime: 10 * 60 * 1000, // 10 Minuten
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
})
```

## 14.2 Optimierungen
Image Optimierung
```typescript
// components/OptimizedImage.tsx
import Image from 'next/image'
import { getSanityImageUrl } from '@/lib/sanity'

export function OptimizedImage({ asset, width, height }: ImageProps) {
  const imageUrl = getSanityImageUrl(asset)
    .width(width)
    .height(height)
    .format('webp')
    .quality(80)
    .url()

  return (
    <Image
      src={imageUrl}
      width={width}
      height={height}
      loading="lazy"
      sizes="(max-width: 768px) 100vw, 50vw"
      alt=""
    />
  )
}
```

Bundle Optimierung
```typescript
// next.config.js
module.exports = {
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  optimizeFonts: true,
  
  webpack: (config, { dev, isServer }) => {
    // Code Splitting
    config.optimization = {
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 70000,
      }
    }
    
    return config
  }
}
```

14.3 Monitoring
Performance Tracking
```typescript
// lib/monitoring/performance.ts
import { reportWebVitals } from 'next/web-vitals'

export function trackPerformance() {
  reportWebVitals(metric => {
    const { name, value, id } = metric
    
    // Sende Metriken an Monitoring-System
    fetch('/api/metrics', {
      method: 'POST',
      body: JSON.stringify({
        metricName: name,
        value,
        id,
        timestamp: Date.now()
      })
    })
  })
}

// Tracking spezifischer Aktionen
export const trackAction = async (
  action: string,
  duration: number
) => {
  await fetch('/api/metrics/action', {
    method: 'POST',
    body: JSON.stringify({
      action,
      duration,
      timestamp: Date.now()
    })
  })
}
```
Performance Dashboard
```typescript
// app/admin/performance/page.tsx
export default async function PerformancePage() {
  const metrics = await getPerformanceMetrics()
  
  return (
    <div className="grid gap-4">
      <MetricsCard
        title="Core Web Vitals"
        metrics={metrics.webVitals}
      />
      <MetricsCard
        title="API Latenz"
        metrics={metrics.apiLatency}
      />
      <MetricsCard
        title="Cache Hit Rate"
        metrics={metrics.cacheStats}
      />
    </div>
  )
}
```

Wichtige Performance-Aspekte:
1.	Lazy Loading
•	Komponenten
•	Bilder
•	Route Segments
2.	Caching-Strategien
•	Server-Side Caching
•	Client-Side Caching
•	Static Generation
•	Revalidation
3.	Bundle-Optimierung
•	Code Splitting
•	Tree Shaking
•	Dynamische Imports
•	Asset Optimierung
4.	Monitoring
•	Core Web Vitals
•	API Performance
•	Cache Performance
•	User Experience Metrics

# 15. Dokumentation

## 15.1 API-Dokumentation

### REST API Endpoints
```typescript
/**
 * @api {get} /api/projects Projekte abrufen
 * @apiName GetProjects
 * @apiGroup Projects
 * 
 * @apiSuccess {Object[]} projects Liste der Projekte
 * @apiSuccess {String} projects._id Projekt ID
 * @apiSuccess {String} projects.title Projektname
 * @apiSuccess {Number} projects.aiSpendLimit AI Budget
 */

```

API-Beispiele
```typescript
# Projekt abrufen
curl -X GET https://dashboard.sk-online-marketing.de/api/projects/123 \
  -H "Authorization: Bearer ${TOKEN}"
```
```typescript
# Spend-Limit aktualisieren
curl -X PUT https://dashboard.sk-online-marketing.de/api/projects/123 \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"aiSpendLimit": 1000}'
```

## 15.2 Entwickler-Guidelines
Setup-Anleitung
# Lokale Entwicklungsumgebung

1. Repository klonen:
   ```bash
   git clone https://github.com/sk-online-marketing/chatbot-dashboard.git
```

2. Dependencies installieren: 
   ```bash
npm install
   ```
3. Environemt Variables setzen:
•	.env.local erstellen
•	Notwendige Variablen aus .env.example kopieren
•	Werte für lokale Entwicklung eintragen

4. Development Server starten: 
   ```bash
npm run dev
   ```

### Code-Standards
```markdown
# Code Guidelines

## TypeScript
- Strikte Typisierung verwenden
- Interfaces statt Types bevorzugen
- Keine any-Types

## React
- Funktionale Komponenten
- Custom Hooks für Logik-Wiederverwendung
- Props-Interfaces definieren

## Testing
- Jest für Unit Tests
- Cypress für E2E Tests
- Mindestens 80% Coverage
 
```

## 15.3 Benutzerhandbuch

# Benutzerhandbuch SK Online Marketing Chatbot-Dashboard

## Erste Schritte
1. Login unter dashboard.sk-online-marketing.de
2. Dashboard-Übersicht erkunden
3. Profil vervollständigen

## Chatbot-Verwaltung
- Statistiken einsehen
- AI Spend-Limit anpassen
- Chatverläufe analysieren

## Support
- Ticket erstellen
- FAQ konsultieren
- Technische Dokumentation

## 15.4 Wartungshandbuch
System-Überblick
# System-Architektur

- Next.js Frontend/Backend
- Sanity CMS
- Botpress Integration
- SendGrid Email-Service

## Kritische Systeme
1. Authentication (NextAuth)
2. Botpress Verbindung
3. Sanity Studio
4. Email-Versand

## Backup-Systeme
- Tägliches Sanity Backup
- Wöchentliches System Backup

Wartungsprozesse

# Reguläre Wartung

## Täglich
- Log-Analyse
- Performance-Monitoring
- Error-Tracking

## Wöchentlich
- Backup-Überprüfung
- Security-Updates
- Performance-Optimierung

## Monatlich
- System-Updates
- Datenbank-Optimierung
- Benutzerverwaltung

Notfall-Prozeduren

# Notfallplan

## Bei Systemausfall
1. Status-Page aktualisieren
2. Backup-System aktivieren
3. Kunden informieren

## Bei Sicherheitsvorfällen
1. Systeme isolieren
2. Logs analysieren
3. Patches anwenden
