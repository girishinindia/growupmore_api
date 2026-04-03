/**
 * USERS VALIDATORS
 */
const { z } = require('zod');

const createUserSchema = z.object({
  first_name: z.string().min(2).max(50).trim(),
  last_name: z.string().min(2).max(50).trim(),
  email: z.string().email().max(255).trim().toLowerCase().optional(),
  mobile: z.string().trim().optional(),
  password: z.string().min(8).max(128).optional(),
  role: z.enum(['sa', 'admin', 'student', 'instructor']).optional().default('student'),
  country_id: z.number().int().positive().optional().default(1),
});

const updateUserSchema = z.object({
  first_name: z.string().min(2).max(50).trim().optional(),
  last_name: z.string().min(2).max(50).trim().optional(),
  country_id: z.number().int().positive().optional(),
});

const updateUserRoleSchema = z.object({
  role: z.enum(['sa', 'admin', 'student', 'instructor']),
});

const setActiveSchema = z.object({
  is_active: z.boolean(),
});

module.exports = { createUserSchema, updateUserSchema, updateUserRoleSchema, setActiveSchema };
