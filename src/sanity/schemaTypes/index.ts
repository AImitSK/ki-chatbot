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
import { vertragsdokumenteSchema } from './vertragsdokumente'
import { supportTicketSchema } from './supportTicket'  // Neu importiert
import { billingInviteSchema } from './billingInvite'
import { botEventSchema } from './botEvent'

// Schema Types Array für Sanity Konfiguration
// Reihenfolge ist wichtig: Basis-Schemas zuerst, dann abhängige Schemas
const schemaTypes = [
  // Basis-Schemas (werden von anderen referenziert)
  userSchema,
  unternehmenSchema,
  environmentSchema,
  vertragsmodelleSchema,
  zusatzleistungenSchema,
  vertragsdokumenteSchema,

  // Abhängige Schemas
  projektSchema,
  rechnungenSchema,
  emailVerificationSchema,
  activityLogSchema,
  billingInviteSchema,
  botEventSchema,
  supportTicketSchema  // Neu hinzugefügt
]

export default schemaTypes