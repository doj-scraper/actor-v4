import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { FormInput } from './FormInput';
import { FormSelect } from './FormSelect';
import type { AddressFormData } from '@/lib/validation';

interface AddressFormProps {
  onAddressChange: (address: Partial<AddressFormData>) => void;
  errors?: Partial<Record<keyof AddressFormData, string>>;
  values?: Partial<AddressFormData>;
  disabled?: boolean;
}

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

const COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'IT', label: 'Italy' },
  { value: 'ES', label: 'Spain' },
  { value: 'JP', label: 'Japan' },
  { value: 'CN', label: 'China' },
  { value: 'IN', label: 'India' },
  { value: 'BR', label: 'Brazil' },
  { value: 'MX', label: 'Mexico' },
];

export const AddressForm = forwardRef<HTMLDivElement, AddressFormProps>(
  (
    {
      onAddressChange,
      errors = {},
      values = {},
      disabled = false,
    },
    ref
  ) => {
    const handleChange = (field: keyof AddressFormData, value: string) => {
      onAddressChange({ [field]: value });
    };

    return (
      <motion.div
        ref={ref}
        className="space-y-4"
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Street Address */}
        <FormInput
          id="street"
          label="Street Address"
          placeholder="123 Main Street"
          value={values.street || ''}
          onChange={(e) => handleChange('street', e.target.value)}
          error={errors.street}
          disabled={disabled}
          required
        />

        {/* City & State Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            id="city"
            label="City"
            placeholder="New York"
            value={values.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
            error={errors.city}
            disabled={disabled}
            required
          />
          <FormSelect
            id="state"
            label="State / Province"
            placeholder="Select state"
            value={values.state || ''}
            onChange={(e) => handleChange('state', e.target.value)}
            error={errors.state}
            options={US_STATES}
            disabled={disabled}
            required
          />
        </div>

        {/* ZIP & Country Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            id="zipCode"
            label="ZIP Code"
            placeholder="12345 or 12345-6789"
            value={values.zipCode || ''}
            onChange={(e) => handleChange('zipCode', e.target.value)}
            error={errors.zipCode}
            disabled={disabled}
            required
          />
          <FormSelect
            id="country"
            label="Country"
            placeholder="Select country"
            value={values.country || ''}
            onChange={(e) => handleChange('country', e.target.value)}
            error={errors.country}
            options={COUNTRIES}
            disabled={disabled}
            required
          />
        </div>
      </motion.div>
    );
  }
);

AddressForm.displayName = 'AddressForm';
