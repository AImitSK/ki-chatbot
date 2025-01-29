```
chatbot-dashboard/
├── .github/
│   └── workflows/
│       ├── deploy.yml
│       └── test.yml
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── register/
│   │   │   │   │   └── route.ts
│   │   │   │   └── reset-password/
│   │   │   │       └── route.ts
│   │   │   ├── botpress/
│   │   │   │   ├── statistics/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── conversations/
│   │   │   │   │   └── route.ts
│   │   │   │   └── webhook/
│   │   │   │       └── route.ts
│   │   │   ├── projects/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   └── user/
│   │   │       ├── profile/
│   │   │       │   └── route.ts
│   │   │       └── settings/
│   │   │           └── route.ts
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   ├── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   └── newPassword/
│   │   │       ├── page.tsx
│   │   │       └── layout.tsx
│   │   ├── dashboard/
│   │   │   ├── profil/
│   │   │   │   ├── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── unternehmen/
│   │   │   │   ├── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── vertrag/
│   │   │   │   ├── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   └── support/
│   │   │       ├── page.tsx
│   │   │       └── layout.tsx
│   │   ├── studio/
│   │   │   └── [[...tool]]/
│   │   │       └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── BotStats.tsx
│   │   │   ├── ChatHistory.tsx
│   │   │   ├── SpendingOverview.tsx
│   │   │   └── NotificationArea.tsx
│   │   ├── forms/
│   │   │   ├── ProfileForm.tsx
│   │   │   ├── CompanyForm.tsx
│   │   │   └── validation.ts
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── TopNav.tsx
│   │   ├── profile/
│   │   │   ├── AccountSettings.tsx
│   │   │   └── AvatarUpload.tsx
│   │   ├── company/
│   │   │   ├── BillingInfo.tsx
│   │   │   └── CompanyUsers.tsx
│   │   ├── contract/
│   │   │   ├── ContractOverview.tsx
│   │   │   ├── AdditionalServices.tsx
│   │   │   └── InvoiceList.tsx
│   │   ├── support/
│   │   │   ├── FAQSection.tsx
│   │   │   ├── SupportTickets.tsx
│   │   │   └── Documentation.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Table.tsx
│   │       ├── Modal.tsx
│   │       └── Alert.tsx
│   ├── lib/
│   │   ├── sendgrid/
│   │   │   ├── client.ts
│   │   │   ├── templates.ts
│   │   │   └── notifications.ts
│   │   ├── sanity/
│   │   │   ├── client.ts
│   │   │   ├── queries.ts
│   │   │   └── config.ts
│   │   ├── auth/
│   │   │   ├── options.ts
│   │   │   └── session.ts
│   │   ├── botpress/
│   │   │   ├── client.ts
│   │   │   ├── stats.ts
│   │   │   └── conversations.ts
│   │   ├── cache/
│   │   │   ├── redis.ts
│   │   │   └── queryClient.ts
│   │   ├── security/
│   │   │   ├── rateLimit.ts
│   │   │   ├── validation.ts
│   │   │   └── sanitize.ts
│   │   └── monitoring/
│   │       ├── sentry.ts
│   │       └── performance.ts
│   ├── types/
│   │   ├── sanity.ts
│   │   ├── botpress.ts
│   │   ├── next-auth.d.ts
│   │   └── index.ts
│   └── sanity/
│       ├── schemaTypes/
│       │   ├── projekte.ts
│       │   ├── user.ts
│       │   ├── unternehmen.ts
│       │   ├── vertragsmodelle.ts
│       │   ├── zusatzleistungen.ts
│       │   ├── environment.ts
│       │   └── rechnungen.ts
│       └── utils/
│           ├── client.ts
│           └── config.ts
├── public/
│   ├── images/
│   └── icons/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example
├── .env.local
├── .eslintrc.json
├── .gitignore
├── jest.config.js
├── next.config.js
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
└── tsconfig.json
```