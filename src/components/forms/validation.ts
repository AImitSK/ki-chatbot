import * as z from 'zod'

export const profileSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    telefon: z.string().optional(),
    position: z.string().optional(),
})

export type ProfileFormData = z.infer<typeof profileSchema>