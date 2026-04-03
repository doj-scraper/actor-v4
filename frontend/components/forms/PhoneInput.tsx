import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Check, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhoneInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  hint?: string;
  isSuccess?: boolean;
  isLoading?: boolean;
}

const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  
  if (digits.length === 0) return '';
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      label,
      error,
      hint,
      isSuccess,
      isLoading,
      disabled,
      className,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const showSuccess = isSuccess && !error;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhoneNumber(e.target.value);
      e.target.value = formatted;
      onChange?.(e);
    };

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
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ct-text-secondary pointer-events-none" />
          <input
            ref={ref}
            type="tel"
            disabled={disabled || isLoading}
            placeholder="(123) 456-7890"
            value={value}
            onChange={handleChange}
            className={cn(
              'w-full pl-10 pr-4 py-3 rounded-lg font-body text-sm transition-all duration-200',
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

PhoneInput.displayName = 'PhoneInput';
