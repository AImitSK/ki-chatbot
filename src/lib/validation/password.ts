// lib/validation/password.ts
export const validatePassword = (password: string): { isValid: boolean; message: string } => {  // message ist jetzt nicht mehr optional
    if (password.length < 8) {
        return {
            isValid: false,
            message: 'Das Passwort muss mindestens 8 Zeichen lang sein'
        }
    }

    if (!/[A-Z]/.test(password)) {
        return {
            isValid: false,
            message: 'Das Passwort muss mindestens einen Großbuchstaben enthalten'
        }
    }

    if (!/[a-z]/.test(password)) {
        return {
            isValid: false,
            message: 'Das Passwort muss mindestens einen Kleinbuchstaben enthalten'
        }
    }

    if (!/[0-9]/.test(password)) {
        return {
            isValid: false,
            message: 'Das Passwort muss mindestens eine Zahl enthalten'
        }
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
        return {
            isValid: false,
            message: 'Das Passwort muss mindestens ein Sonderzeichen enthalten'
        }
    }

    return {
        isValid: true,
        message: 'Passwort ist gültig'  // Auch für den Erfolgsfall eine Nachricht
    }
}