# Chatbot Kunden-Backend

Kunden-Backend zur Administration von KI Chatbots der Firma SK Online Marketing.

## Übersicht

Das Dashboard bietet Kunden eine zentrale Plattform zur Verwaltung und Überwachung ihrer Chatbot-Dienste. Es ermöglicht die eigenständige Verwaltung von Unternehmens- und Nutzerdaten, Kontrolle über AI Spend-Limits sowie Zugang zu Support und Dokumentation.

### Hauptfunktionen
- Chatbot-Statistiken und Performance-Monitoring
- Benutzerverwaltung mit verschiedenen Zugriffsebenen
- Vertragsverwaltung und Rechnungseinsicht
- AI Spend-Limit Kontrolle
- Integriertes Support-System

## Tech Stack

### Core Technologies
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS

### Backend & CMS
- Sanity CMS
  ```bash
  npx sanity@latest init
  ```
- NextAuth mit Sanity Integration
  ```bash
  npm i next-auth-sanity
  ```

### UI Framework
- Catalyst UI ([Dokumentation](https://catalyst.tailwindui.com/docs))

### Externe Services
- Botpress Client
  ```bash
  npm install --save @botpress/client
  ```
- Sendgrid
  ```bash
  npm install --save @sendgrid/client
  ```

## Projektstruktur

```
src/
├── app/
│   ├── api/               # API Endpoints
│   ├── auth/             # Auth Pages
│   │   ├── login/
│   │   └── newPassword/
│   ├── studio/          # Sanity Studio
│   │   └── [[...tool]]/
│   └── dashboard/       # Frontend Routes
│       ├── profil/
│       ├── unternehmen/
│       ├── vertrag/
│       └── support/
├── components/          # React Components
├── lib/                # Utility Functions
│   ├── sendgrid/
│   ├── sanity/
│   └── auth/
├── types/              # TypeScript Definitions
└── sanity/            # Sanity CMS Config
    ├── schemaTypes/
    └── utils/
```

## Environment Setup

```env
# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_URL=http://localhost:3000

# Sendgrid
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=s.kuehne@sk-online-marketing.de
```

## Datenmodell

### Hauptschemas

1. **Projekte (projekte.ts)**
   - Titel (string)
   - Slug (unique key)
   - User (Ref: user.ts, mehrere möglich)
   - Unternehmen (Ref: unternehmen.ts)
   - Vertragsdetails
   - AI Spend-Limit
   - Environment-Konfiguration

2. **User (user.ts)**
   - NextAuth kompatibel
   - Name, Email, Telefon
   - Rollen-Management
   - Aktivitätsstatus

3. **Unternehmen (unternehmen.ts)**
   - Firmendaten
   - Kontaktinformationen
   - Rechnungsdetails

4. **Vertragsmodelle (vertragsmodelle.ts)**
   - Verschiedene Preismodelle
   - Support-Level
   - AI Spend Inklusivvolumen

5. **Rechnungen (rechnungen.ts)**
   - PDF-Speicherung
   - Projektzuordnung
   - Rechnungsdaten

## Installation & Setup

1. Repository klonen
```bash
git clone [repository-url]
cd chatbot-dashboard
```

2. Dependencies installieren
```bash
npm install
```

3. Environment Variablen setzen
```bash
cp .env.example .env.local
# Variablen in .env.local anpassen
```

4. Development Server starten
```bash
npm run dev
```

## Entwicklung

### Code Standards
- TypeScript strict mode
- ESLint & Prettier Konfiguration
- Komponentenbasierte Architektur
- Test-Driven Development

### Testing
```bash
# Unit Tests
npm run test

# E2E Tests
npm run test:e2e
```

### Build & Deployment
```bash
# Production Build
npm run build

# Deploy zu Vercel
vercel --prod
```

## Sicherheit & Performance

### Sicherheitsfeatures
- CORS Protection
- Rate Limiting
- XSS Protection
- Input Validation
- Session Management

### Performance Optimierungen
- Image Optimization
- Code Splitting
- Caching Strategien
- Bundle Optimization

## Support & Wartung

### Monitoring
- Error Tracking
- Performance Monitoring
- Usage Analytics

### Backup
- Automatische Backups
- Disaster Recovery Plan
- Datenwiederherstellung

## Lizenz & Rechtliches

© 2024 SK Online Marketing. Alle Rechte vorbehalten.

## Kontakt

Bei Fragen oder Problemen:
- Email: s.kuehne@sk-online-marketing.de
- Support: [Support-URL]