/**
 * ROLES VALIDATORS
 */
const { z } = require('zod');

const createRoleSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  code: z.string().min(2).max(50).trim(),
  slug: z.string().min(2).max(100).trim(),
  description: z.string().max(500).trim().optional(),
  parent_role_id: z.number().int().positive().optional().nullable(),
  level: z.number().int().min(0).max(100),
  is_system_role: z.boolean().optional().default(false),
  display_order: z.number().int().nonnegative().optional().default(0),
  icon: z.string().max(100).trim().optional().nullable(),
  color: z.string().max(50).trim().optional().nullable(),
  is_active: z.boolean().optional().default(true),
});

const updateRoleSchema = createRoleSchema.partial();

const assignPermissionSchema = z.object({
  role_id: z.number().int().positive(),
  permission_id: z.number().int().positive(),
});

const bulkAssignPermissionsSchema = z.object({
  role_id: z.number().int().positive(),
  permission_ids: z.array(z.number().int().positive()).min(1),
});

const removePermissionSchema = z.object({
  role_id: z.number().int().positive(),
  permission_id: z.number().int().positive(),
});

const assignRoleToUserSchema = z.object({
  user_id: z.number().int().positive(),
  role_id: z.number().int().positive(),
  context_type: z.enum(['course', 'batch', 'department', 'branch', 'internship']).optional().nullable(),
  context_id: z.number().int().positive().optional().nullable(),
  expires_at: z.string().datetime().optional().nullable(),
  reason: z.string().max(500).trim().optional().nullable(),
});

module.exports = {
  createRoleSchema, updateRoleSchema,
  assignPermissionSchema, bulkAssignPermissionsSchema, removePermissionSchema,
  assignRoleToUserSchema,
};
