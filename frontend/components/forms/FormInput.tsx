import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  isSuccess?: boolean;
  isLoading?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      error,
      hint,
      isSuccess,
      isLoading,
      disabled,
      className,
      type = 'text',
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

        {/* Input Wrapper */}
        <div className="relative">
          <input
            ref={ref}
            type={type}
            disabled={disabled || isLoading}
            className={cn(
              'w-full px-4 py-3 rounded-lg font-body text-sm transition-all duration-200',
              'bg-ct-bg-secondary border border-white/10',
              'text-ct-text placeholder:text-ct-text-secondary/50',
              'focus:outline-none focus:ring-2 focus:ring-ct-accent/50 focus:border-ct-accent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              hasError && 'border-red-500/50 focus:ring-red-500/30',
              showSuccess && 'border-green-500/50 focus:ring-green-500/30',
              className
            )}
            {...props}
          />

          {/* Success Icon */}
          {showSuccess && !isLoading && (
            <motion.div
              className="absolute right-3 top-1/2 -translate-y-1/2"
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
              className="absolute right-3 top-1/2 -translate-y-1/2"
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
              className="absolute right-3 top-1/2 -translate-y-1/2"
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
            className="text-xs text-red-500 mt-2 flex items-center gap-1"
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

FormInput.displayName = 'FormInput';
