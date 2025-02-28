// src/components/contract/ContractUpgrade.tsx
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { Text, Strong } from '@/components/ui/text'
import { Subheading } from '@/components/ui/heading'
import Link from 'next/link'

interface ContractUpgradeProps {
    contractData: any
}

export default function ContractUpgrade({ contractData }: ContractUpgradeProps) {
    return (
        <Card>
            <div className="p-4">
                <Subheading>Vertragsänderungen</Subheading>
                <Text className="mt-1 mb-4">Upgrade, Downgrade oder Kündigung Ihres Vertrags</Text>

                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <Strong className="block mb-2">Möchten Sie Ihren Vertrag anpassen?</Strong>
                            <Text>
                                Wir bieten verschiedene Vertragsmodelle an, die an Ihre Bedürfnisse angepasst werden können.
                                Lernen Sie unsere anderen Vertragsmodelle kennen oder kontaktieren Sie unseren Support für individuelle Anpassungen.
                            </Text>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 mt-3 md:mt-0">
                            <Link href="https://sk-online-marketing.de/kontakt/" target="_blank" passHref>
                                <Button color="blue">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 mr-2"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                    </svg>
                                    Support
                                </Button>
                            </Link>

                            <Link href="https://sk-online-marketing.de/ki-chatbots/" target="_blank" passHref>
                                <Button outline>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 mr-2"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="m9 18 6-6-6-6"></path>
                                    </svg>
                                    Vertragsmodelle
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Subheading level={3}>Upgrade</Subheading>
                        <Text className="mt-2">
                            Ein Upgrade Ihres Vertrags ist jederzeit möglich. Wählen Sie ein höherwertiges Paket
                            für mehr Funktionen, besseren Support oder ein höheres AI Budget.
                        </Text>
                    </div>

                    <div>
                        <Subheading level={3}>Vertragslaufzeit</Subheading>
                        <Text className="mt-2">
                            Ihr aktueller Vertrag hat eine Mindestlaufzeit und verlängert sich
                            automatisch, wenn er nicht fristgerecht gekündigt wird. Alle Änderungen müssen über
                            unseren Support angefragt werden.
                        </Text>
                    </div>
                </div>

                <div className="mt-6 border-t pt-4">
                    <Text className="text-sm text-zinc-500 dark:text-zinc-400">
                        Für alle Änderungen an Ihrem Vertrag wenden Sie sich bitte per E-Mail an
                        <a href="mailto:info@sk-online-marketing.de" className="text-blue-600 hover:underline ml-1">
                            info@sk-online-marketing.de
                        </a>{' '}
                        oder nutzen Sie unseren Support.
                    </Text>
                </div>
            </div>
        </Card>
    )
}