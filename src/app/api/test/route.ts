// app/api/test/route.ts

import testEnv from '@/sanity/testEnv';

export async function GET() {
    try {
        testEnv();
        return new Response('Environment variable test passed!', { status: 200 });
    } catch (error) {
        return new Response(`Error: ${(error as Error).message}`, { status: 500 });
    }
}