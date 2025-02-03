// src/sanity/schemaTypes/emailVerification.ts
export const emailVerificationSchema = {
    name: 'emailVerification',
    title: 'Email Verifications',
    type: 'document',
    fields: [
        {
            name: 'token',
            title: 'Token',
            type: 'string',
        },
        {
            name: 'userId',
            title: 'User ID',
            type: 'string',
        },
        {
            name: 'newEmail',
            title: 'New Email',
            type: 'string',
        },
        {
            name: 'expiresAt',
            title: 'Expires At',
            type: 'datetime',
        },
        {
            name: 'createdAt',
            title: 'Created At',
            type: 'datetime',
        },
        {
            name: 'usedAt',
            title: 'Used At',
            type: 'datetime',
        }
    ]
}