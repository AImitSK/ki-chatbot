// src/sanity/schemaTypes/index.ts
import { environmentSchema } from './environment'
import { projektSchema } from './projekte'
import { userSchema } from './user'
import { unternehmenSchema } from './unternehmen'
import { vertragsmodelleSchema } from './vertragsmodelle'
import { zusatzleistungenSchema } from './zusatzleistungen'
import { rechnungenSchema } from './rechnungen'

// Schema Types Array für Sanity Konfiguration
const schemaTypes = [
  environmentSchema,
  projektSchema,
  userSchema,
  unternehmenSchema,
  vertragsmodelleSchema,
  zusatzleistungenSchema,
  rechnungenSchema,
]

export default schemaTypes