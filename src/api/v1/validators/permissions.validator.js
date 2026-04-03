/**
 * PERMISSIONS VALIDATORS
 */
const { z } = require('zod');

const createPermissionSchema = z.object({
  module_id: z.number().int().positive(),
  name: z.string().min(2).max(100).trim(),
  code: z.string().min(2).max(100).trim(),
  description: z.string().max(500).trim().optional(),
  resource: z.string().min(1).max(100).trim(),
  action: z.enum(['create', 'read', 'update', 'delete', 'approve', 'reject', 'publish', 'unpublish', 'export', 'import', 'assign', 'manage', 'restore', 'ban', 'unban', 'verify']),
  scope: z.enum(['global', 'own', 'assigned']).optional().default('global'),
  display_order: z.number().int().nonnegative().optional().default(0),
  is_active: z.boolean().optional().default(true),
});

const updatePermissionSchema = createPermissionSchema.partial();

const createModuleSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  code: z.string().min(2).max(50).trim(),
  slug: z.string().min(2).max(100).trim(),
  description: z.string().max(500).trim().optional(),
  display_order: z.number().int().nonnegative().optional().default(0),
  icon: z.string().max(100).trim().optional().nullable(),
  color: z.string().max(50).trim().optional().nullable(),
  is_active: z.boolean().optional().default(true),
});

const updateModuleSchema = createModuleSchema.partial();

module.exports = { createPermissionSchema, updatePermissionSchema, createModuleSchema, updateModuleSchema };
