import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthProps {
  password: string;
  showCriteria?: boolean;
}

interface PasswordCriteria {
  label: string;
  regex: RegExp;
  met: boolean;
}

export function PasswordStrength({ password, showCriteria = true }: PasswordStrengthProps) {
  const [criteria, setCriteria] = useState<PasswordCriteria[]>([
    { label: 'At least 8 characters', regex: /.{8,}/, met: false },
    { label: 'Contains uppercase letter', regex: /[A-Z]/, met: false },
    { label: 'Contains lowercase letter', regex: /[a-z]/, met: false },
    { label: 'Contains number', regex: /[0-9]/, met: false },
    { label: 'Contains special character', regex: /[^A-Za-z0-9]/, met: false },
  ]);

  useEffect(() => {
    setCriteria((prev) =>
      prev.map((item) => ({
        ...item,
        met: item.regex.test(password),
      }))
    );
  }, [password]);

  const metCount = criteria.filter((c) => c.met).length;
  const strength = metCount === 0 ? 0 : Math.ceil((metCount / criteria.length) * 100);
  
  const getStrengthColor = (strength: number) => {
    if (strength === 0) return 'bg-gray-500';
    if (strength <= 40) return 'bg-red-500';
    if (strength <= 70) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = (strength: number) => {
    if (strength === 0) return 'No password';
    if (strength <= 40) return 'Weak';
    if (strength <= 70) return 'Fair';
    return 'Strong';
  };

  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Strength Meter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-ct-text">Password strength:</span>
          <span
            className={cn(
              'text-xs font-medium',
              strength === 0 && 'text-gray-500',
              strength > 0 && strength <= 40 && 'text-red-500',
              strength > 40 && strength <= 70 && 'text-amber-500',
              strength > 70 && 'text-green-500'
            )}
          >
            {getStrengthLabel(strength)}
          </span>
        </div>
        
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className={cn('h-full transition-all duration-500', getStrengthColor(strength))}
            initial={{ width: 0 }}
            animate={{ width: `${strength}%` }}
          />
        </div>
      </div>

      {/* Criteria List */}
      {showCriteria && password && (
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {criteria.map((item, index) => (
            <motion.div
              key={item.label}
              className="flex items-center gap-2 text-xs text-ct-text-secondary"
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              {item.met ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Check className="w-4 h-4 text-green-500" />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-4 h-4 text-red-500/50" />
                </motion.div>
              )}
              <span className={item.met ? 'text-green-500' : 'text-ct-text-secondary'}>
                {item.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
