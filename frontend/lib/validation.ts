import { z } from 'zod';

// Email validation
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

// NOTE: Password validation is intentionally omitted.
// Authentication is handled by Clerk — passwords are never processed by this app.

// Phone number validation (basic international format)
export const phoneSchema = z
  .string()
  .min(10, 'Please enter a valid phone number')
  .max(20, 'Phone number is too long')
  .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Please enter a valid phone number');

// Company name validation
export const companyNameSchema = z
  .string()
  .min(2, 'Company name must be at least 2 characters')
  .max(100, 'Company name must be less than 100 characters');

// First/Last name validation
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

// Address validation
export const addressSchema = z.object({
  street: z
    .string()
    .min(5, 'Street address is required')
    .max(100, 'Street address is too long'),
  city: z
    .string()
    .min(2, 'City is required')
    .max(50, 'City is too long'),
  state: z
    .string()
    .min(2, 'State is required')
    .max(50, 'State is too long'),
  zipCode: z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)'),
  country: z
    .string()
    .min(2, 'Country is required'),
});

export type AddressFormData = z.infer<typeof addressSchema>;

// NOTE: Login and register forms are handled by Clerk UI components.
// Do not implement custom login/register logic here.

// Quote request form validation
export const quoteRequestSchema = z.object({
  email: emailSchema,
  company: companyNameSchema,
  phone: phoneSchema.optional(),
  items: z.array(z.object({
    sku: z.string().min(1, 'SKU is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
  })).min(1, 'At least one item is required'),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

export type QuoteRequestFormData = z.infer<typeof quoteRequestSchema>;

// NOTE: Password reset is handled by Clerk — no custom reset flow needed.

// Account settings form validation
export const accountSettingsSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  company: companyNameSchema,
});

export type AccountSettingsFormData = z.infer<typeof accountSettingsSchema>;
