// components/forms/ProfileForm.tsx
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileSchema, ProfileFormData } from './validation'
import { User } from '@/types'

interface ProfileFormProps {
    initialData: User
}

export const ProfileForm = ({ initialData }: ProfileFormProps) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: initialData,
    })

    const onSubmit: SubmitHandler<ProfileFormData> = async (data) => {
        // Logik zum Speichern der Daten
        console.log(data)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Formularfelder */}
            <button type="submit" className="primary-button">
                Speichern
            </button>
        </form>
    )
}