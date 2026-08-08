import { type ReactNode, type InputHTMLAttributes, type SelectHTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';

interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
}

export function FormField({ label, required, error, htmlFor, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className={`block text-sm font-medium mb-1 ${error ? 'text-red-600' : 'text-slate-700'}`}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 mt-1 text-xs text-red-600">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}

export const inputBase =
  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100 disabled:text-slate-400 text-sm';

export function inputClass(error?: string, extra?: string) {
  return `${inputBase} ${error ? 'border-red-500 bg-red-50 focus:ring-red-400' : 'border-slate-300'} ${extra ?? ''}`.trim();
}

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function TextInput({ error, className, ...props }: TextInputProps) {
  return <input {...props} className={inputClass(error, className)} />;
}

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export function SelectInput({ error, className, ...props }: SelectInputProps) {
  return <select {...props} className={inputClass(error, className)} />;
}
