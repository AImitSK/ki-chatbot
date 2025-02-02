// src/scripts/create-test-user.ts
import { createClient } from '@sanity/client'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'
import path from 'path'

// Lade .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// Überprüfe, ob der Token vorhanden ist
if (!process.env.SANITY_API_TOKEN) {
    console.error('SANITY_API_TOKEN ist nicht gesetzt')
    process.exit(1)
}

const client = createClient({
    projectId: "potbwnws",
    dataset: "production",
    useCdn: false,
    apiVersion: '2024-01-29',
    token: process.env.SANITY_API_TOKEN
})

async function createTestUser() {
    // Passwort hashen
    const hashedPassword = await bcrypt.hash('test123', 12)

    try {
        const result = await client.create({
            _type: 'user',
            name: 'Test Admin',
            email: 'admin@test.de',
            role: 'admin',
            aktiv: true,
            password: hashedPassword,
            position: 'System Administrator',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        })

        console.log('Test-User erstellt:', result)
    } catch (error) {
        console.error('Fehler beim Erstellen des Test-Users:', error)
    }

    process.exit(0)
}

createTestUser()