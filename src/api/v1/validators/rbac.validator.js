const { z } = require('zod');

// ============================================================================
// ROLE SCHEMAS
// ============================================================================

const createRoleSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  code: z.string().min(2).max(50).regex(/^[a-z][a-z0-9_]*$/, 'Code must be lowercase alphanumeric with underscores').trim(),
  description: z.string().max(500).optional().nullable(),
  parentRoleId: z.number().int().positive().optional().nullable(),
  level: z.number().int().min(0).max(99).optional().default(99),
  displayOrder: z.number().int().min(0).optional().default(0),
  icon: z.string().max(50).optional().nullable(),
  color: z.string().max(20).optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

const updateRoleSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  code: z.string().min(2).max(50).regex(/^[a-z][a-z0-9_]*$/).trim().optional(),
  description: z.string().max(500).optional().nullable(),
  parentRoleId: z.number().int().positive().optional().nullable(),
  level: z.number().int().min(0).max(99).optional(),
  displayOrder: z.number().int().min(0).optional(),
  icon: z.string().max(50).optional().nullable(),
  color: z.string().max(20).optional().nullable(),
  isActive: z.boolean().optional(),
});

// ============================================================================
// ROLE PERMISSION SCHEMAS
// ============================================================================

const assignPermissionSchema = z.object({
  permissionId: z.number().int().positive('Permission ID is required'),
});

const bulkAssignPermissionsSchema = z.object({
  permissionIds: z.array(z.number().int().positive()).min(1, 'At least one permission ID is required'),
});

// ============================================================================
// USER ROLE ASSIGNMENT SCHEMAS
// ============================================================================

const assignRoleToUserSchema = z.object({
  userId: z.number().int().positive('User ID is required'),
  roleId: z.number().int().positive('Role ID is required'),
  contextType: z.string().max(50).optional().nullable(),
  contextId: z.number().int().positive().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  reason: z.string().max(500).optional().nullable(),
}).refine(data => {
  // Both context fields must be provided together or both null
  return (data.contextType == null) === (data.contextId == null);
}, { message: 'contextType and contextId must both be provided or both be null' });

const updateAssignmentSchema = z.object({
  expiresAt: z.string().datetime().optional().nullable(),
  reason: z.string().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
});

// ============================================================================
// PARAM SCHEMAS (for URL params)
// ============================================================================

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a positive integer').transform(Number),
});

const roleIdParamSchema = z.object({
  roleId: z.string().regex(/^\d+$/, 'Role ID must be a positive integer').transform(Number),
});

// ============================================================================
// QUERY SCHEMAS (for pagination/search/filter)
// ============================================================================

const listQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
  search: z.string().max(100).optional(),
  sortBy: z.string().max(50).optional(),
  sortDir: z.enum(['ASC', 'DESC', 'asc', 'desc']).optional().default('ASC'),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

const roleListQuerySchema = listQuerySchema.extend({
  level: z.string().regex(/^\d+$/).transform(Number).optional(),
  isSystemRole: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  parentRoleId: z.string().regex(/^\d+$/).transform(Number).optional(),
});

const permissionListQuerySchema = listQuerySchema.extend({
  moduleCode: z.string().max(50).optional(),
  resource: z.string().max(50).optional(),
  action: z.string().max(50).optional(),
  scope: z.enum(['global', 'own', 'assigned']).optional(),
});

const rolePermissionListQuerySchema = listQuerySchema.extend({
  moduleCode: z.string().max(50).optional(),
  action: z.string().max(50).optional(),
  scope: z.enum(['global', 'own', 'assigned']).optional(),
});

const assignmentListQuerySchema = listQuerySchema.extend({
  userId: z.string().regex(/^\d+$/).transform(Number).optional(),
  roleId: z.string().regex(/^\d+$/).transform(Number).optional(),
  roleCode: z.string().max(50).optional(),
  contextType: z.string().max(50).optional(),
});

// ============================================================================
// RESTORE SCHEMA
// ============================================================================

const restoreRoleSchema = z
  .preprocess((val) => (val === undefined || val === null ? {} : val), z.object({
    restorePermissions: z.boolean().optional().default(false),
  }));

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Role schemas
  createRoleSchema,
  updateRoleSchema,

  // Role permission schemas
  assignPermissionSchema,
  bulkAssignPermissionsSchema,

  // User role assignment schemas
  assignRoleToUserSchema,
  updateAssignmentSchema,

  // Param schemas
  idParamSchema,
  roleIdParamSchema,

  // Query schemas
  listQuerySchema,
  roleListQuerySchema,
  permissionListQuerySchema,
  rolePermissionListQuerySchema,
  assignmentListQuerySchema,

  // Restore schema
  restoreRoleSchema,
};
