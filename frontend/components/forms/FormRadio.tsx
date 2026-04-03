import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RadioOption {
  value: string | number;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface FormRadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  options: RadioOption[];
  hint?: string;
}

export const FormRadio = forwardRef<HTMLInputElement, FormRadioProps>(
  (
    {
      label,
      error,
      options,
      hint,
      disabled,
      className,
      name,
      value,
      onChange,
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
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-ct-text mb-3">
            {label}
            {props.required && <span className="text-ct-accent ml-1">*</span>}
          </label>
        )}

        {/* Radio Options */}
        <div className="space-y-2">
          {options.map((option, index) => (
            <motion.div
              key={`${option.value}`}
              className="flex items-start gap-3"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className="pt-1">
                <input
                  ref={index === 0 ? ref : undefined}
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={onChange}
                  disabled={disabled || option.disabled}
                  className="sr-only"
                  {...props}
                />
                <motion.div
                  className={cn(
                    'w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center',
                    'border-white/20 bg-ct-bg-secondary cursor-pointer',
                    value === option.value && 'border-ct-accent',
                    hasError && 'border-red-500/50',
                    (disabled || option.disabled) && 'opacity-50 cursor-not-allowed'
                  )}
                  onClick={() => {
                    if (!disabled && !option.disabled) {
                      onChange?.({ target: { value: option.value, name } } as any);
                    }
                  }}
                  whileHover={{ scale: (disabled || option.disabled) ? 1 : 1.05 }}
                  whileTap={{ scale: (disabled || option.disabled) ? 1 : 0.95 }}
                >
                  {value === option.value && (
                    <motion.div
                      className="w-2 h-2 rounded-full bg-ct-accent"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </motion.div>
              </div>

              <div className="flex-1 min-w-0">
                <label
                  className={cn(
                    'text-sm font-medium text-ct-text cursor-pointer',
                    (disabled || option.disabled) && 'opacity-50 cursor-not-allowed'
                  )}
                  onClick={() => {
                    if (!disabled && !option.disabled) {
                      onChange?.({ target: { value: option.value, name } } as any);
                    }
                  }}
                >
                  {option.label}
                </label>
                {option.description && (
                  <p className="text-xs text-ct-text-secondary mt-1">
                    {option.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Error Message */}
        {hasError && (
          <motion.p
            className="text-xs text-red-500 mt-3"
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
            className="text-xs text-ct-text-secondary mt-3"
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

FormRadio.displayName = 'FormRadio';
