/**
 * ═══════════════════════════════════════════════════════════════
 * BRANCH MANAGEMENT VALIDATORS — Zod Schemas
 * ═══════════════════════════════════════════════════════════════
 * Branches, Departments, Branch Departments validation schemas
 * ═══════════════════════════════════════════════════════════════
 */

const { z } = require('zod');
const { coercePositiveInt } = require('./shared/coerce');

// ============================================================================
// SHARED SCHEMAS
// ============================================================================

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a positive integer').transform(Number),
});

const listQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
  search: z.string().max(100).optional(),
  sortBy: z.string().max(50).optional(),
  sortDir: z.enum(['ASC', 'DESC', 'asc', 'desc']).optional().default('ASC'),
});

// ============================================================================
// BRANCH SCHEMAS
// ============================================================================

const createBranchSchema = z.object({
  countryId: coercePositiveInt,
  stateId: coercePositiveInt,
  cityId: coercePositiveInt,
  name: z.string().min(1).max(200).trim(),
  code: z.string().max(50).optional().nullable(),
  branchType: z.string().max(50).optional().default('office'),
  addressLine1: z.string().max(500).optional().nullable(),
  addressLine2: z.string().max(500).optional().nullable(),
  pincode: z.string().max(10).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email().optional().nullable(),
  website: z.string().max(500).url().optional().nullable(),
  googleMapsUrl: z.string().max(500).url().optional().nullable(),
  timezone: z.string().max(50).optional().default('Asia/Kolkata'),
  isActive: z.boolean().optional().default(true),
});

const updateBranchSchema = z.object({
  countryId: coercePositiveInt.optional(),
  stateId: coercePositiveInt.optional(),
  cityId: coercePositiveInt.optional(),
  name: z.string().min(1).max(200).trim().optional(),
  code: z.string().max(50).optional().nullable(),
  branchType: z.string().max(50).optional().nullable(),
  addressLine1: z.string().max(500).optional().nullable(),
  addressLine2: z.string().max(500).optional().nullable(),
  pincode: z.string().max(10).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email().optional().nullable(),
  website: z.string().max(500).url().optional().nullable(),
  googleMapsUrl: z.string().max(500).url().optional().nullable(),
  timezone: z.string().max(50).optional().nullable(),
  branchManagerId: coercePositiveInt.optional().nullable(),
  isActive: z.boolean().optional(),
});

const branchListQuerySchema = listQuerySchema.extend({
  countryId: z.string().regex(/^\d+$/).transform(Number).optional(),
  stateId: z.string().regex(/^\d+$/).transform(Number).optional(),
  cityId: z.string().regex(/^\d+$/).transform(Number).optional(),
  branchType: z.string().max(50).optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

// ============================================================================
// DEPARTMENT SCHEMAS
// ============================================================================

const createDepartmentSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  code: z.string().max(50).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  parentDepartmentId: coercePositiveInt.optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

const updateDepartmentSchema = z.object({
  name: z.string().min(1).max(200).trim().optional(),
  code: z.string().max(50).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  parentDepartmentId: coercePositiveInt.optional().nullable(),
  headUserId: coercePositiveInt.optional().nullable(),
  isActive: z.boolean().optional(),
});

const departmentListQuerySchema = listQuerySchema.extend({
  parentDepartmentId: z.string().regex(/^\d+$/).transform(Number).optional(),
  topLevelOnly: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  code: z.string().max(50).optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

// ============================================================================
// BRANCH DEPARTMENT SCHEMAS
// ============================================================================

const createBranchDepartmentSchema = z.object({
  branchId: coercePositiveInt,
  departmentId: coercePositiveInt,
  localHeadUserId: coercePositiveInt.optional().nullable(),
  employeeCapacity: coercePositiveInt.optional().nullable(),
  floorOrWing: z.string().max(100).optional().nullable(),
  extensionNumber: z.string().max(20).optional().nullable(),
  addressLine1: z.string().max(500).optional().nullable(),
  addressLine2: z.string().max(500).optional().nullable(),
  pincode: z.string().max(10).optional().nullable(),
  countryId: coercePositiveInt.optional().nullable(),
  stateId: coercePositiveInt.optional().nullable(),
  cityId: coercePositiveInt.optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  googleMapsUrl: z.string().max(500).url().optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

const updateBranchDepartmentSchema = z.object({
  branchId: coercePositiveInt.optional(),
  departmentId: coercePositiveInt.optional(),
  localHeadUserId: coercePositiveInt.optional().nullable(),
  employeeCapacity: coercePositiveInt.optional().nullable(),
  floorOrWing: z.string().max(100).optional().nullable(),
  extensionNumber: z.string().max(20).optional().nullable(),
  addressLine1: z.string().max(500).optional().nullable(),
  addressLine2: z.string().max(500).optional().nullable(),
  pincode: z.string().max(10).optional().nullable(),
  countryId: coercePositiveInt.optional().nullable(),
  stateId: coercePositiveInt.optional().nullable(),
  cityId: coercePositiveInt.optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  googleMapsUrl: z.string().max(500).url().optional().nullable(),
  isActive: z.boolean().optional(),
});

const branchDepartmentListQuerySchema = listQuerySchema.extend({
  branchId: z.string().regex(/^\d+$/).transform(Number).optional(),
  departmentId: z.string().regex(/^\d+$/).transform(Number).optional(),
  branchType: z.string().max(50).optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Shared
  idParamSchema,
  listQuerySchema,

  // Branches
  createBranchSchema,
  updateBranchSchema,
  branchListQuerySchema,

  // Departments
  createDepartmentSchema,
  updateDepartmentSchema,
  departmentListQuerySchema,

  // Branch Departments
  createBranchDepartmentSchema,
  updateBranchDepartmentSchema,
  branchDepartmentListQuerySchema,
};
