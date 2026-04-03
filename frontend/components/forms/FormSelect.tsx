import type { SelectHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: Option[];
  placeholder?: string;
  isSuccess?: boolean;
  isLoading?: boolean;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  (
    {
      label,
      error,
      hint,
      options,
      placeholder,
      isSuccess,
      isLoading,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const showSuccess = isSuccess && !error;

    return (
      <motion.div
        className="w-full"
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Label */}
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-ct-text mb-2"
          >
            {label}
            {props.required && <span className="text-ct-accent ml-1">*</span>}
          </label>
        )}

        {/* Select Wrapper */}
        <div className="relative">
          <select
            ref={ref}
            disabled={disabled || isLoading}
            className={cn(
              'w-full px-4 py-3 pr-10 rounded-lg font-body text-sm transition-all duration-200',
              'bg-ct-bg-secondary border border-white/10 appearance-none',
              'text-ct-text',
              'focus:outline-none focus:ring-2 focus:ring-ct-accent/50 focus:border-ct-accent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              hasError && 'border-red-500/50 focus:ring-red-500/30',
              showSuccess && 'border-green-500/50 focus:ring-green-500/30',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="text-ct-text-secondary">
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={`${option.value}`}
                value={option.value}
                disabled={option.disabled}
                className="bg-ct-bg-secondary text-ct-text"
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Chevron Icon */}
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ct-text-secondary pointer-events-none" />

          {/* Success Icon */}
          {showSuccess && !isLoading && (
            <motion.div
              className="absolute right-10 top-1/2 -translate-y-1/2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Check className="w-5 h-5 text-green-500" />
            </motion.div>
          )}

          {/* Error Icon */}
          {hasError && !isLoading && (
            <motion.div
              className="absolute right-10 top-1/2 -translate-y-1/2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <AlertCircle className="w-5 h-5 text-red-500" />
            </motion.div>
          )}

          {/* Loading Spinner */}
          {isLoading && (
            <motion.div
              className="absolute right-10 top-1/2 -translate-y-1/2"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <div className="w-5 h-5 border-2 border-ct-accent/30 border-t-ct-accent rounded-full" />
            </motion.div>
          )}
        </div>

        {/* Error Message */}
        {hasError && (
          <motion.p
            className="text-xs text-red-500 mt-2"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.p>
        )}

        {/* Hint Text */}
        {hint && !hasError && (
          <motion.p
            className="text-xs text-ct-text-secondary mt-2"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {hint}
          </motion.p>
        )}
      </motion.div>
    );
  }
);

FormSelect.displayName = 'FormSelect';
