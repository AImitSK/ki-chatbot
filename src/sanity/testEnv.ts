// src/sanity/testEnv.ts

function assertValue<T>(v: T | undefined, errorMessage: string): T {
    if (v === undefined) {
        throw new Error(errorMessage);
    }
    return v;
}

const token = assertValue(
    process.env.SANITY_API_TOKEN,
    'Missing environment variable: SANITY_API_TOKEN'
);

export default function testEnv() {
    console.log('SANITY_API_TOKEN is:', token);
}