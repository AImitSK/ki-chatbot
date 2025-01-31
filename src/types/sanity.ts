// src/types/sanity.ts
import type {
    SanityDocument,
    Reference,
    Slug as SanitySlug,
    Image as SanityImage,
    ValidationContext
} from '@sanity/types'

// Base Types
export interface BaseDocument extends SanityDocument {
    _createdAt: string
    _updatedAt: string
    _rev: string
    _type: string
}

// Reusable Interface Components
export interface Timestamped {
    createdAt: string
    updatedAt: string
}

export interface Activatable {
    aktiv: boolean
}

export interface Noteable {
    notizen?: string
}

// Validation Types
export interface CustomValidationContext extends ValidationContext {
    document?: SanityDocument
    parent?: Record<string, unknown>
    path?: string[]
}

// Schema Types
export interface Feature {
    _key: string
    feature: string
    included: boolean
}

export interface ChangeHistoryEntry {
    _key: string
    date: string
    user: Reference
    description: string
}

export interface Unternehmen extends BaseDocument, Activatable, Noteable {
    _type: 'unternehmen'
    name: string
    strasse: string
    plz: string
    ort: string
    land: string
    ustIdNr?: string
    telefon?: string
    email?: string
    webseite?: string
    logo?: SanityImage
}

export interface Vertragsmodell extends BaseDocument, Activatable, Noteable {
    _type: 'vertragsmodelle'
    name: string
    beschreibung: string
    preis: number
    zahlungsintervall: 'monthly' | 'yearly'
    freeAiSpend: number
    supportlevel: 'email' | 'email_phone' | 'premium'
    hitlFunktion: boolean
    features: Feature[]
    mindestlaufzeit: number
}

export interface Environment extends SanityDocument {
    _type: 'environment'
    botId: string
    token: string
    workspaceId: string
    aktiv: boolean
    description?: string
    createdAt: string
    updatedAt: string
}

export interface Projekt extends BaseDocument, Noteable {
    _type: 'projekte'
    titel: string
    slug: SanitySlug
    users: Reference[]
    unternehmen: Reference
    rechnungsempfaenger: Reference
    vertragsmodell: Reference
    vertragsbeginn: string
    vertragsende?: string
    aiSpendLimit: number
    zusatzleistungen?: Reference[]
    environment: Reference
    history: ChangeHistoryEntry[]
}

// Schema Validation Types
export type ValidationResult = true | string | Promise<true | string>

export type CustomValidationFunction = (
    value: unknown,
    context: CustomValidationContext
) => ValidationResult