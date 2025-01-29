// src/sanity/components/PasswordInput.tsx
import React from 'react'
import { TextInput, TextInputProps } from 'sanity'

export const PasswordInput = React.forwardRef<HTMLInputElement, TextInputProps>((props, ref) => {
    return (
        <TextInput
            {...props}
            ref={ref}
            type="password"
            readOnly
        />
    )
})

PasswordInput.displayName = 'PasswordInput'