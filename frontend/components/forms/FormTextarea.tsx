import type { TextareaHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  isSuccess?: boolean;
  isLoading?: boolean;
  showCharCount?: boolean;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      label,
      error,
      hint,
      isSuccess,
      isLoading,
      disabled,
      className,
      showCharCount,
      maxLength,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const showSuccessState = isSuccess && !error;
    const charCount = typeof value === 'string' ? value.length : 0;

    return (
      <motion.div
        className="w-full"
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Label */}
        {label && (
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor={props.id}
              className="block text-sm font-medium text-ct-text"
            >
              {label}
              {props.required && <span className="text-ct-accent ml-1">*</span>}
            </label>
            {showCharCount && maxLength && (
              <span
                className={cn(
                  'text-xs transition-colors duration-200',
                  charCount > maxLength * 0.9
                    ? 'text-amber-500'
                    : 'text-ct-text-secondary'
                )}
              >
                {charCount} / {maxLength}
              </span>
            )}
          </div>
        )}

        {/* Textarea Wrapper */}
        <div className="relative">
          <textarea
            ref={ref}
            disabled={disabled || isLoading}
            maxLength={maxLength}
            value={value}
            onChange={onChange}
            className={cn(
              'w-full px-4 py-3 rounded-lg font-body text-sm transition-all duration-200',
              'bg-ct-bg-secondary border border-white/10',
              'text-ct-text placeholder:text-ct-text-secondary/50',
              'focus:outline-none focus:ring-2 focus:ring-ct-accent/50 focus:border-ct-accent',
              'disabled:opacity-50 disabled:cursor-not-allowed resize-none',
              hasError && 'border-red-500/50 focus:ring-red-500/30',
              showSuccessState && 'border-green-500/50 focus:ring-green-500/30',
              className
            )}
            {...props}
          />

          {/* Success Icon */}
          {showSuccessState && !isLoading && (
            <motion.div
              className="absolute right-3 top-3"
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
              className="absolute right-3 top-3"
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
              className="absolute right-3 top-3"
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

FormTextarea.displayName = 'FormTextarea';
