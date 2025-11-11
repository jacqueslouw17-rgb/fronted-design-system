import { z } from 'zod';

// Authentication schemas
export const authSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
});

export const signInSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase()
    .trim(),
  password: z.string().min(1, 'Password is required')
});

// Organization profile schema
export const orgProfileSchema = z.object({
  company_name: z.string().trim().min(1, 'Company name is required').max(200, 'Company name must be less than 200 characters'),
  contact_email: z.string().email('Invalid email address').max(255, 'Email must be less than 255 characters').toLowerCase().trim(),
  contact_phone: z.string()
    .regex(/^[+]?[0-9\s()-]+$/, 'Invalid phone number format')
    .max(50, 'Phone number must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  website: z.string()
    .url('Invalid URL format')
    .max(500, 'Website URL must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  industry: z.string().max(100, 'Industry must be less than 100 characters').optional().or(z.literal('')),
  company_size: z.enum(['1-10', '11-50', '51-200', '201-1000', '1000+', '']).optional(),
  hq_country: z.string().length(2, 'Country code must be 2 characters').optional().or(z.literal('')),
  default_currency: z.string().length(3, 'Currency code must be 3 characters').optional().or(z.literal('')),
  payroll_frequency: z.enum(['weekly', 'biweekly', 'monthly', '']).optional()
});

// Worker onboarding schemas
export const personalInfoSchema = z.object({
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address').max(255, 'Email must be less than 255 characters').toLowerCase().trim(),
  phone: z.string()
    .regex(/^[+]?[0-9\s()-]+$/, 'Invalid phone number format')
    .max(50, 'Phone number must be less than 50 characters'),
  dateOfBirth: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
    .optional()
    .or(z.literal('')),
  nationality: z.string().max(100, 'Nationality must be less than 100 characters').optional().or(z.literal('')),
  address: z.string().max(500, 'Address must be less than 500 characters').optional().or(z.literal(''))
});

export const complianceDocSchema = z.object({
  tinNumber: z.string().max(50, 'TIN must be less than 50 characters').optional().or(z.literal('')),
  philHealthNumber: z.string().max(50, 'PhilHealth number must be less than 50 characters').optional().or(z.literal('')),
  nationalId: z.string().max(50, 'National ID must be less than 50 characters').optional().or(z.literal('')),
  taxCard: z.string().max(50, 'Tax card must be less than 50 characters').optional().or(z.literal(''))
});

export const bankDetailsSchema = z.object({
  bankName: z.string().trim().min(1, 'Bank name is required').max(200, 'Bank name must be less than 200 characters'),
  accountNumber: z.string()
    .regex(/^[A-Z0-9\s-]+$/i, 'Account number can only contain letters, numbers, spaces, and hyphens')
    .min(4, 'Account number must be at least 4 characters')
    .max(50, 'Account number must be less than 50 characters'),
  swiftBic: z.string()
    .optional()
    .or(z.literal('')),
  iban: z.string().max(50, 'IBAN must be less than 50 characters').optional().or(z.literal(''))
});

// Mini rules schema
export const miniRuleSchema = z.object({
  rule_type: z.string().trim().min(1, 'Rule type is required').max(100, 'Rule type must be less than 100 characters'),
  description: z.string().trim().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters')
});

// Profile settings schema
export const profileUpdateSchema = z.object({
  display_name: z.string().trim().max(100, 'Display name must be less than 100 characters').optional()
});
