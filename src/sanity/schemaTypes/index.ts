// src/sanity/schemaTypes/index.ts
import { projektSchema } from './projekte'
import { userSchema } from './user'
import { unternehmenSchema } from './unternehmen'
import { vertragsmodelleSchema } from './vertragsmodelle'
import { zusatzleistungenSchema } from './zusatzleistungen'
import { environmentSchema } from './environment'
import { rechnungenSchema } from './rechnungen'

export const schema = {
  types: [
    projektSchema,
    userSchema,
    unternehmenSchema,
    vertragsmodelleSchema,
    zusatzleistungenSchema,
    environmentSchema,
    rechnungenSchema
  ]
}