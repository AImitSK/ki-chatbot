// src/scripts/create-test-user.ts
import { client } from '../lib/sanity/client'
import bcrypt from 'bcryptjs'

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