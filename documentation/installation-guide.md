# Installation Guide - Chatbot Kunden-Backend

## Voraussetzungen

### Benötigte Software
- Node.js (v18.17 oder höher)
- npm (v9 oder höher)
- Git
- VS Code (empfohlen)

### Accounts & API Keys
1. Sanity Account (https://www.sanity.io/)
2. SendGrid Account (https://sendgrid.com/)
3. Botpress Account (https://botpress.com/)
4. Vercel Account (für Deployment)

## Schritt-für-Schritt Installation

### 1. Repository Setup
```bash
# Repository klonen
git clone [repository-url]
cd chatbot-dashboard

# Dependencies installieren
npm install
```

### 2. Hauptabhängigkeiten
```bash
# Next.js & React
npm install next@latest react@latest react-dom@latest

# TypeScript & Types
npm install typescript@latest @types/react @types/node
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Styling
npm install tailwindcss@latest postcss@latest autoprefixer@latest
npm install @tailwindcss/forms @tailwindcss/typography
npm install @headlessui/react @heroicons/react

# UI Framework
npm install @catalyst/ui

# CMS & Auth
npm install @sanity/client @sanity/image-url @sanity/vision
npm install next-auth-sanity next-auth
npm install @sanity/cli -g

# External Services
npm install @sendgrid/mail @sendgrid/client
npm install @botpress/client

# Utilities
npm install date-fns zod react-hook-form @hookform/resolvers
npm install swr axios ioredis
```

### 3. Development Dependencies
```bash
# Testing
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm install --save-dev cypress @cypress/code-coverage
npm install --save-dev @testing-library/user-event

# Linting & Formatting
npm install --save-dev eslint eslint-config-next prettier
npm install --save-dev husky lint-staged

# Build Tools
npm install --save-dev postcss-import postcss-nesting
```

### 4. Environment Setup

1. `.env.local` Datei erstellen:
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

# Botpress
NEXT_PUBLIC_BOTPRESS_TOKEN=
```

### 5. Sanity Studio Setup
```bash
# Sanity initialisieren
sanity init

# Wählen Sie:
# - Create new project
# - Project name: chatbot-dashboard
# - Use default dataset configuration: Yes
# - Project output path: ./src/sanity
```

### 6. API Keys & Tokens beschaffen

1. **Sanity**
   - Gehe zu sanity.io/manage
   - Erstelle ein neues Projekt
   - CORS Origins hinzufügen
   - API Token generieren

2. **SendGrid**
   - Account erstellen
   - API Key generieren
   - Sender Authentication einrichten
   - Email Templates erstellen

3. **Botpress**
   - Account erstellen
   - Bot erstellen
   - API Token generieren
   - Webhook URLs konfigurieren

### 7. Development Server starten
```bash
# Entwicklungsserver starten
npm run dev

# Sanity Studio starten
npm run sanity-dev
```

## Post-Installation Setup

### 1. TypeScript konfigurieren
```bash
# tsconfig.json überprüfen
npx tsc --init
```

### 2. ESLint & Prettier einrichten
```bash
# ESLint initialisieren
npx eslint --init

# Prettier konfigurieren
echo {}> .prettierrc
```

### 3. Git Hooks einrichten
```bash
# Husky initialisieren
npx husky-init
npm install

# Pre-commit Hook hinzufügen
npx husky add .husky/pre-commit "npm run lint"
```

### 4. Testing Setup
```bash
# Jest konfigurieren
npm init jest@latest

# Cypress installieren
npx cypress install
```

## Vercel Deployment

1. Vercel CLI installieren:
```bash
npm i -g vercel
```

2. Projekt deployen:
```bash
vercel
```

3. Umgebungsvariablen in Vercel setzen:
   - Gehe zu Vercel Dashboard
   - Projekt auswählen
   - Settings → Environment Variables
   - Alle Variablen aus .env.local übertragen

## Troubleshooting

### Bekannte Probleme & Lösungen

1. **Sanity CORS Fehler**
   - Überprüfen Sie die CORS-Einstellungen im Sanity Dashboard
   - Fügen Sie localhost:3000 für Entwicklung hinzu

2. **NextAuth Session Probleme**
   - NEXTAUTH_SECRET muss gesetzt sein
   - NEXTAUTH_URL muss korrekt sein

3. **TypeScript Fehler**
   - Types aktualisieren: `npm install @types/react@latest`
   - tsconfig.json überprüfen

4. **Build Fehler**
   - Cache löschen: `npm run clean`
   - node_modules löschen und neu installieren

## Wartung & Updates

### Regelmäßige Updates
```bash
# Dependencies aktualisieren
npm update

# Sicherheits-Audit
npm audit fix

# TypeScript Types aktualisieren
npm update @types/react @types/node
```

### Monitoring Setup
1. Sentry.io einrichten
2. Vercel Analytics aktivieren
3. Error Tracking implementieren

## Nützliche Scripts

Fügen Sie diese Scripts zu Ihrer `package.json` hinzu:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "cypress": "cypress open",
    "cypress:headless": "cypress run",
    "sanity-dev": "cd src/sanity && sanity dev",
    "clean": "rm -rf .next && rm -rf node_modules",
    "type-check": "tsc --noEmit"
  }
}
```