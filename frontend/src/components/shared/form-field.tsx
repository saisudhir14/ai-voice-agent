import * as React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  label: string
  name: string
  error?: string
  hint?: string
  required?: boolean
  children?: React.ReactNode
}

export function FormField({ label, name, error, hint, required, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}

// Input with icon support
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  name: string
  error?: string
  hint?: string
  icon?: React.ReactNode
}

export function InputField({ label, name, error, hint, icon, className, required, ...props }: InputFieldProps) {
  return (
    <FormField label={label} name={name} error={error} hint={hint} required={required}>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <Input
          id={name}
          name={name}
          className={cn(icon && "pl-10", error && "border-destructive", className)}
          {...props}
        />
      </div>
    </FormField>
  )
}

// Textarea field
interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  name: string
  error?: string
  hint?: string
}

export function TextareaField({ label, name, error, hint, className, required, ...props }: TextareaFieldProps) {
  return (
    <FormField label={label} name={name} error={error} hint={hint} required={required}>
      <Textarea
        id={name}
        name={name}
        className={cn(error && "border-destructive", className)}
        {...props}
      />
    </FormField>
  )
}
