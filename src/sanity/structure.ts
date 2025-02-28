// src/sanity/structure.ts - Ergänzung
import { StructureBuilder } from 'sanity/desk'
import dynamic from 'next/dynamic'

const InvoiceList = dynamic(() => import('./components/InvoiceList'))

export default function structureBuilder(S: StructureBuilder) {
    return S.list()
        .title('Inhalt')
        .items([
            S.listItem()
                .title('Projekte')
                .schemaType('projekte')
                .child(
                    S.documentTypeList('projekte')
                        .title('Projekte')
                        .child((documentId) => {
                            return S.document()
                                .documentId(documentId)
                                .schemaType('projekte')
                                .views([
                                    S.view.form(),
                                    S.view.component(InvoiceList).options({ documentId }).title('Rechnungen')
                                ])
                        })
                ),

            S.listItem()
                .title('Benutzer')
                .schemaType('user')
                .child(S.documentTypeList('user').title('Benutzer')),

            S.listItem()
                .title('Unternehmen')
                .schemaType('unternehmen')
                .child(S.documentTypeList('unternehmen').title('Unternehmen')),

            S.listItem()
                .title('Vertragsmodelle')
                .schemaType('vertragsmodelle')
                .child(S.documentTypeList('vertragsmodelle').title('Vertragsmodelle')),

            S.listItem()
                .title('Zusatzleistungen')
                .schemaType('zusatzleistungen')
                .child(S.documentTypeList('zusatzleistungen').title('Zusatzleistungen')),

            S.listItem()
                .title('Rechnungen')
                .schemaType('rechnungen')
                .child(S.documentTypeList('rechnungen').title('Rechnungen')),

            S.listItem()
                .title('Vertragsdokumente')  // Neuer Eintrag
                .schemaType('vertragsdokumente') // Neue Schema-Referenz
                .child(S.documentTypeList('vertragsdokumente').title('Vertragsdokumente')),

            S.listItem()
                .title('Environments')
                .schemaType('environment')
                .child(S.documentTypeList('environment').title('Environments'))
        ])
}