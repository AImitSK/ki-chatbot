// src/sanity/structure.ts - Aktualisiert
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

            // Neu: Support-Tickets an prominenter Stelle im Menü
            S.listItem()
                .title('Support-Tickets')
                .schemaType('supportTicket')
                .child(
                    S.documentTypeList('supportTicket')
                        .title('Support-Tickets')
                        .filter('_type == "supportTicket"')
                        .defaultOrdering([{field: 'updatedAt', direction: 'desc'}])
                ),

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
                .title('Vertragsdokumente')
                .schemaType('vertragsdokumente')
                .child(S.documentTypeList('vertragsdokumente').title('Vertragsdokumente')),

            S.listItem()
                .title('Environments')
                .schemaType('environment')
                .child(S.documentTypeList('environment').title('Environments')),

            // Admin/System-Bereich
            S.divider(),
            S.listItem()
                .title('System')
                .child(
                    S.list()
                        .title('System')
                        .items([
                            S.listItem()
                                .title('Activity Logs')
                                .schemaType('activityLog')
                                .child(S.documentTypeList('activityLog').title('Activity Logs')),
                            S.listItem()
                                .title('Email Verifications')
                                .schemaType('emailVerification')
                                .child(S.documentTypeList('emailVerification').title('Email Verifications')),
                            S.listItem()
                                .title('Billing Invites')
                                .schemaType('billingInvite')
                                .child(S.documentTypeList('billingInvite').title('Billing Invites')),
                            S.listItem()
                                .title('Bot Events')
                                .schemaType('botEvent')
                                .child(S.documentTypeList('botEvent').title('Bot Events'))
                        ])
                )
        ])
}