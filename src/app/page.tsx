import { Heading } from '@/components/ui/heading'

export default async function Home() {

    return (
        <>
            <Heading>KI Chatbot</Heading>

            <img
                src="/images/titel-chat.svg"
                alt="Titel Chat"
                style={{ maxWidth: '100%', height: 'auto' }}
            />
        </>
    )
}