// src/sanity/schemaTypes/index.ts - Updated
import { environmentSchema } from './environment'
import { projektSchema } from './projekte'
import { userSchema } from './user'
import { unternehmenSchema } from './unternehmen'
import { vertragsmodelleSchema } from './vertragsmodelle'
import { zusatzleistungenSchema } from './zusatzleistungen'
import { rechnungenSchema } from './rechnungen'
import { emailVerificationSchema } from './emailVerification'
import { activityLogSchema } from './activityLog'
import { vertragsdokumenteSchema } from './vertragsdokumente'  // Neu importiert

// Schema Types Array für Sanity Konfiguration
// Reihenfolge ist wichtig: Basis-Schemas zuerst, dann abhängige Schemas
const schemaTypes = [
  // Basis-Schemas (werden von anderen referenziert)
  userSchema,
  unternehmenSchema,
  environmentSchema,
  vertragsmodelleSchema,
  zusatzleistungenSchema,
  vertragsdokumenteSchema, // Neue Schema-Referenz hinzugefügt
  projektSchema,
  rechnungenSchema,
  emailVerificationSchema,
  activityLogSchema
]

export default schemaTypes