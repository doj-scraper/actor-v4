import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  description?: string;
}

export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  (
    {
      label,
      error,
      hint,
      description,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;

    return (
      <motion.div
        className="w-full"
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <div className="relative pt-1">
            <input
              ref={ref}
              type="checkbox"
              disabled={disabled}
              className="sr-only"
              {...props}
            />
            <motion.div
              className={cn(
                'w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center',
                'border-white/20 bg-ct-bg-secondary',
                'cursor-pointer',
                props.checked && 'border-ct-accent bg-ct-accent',
                hasError && 'border-red-500/50',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              onClick={() => {
                if (!disabled) {
                  ref && typeof ref === 'object' && (ref.current?.click());
                }
              }}
              whileHover={{ scale: disabled ? 1 : 1.05 }}
              whileTap={{ scale: disabled ? 1 : 0.95 }}
            >
              {props.checked && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Check className="w-3 h-3 text-ct-bg" />
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Label & Description */}
          <div className="flex-1 min-w-0">
            {label && (
              <label
                htmlFor={props.id}
                className={cn(
                  'block text-sm font-medium text-ct-text cursor-pointer',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {label}
                {props.required && <span className="text-ct-accent ml-1">*</span>}
              </label>
            )}

            {description && (
              <p className="text-xs text-ct-text-secondary mt-1">{description}</p>
            )}

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
          </div>
        </div>
      </motion.div>
    );
  }
);

FormCheckbox.displayName = 'FormCheckbox';
