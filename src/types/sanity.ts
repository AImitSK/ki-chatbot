// src/types/sanity.ts
import type {
    SanityDocument,
    Reference as SanityRef,
} from '@sanity/types'

// Basis Types
interface SanityAsset {
    _ref: string
    _type: 'reference'
}

export interface SanityImage {
    _type: 'image'
    asset: SanityAsset
    hotspot?: {
        x: number
        y: number
        height: number
        width: number
    }
    alt?: string
}

export interface SanityFile {
    _type: 'file'
    asset: SanityAsset
}

export interface SanitySlug {
    _type: 'slug'
    current: string
}

// Dokument Types
export interface BaseDocument extends SanityDocument {
    _createdAt: string
    _updatedAt: string
    _rev: string
    _type: string
}

// Feature Type für Vertragsmodelle
export interface Feature {
    _key: string
    feature: string
    included: boolean
}

// User Type
export interface User extends BaseDocument {
    _type: 'user'
    name: string
    email: string
    telefon?: string
    position?: string
    avatar?: SanityImage
    aktiv: boolean
    role: 'admin' | 'billing' | 'user'
    createdAt: string
    updatedAt: string
    password?: string
}

// Unternehmen Type
export interface Unternehmen extends BaseDocument {
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
    aktiv: boolean
    notizen?: string
}

// Vertragsmodell Type
export interface Vertragsmodell extends BaseDocument {
    _type: 'vertragsmodelle'
    name: string
    beschreibung: string
    preis: number
    zahlungsintervall: 'monthly' | 'yearly'
    freeAiSpend: number
    supportlevel: 'email' | 'email_phone' | 'premium'
    hitlFunktion: boolean
    aktiv: boolean
    features: Feature[]
    mindestlaufzeit: number
}

// Zusatzleistung Type
export interface Zusatzleistung extends BaseDocument {
    _type: 'zusatzleistungen'
    leistung: string
    beschreibung?: string
    preis: number
    kategorie: 'training' | 'support' | 'development' | 'other'
    aktiv: boolean
    einmalig: boolean
    verfuegbarAb: SanityRef[]
    icon?: SanityImage
}

// Environment Type
export interface Environment extends BaseDocument {
    _type: 'environment'
    botId: string
    token: string
    workspaceId: string
    active: boolean
    description?: string
}

// Rechnung Type
export interface Rechnung extends BaseDocument {
    _type: 'rechnungen'
    rechnungsnummer: number
    rechnungsdatum: string
    projekt: SanityRef
    rechnungsPDF: SanityFile
    betrag: number
    bezahlt: boolean
    zahlungsdatum?: string
    notizen?: string
}

// Projekt Type
export interface Projekt extends BaseDocument {
    _type: 'projekte'
    titel: string
    slug: SanitySlug
    users: SanityRef[]
    unternehmen: SanityRef
    rechnungsempfaenger: SanityRef
    vertragsmodell: SanityRef
    vertragsbeginn: string
    vertragsende?: string
    aiSpendLimit: number
    zusatzleistungen?: SanityRef[]
    environment: SanityRef
    notizen?: string
}

// Erweiterte Types für Referenz-Auflösung
export interface ProjektWithReferences extends Omit<Projekt, 'users' | 'unternehmen' | 'rechnungsempfaenger' | 'vertragsmodell' | 'zusatzleistungen' | 'environment'> {
    users: User[]
    unternehmen: Unternehmen
    rechnungsempfaenger: User
    vertragsmodell: Vertragsmodell
    zusatzleistungen?: Zusatzleistung[]
    environment: Environment
}

// Helper Types für API Responses
export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    pageSize: number
}

export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
}

// Query Types
export type VertragsmodellQuery = {
    title: string
    maxPreis?: number
    supportlevel?: Vertragsmodell['supportlevel']
    hitlFunktion?: boolean
    aktiv?: boolean
}

export type UserQuery = {
    email?: string
    aktiv?: boolean
    role?: User['role']
}

// GROQ Helper Types
export type SanityKeyed<T> = T & {
    _key: string
}

export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>