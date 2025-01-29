import type {StructureBuilder} from 'sanity/structure'

export const structure = (S: StructureBuilder) =>
    S.list()
        .title('Inhalt')
        .items([
            S.listItem()
                .title('Projekte')
                .child(
                    S.documentList()
                        .title('Projekte')
                        .filter('_type == "projekte"')
                ),
            S.listItem()
                .title('Benutzer')
                .child(
                    S.documentList()
                        .title('Benutzer')
                        .filter('_type == "user"')
                ),
            S.listItem()
                .title('Unternehmen')
                .child(
                    S.documentList()
                        .title('Unternehmen')
                        .filter('_type == "unternehmen"')
                ),
            S.listItem()
                .title('Vertragsmodelle')
                .child(
                    S.documentList()
                        .title('Vertragsmodelle')
                        .filter('_type == "vertragsmodelle"')
                ),
            S.listItem()
                .title('Zusatzleistungen')
                .child(
                    S.documentList()
                        .title('Zusatzleistungen')
                        .filter('_type == "zusatzleistungen"')
                ),
            S.listItem()
                .title('Rechnungen')
                .child(
                    S.documentList()
                        .title('Rechnungen')
                        .filter('_type == "rechnungen"')
                ),
            S.listItem()
                .title('Environments')
                .child(
                    S.documentList()
                        .title('Environments')
                        .filter('_type == "environment"')
                ),
        ])