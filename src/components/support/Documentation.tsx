// src/components/support/Documentation.tsx
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { CheckIcon, CopyIcon, CodeIcon, ServerIcon } from 'lucide-react'
import { formatDate } from '@/lib/utils'

// Importiere Typen aus der vorhandenen Typdatei
import type { Environment, Projekt, Vertragsmodell } from '@/types/sanity'

// Definiere einen Typ für die Vertragsdaten
type ContractData = {
    _id?: string;
    titel?: string;
    environment?: Environment;
    vertragsmodell?: Vertragsmodell | {
        _id?: string;
        name?: string;
    }
}

// Einfache Tabs-Implementierung
function SimpleTabs({ children, defaultTab }: { children: React.ReactNode, defaultTab: string }) {
    const [activeTab, setActiveTab] = useState(defaultTab);

    // Wir extrahieren nur die Kinder mit dem activeTab-Wert
    const activeContent = React.Children.toArray(children).find(
        (child) => React.isValidElement(child) && child.props.value === activeTab
    );

    // Extrahiere alle Tab-Trigger für die Navigation
    const tabTriggers = React.Children.toArray(children).map(child => {
        if (React.isValidElement(child)) {
            return (
                <button
                    key={child.props.value}
                    className={`px-4 py-2 rounded-md ${activeTab === child.props.value ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
                    onClick={() => setActiveTab(child.props.value)}
                >
                    {child.props.label}
                </button>
            );
        }
        return null;
    });

    return (
        <div className="space-y-4">
            <div className="flex space-x-2 mb-4">
                {tabTriggers}
            </div>
            {activeContent}
        </div>
    );
}

// Tab content component
function TabContent({ value, children }: { value: string, label?: string, children: React.ReactNode }) {
    return <div>{children}</div>;
}

export function Documentation({ contractData }: { contractData: ContractData | null }) {
    const [copiedSection, setCopiedSection] = useState<string | null>(null)

    // Environment-Daten extrahieren
    const environment = contractData?.environment || {
        botId: '[BOT_ID nicht verfügbar]',
        token: '[TOKEN nicht verfügbar]',
        workspaceId: '[WORKSPACE_ID nicht verfügbar]'
    }

    // Funktion zum Kopieren von Text
    const copyToClipboard = (text: string, section: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedSection(section)
            setTimeout(() => setCopiedSection(null), 2000)
        })
    }

    // Code-Snippets für verschiedene Implementierungen
    const codeSnippets = {
        javascript: `// JavaScript Integration (Vanilla JS)
const botpressConfig = {
  botId: "${environment.botId}",
  token: "${environment.token}",
  workspaceId: "${environment.workspaceId}"
};

// Botpress Chat Widget laden
(function() {
  const script = document.createElement('script');
  script.src = "https://cdn.botpress.cloud/webchat/v1/inject.js";
  script.async = true;
  document.body.appendChild(script);
})();

// Widget konfigurieren
window.botpressWebChat.init({
  botId: botpressConfig.botId,
  clientId: botpressConfig.token,
  hostUrl: "https://cdn.botpress.cloud/webchat/v1",
  messagingUrl: "https://messaging.botpress.cloud",
  botName: "SK Online Marketing Chatbot",
  stylesheet: "https://webchat-styler-css.botpress.app/prod/...",
  frontendVersion: "v1"
});`,

        react: `// React Integration (Next.js & React)
import { useEffect } from 'react';

// Konfigurationsdaten
const BOTPRESS_CONFIG = {
  botId: "${environment.botId}",
  token: "${environment.token}",
  workspaceId: "${environment.workspaceId}"
};

export default function ChatbotComponent() {
  useEffect(() => {
    // Botpress Skript laden
    const loadChatWidget = () => {
      const script = document.createElement('script');
      script.src = "https://cdn.botpress.cloud/webchat/v1/inject.js";
      script.async = true;
      
      script.onload = () => {
        window.botpressWebChat.init({
          botId: BOTPRESS_CONFIG.botId,
          clientId: BOTPRESS_CONFIG.token,
          hostUrl: "https://cdn.botpress.cloud/webchat/v1",
          messagingUrl: "https://messaging.botpress.cloud",
          botName: "SK Online Marketing Chatbot"
        });
      };
      
      document.body.appendChild(script);
    };
    
    loadChatWidget();
    
    // Cleanup beim Komponenten-Unmount
    return () => {
      if (window.botpressWebChat && window.botpressWebChat.sendEvent) {
        window.botpressWebChat.sendEvent({ type: 'hide' });
      }
    };
  }, []);
  
  return (
    <div id="botpress-webchat-container">
      {/* Der Chatbot wird hier eingefügt */}
    </div>
  );
}`,

        envVars: `# Umgebungsvariablen für Ihre Anwendung
NEXT_PUBLIC_BOTPRESS_BOT_ID="${environment.botId}"
NEXT_PUBLIC_BOTPRESS_TOKEN="${environment.token}"
NEXT_PUBLIC_BOTPRESS_WORKSPACE_ID="${environment.workspaceId}"

# Diese Variablen können in Ihrer Anwendung wie folgt verwendet werden:
# const botId = process.env.NEXT_PUBLIC_BOTPRESS_BOT_ID
`,

        htmlEmbed: `<!-- HTML Embed Code für Ihre Website -->
<script src="https://cdn.botpress.cloud/webchat/v1/inject.js"></script>
<script>
  window.botpressWebChat.init({
    botId: "${environment.botId}",
    clientId: "${environment.token}",
    hostUrl: "https://cdn.botpress.cloud/webchat/v1",
    messagingUrl: "https://messaging.botpress.cloud",
    botName: "SK Online Marketing Chatbot"
  });
</script>
`
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CodeIcon className="h-5 w-5" />
                        Technische Dokumentation
                    </CardTitle>
                    <CardDescription>
                        Hier finden Sie die technische Dokumentation und Integrationsanleitungen für Ihren Chatbot.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {contractData?.environment ? (
                        <>
                            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-2">
                                <ServerIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-medium">Integration für: {contractData.titel}</h3>
                                    <p>
                                        Verwenden Sie die folgenden Konfigurationsdaten, um den Chatbot in Ihre Website zu integrieren.
                                        Das aktuelle Vertragsmodell ist: <strong>{contractData.vertragsmodell?.name}</strong>
                                    </p>
                                </div>
                            </div>

                            <SimpleTabs defaultTab="javascript">
                                <TabContent value="javascript" label="JavaScript">
                                    <div className="relative">
                                        <pre className="language-javascript rounded-md bg-slate-950 p-4 overflow-x-auto text-sm text-white font-mono">
                                            {codeSnippets.javascript}
                                        </pre>
                                        <Button
                                            outline
                                            className="absolute top-3 right-3"
                                            onClick={() => copyToClipboard(codeSnippets.javascript, "javascript")}
                                        >
                                            {copiedSection === "javascript" ? (
                                                <CheckIcon className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <CopyIcon className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </TabContent>

                                <TabContent value="react" label="React">
                                    <div className="relative">
                                        <pre className="language-javascript rounded-md bg-slate-950 p-4 overflow-x-auto text-sm text-white font-mono">
                                            {codeSnippets.react}
                                        </pre>
                                        <Button
                                            outline
                                            className="absolute top-3 right-3"
                                            onClick={() => copyToClipboard(codeSnippets.react, "react")}
                                        >
                                            {copiedSection === "react" ? (
                                                <CheckIcon className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <CopyIcon className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </TabContent>

                                <TabContent value="envVars" label="Env Variables">
                                    <div className="relative">
                                        <pre className="language-javascript rounded-md bg-slate-950 p-4 overflow-x-auto text-sm text-white font-mono">
                                            {codeSnippets.envVars}
                                        </pre>
                                        <Button
                                            outline
                                            className="absolute top-3 right-3"
                                            onClick={() => copyToClipboard(codeSnippets.envVars, "envVars")}
                                        >
                                            {copiedSection === "envVars" ? (
                                                <CheckIcon className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <CopyIcon className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </TabContent>

                                <TabContent value="htmlEmbed" label="HTML Embed">
                                    <div className="relative">
                                        <pre className="language-javascript rounded-md bg-slate-950 p-4 overflow-x-auto text-sm text-white font-mono">
                                            {codeSnippets.htmlEmbed}
                                        </pre>
                                        <Button
                                            outline
                                            className="absolute top-3 right-3"
                                            onClick={() => copyToClipboard(codeSnippets.htmlEmbed, "htmlEmbed")}
                                        >
                                            {copiedSection === "htmlEmbed" ? (
                                                <CheckIcon className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <CopyIcon className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </TabContent>
                            </SimpleTabs>

                            <div className="mt-6 flex flex-col gap-4">
                                <h3 className="text-lg font-semibold">Konfigurationswerte</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card>
                                        <CardHeader className="py-3 px-4">
                                            <CardTitle className="text-sm">Bot ID</CardTitle>
                                        </CardHeader>
                                        <CardContent className="py-2 px-4 flex justify-between items-center">
                                            <code className="bg-slate-100 py-1 px-2 rounded text-sm font-mono">
                                                {environment.botId}
                                            </code>
                                            <Button
                                                plain
                                                onClick={() => copyToClipboard(environment.botId, 'botId')}
                                            >
                                                {copiedSection === 'botId' ? (
                                                    <CheckIcon className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <CopyIcon className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="py-3 px-4">
                                            <CardTitle className="text-sm">Token</CardTitle>
                                        </CardHeader>
                                        <CardContent className="py-2 px-4 flex justify-between items-center">
                                            <code className="bg-slate-100 py-1 px-2 rounded text-sm font-mono truncate max-w-[180px]">
                                                {environment.token}
                                            </code>
                                            <Button
                                                plain
                                                onClick={() => copyToClipboard(environment.token, 'token')}
                                            >
                                                {copiedSection === 'token' ? (
                                                    <CheckIcon className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <CopyIcon className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="py-3 px-4">
                                            <CardTitle className="text-sm">Workspace ID</CardTitle>
                                        </CardHeader>
                                        <CardContent className="py-2 px-4 flex justify-between items-center">
                                            <code className="bg-slate-100 py-1 px-2 rounded text-sm font-mono">
                                                {environment.workspaceId}
                                            </code>
                                            <Button
                                                plain
                                                onClick={() => copyToClipboard(environment.workspaceId, 'workspaceId')}
                                            >
                                                {copiedSection === 'workspaceId' ? (
                                                    <CheckIcon className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <CopyIcon className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-2">
                            <ServerIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-medium">Konfigurationsdaten nicht verfügbar</h3>
                                <p>
                                    Für Ihren Account sind keine Chatbot-Konfigurationsdaten verfügbar.
                                    Bitte kontaktieren Sie den Support für weitere Informationen.
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Technische Ressourcen</CardTitle>
                    <CardDescription>
                        Zusätzliche technische Ressourcen und Anleitungen
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <a href="#" className="block p-4 rounded-lg border hover:bg-slate-50 transition-colors">
                        <h3 className="font-medium">Vollständige API-Dokumentation</h3>
                        <p className="text-sm text-slate-500 mt-1">Detaillierte Dokumentation für fortgeschrittene Integrationen</p>
                    </a>

                    <a href="#" className="block p-4 rounded-lg border hover:bg-slate-50 transition-colors">
                        <h3 className="font-medium">Chatbot-Anpassung</h3>
                        <p className="text-sm text-slate-500 mt-1">Anleitung zur Anpassung des Chatbot-Aussehens</p>
                    </a>

                    <a href="#" className="block p-4 rounded-lg border hover:bg-slate-50 transition-colors">
                        <h3 className="font-medium">Analytics & Tracking</h3>
                        <p className="text-sm text-slate-500 mt-1">Einrichtung von benutzerdefinierten Tracking-Events</p>
                    </a>

                    <a href="#" className="block p-4 rounded-lg border hover:bg-slate-50 transition-colors">
                        <h3 className="font-medium">Fehlerbehebung</h3>
                        <p className="text-sm text-slate-500 mt-1">Häufige Fehler und deren Behebung</p>
                    </a>
                </CardContent>
            </Card>
        </div>
    )
}