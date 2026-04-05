/**
 * ═══════════════════════════════════════════════════════════════
 * EMPLOYEE MANAGEMENT VALIDATORS — Zod Schemas
 * ═══════════════════════════════════════════════════════════════
 * Employee Profiles validation schemas
 * ═══════════════════════════════════════════════════════════════
 */

const { z } = require('zod');

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
// EMPLOYEE PROFILE SCHEMAS
// ============================================================================

const createEmployeeProfileSchema = z.object({
  userId: z.number().int().positive('User ID is required'),
  employeeCode: z.string().min(1).max(100).trim(),
  designationId: z.number().int().positive('Designation ID is required'),
  departmentId: z.number().int().positive('Department ID is required'),
  branchId: z.number().int().positive('Branch ID is required'),
  joiningDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date format'),
  employeeType: z.enum(['full_time', 'part_time', 'contract', 'probation', 'intern', 'consultant', 'temporary', 'freelance']).optional().default('full_time'),
  reportingManagerId: z.number().int().positive().optional().nullable(),
  confirmationDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date format').optional().nullable(),
  probationEndDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date format').optional().nullable(),
  contractEndDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date format').optional().nullable(),
  workMode: z.enum(['on_site', 'remote', 'hybrid']).optional().default('on_site'),
  shiftType: z.enum(['general', 'morning', 'afternoon', 'night', 'rotational']).optional().default('general'),
  shiftBranchId: z.number().int().positive().optional().nullable(),
  workLocation: z.string().max(500).optional().nullable(),
  weeklyOffDays: z.string().max(100).optional().default('saturday,sunday'),
  payGrade: z.string().max(50).optional().nullable(),
  salaryCurrency: z.string().max(10).optional().default('INR'),
  ctcAnnual: z.number().positive().optional().nullable(),
  basicSalaryMonthly: z.number().positive().optional().nullable(),
  paymentMode: z.enum(['bank_transfer', 'cheque', 'cash', 'upi']).optional().default('bank_transfer'),
  pfNumber: z.string().max(50).optional().nullable(),
  esiNumber: z.string().max(50).optional().nullable(),
  uanNumber: z.string().max(50).optional().nullable(),
  professionalTaxNumber: z.string().max(50).optional().nullable(),
  taxRegime: z.enum(['old', 'new']).optional().default('new'),
  leaveBalanceCasual: z.number().nonnegative().optional().default(0),
  leaveBalanceSick: z.number().nonnegative().optional().default(0),
  leaveBalanceEarned: z.number().nonnegative().optional().default(0),
  leaveBalanceCompensatory: z.number().nonnegative().optional().default(0),
  totalExperienceYears: z.number().nonnegative().optional().nullable(),
  experienceAtJoining: z.number().nonnegative().optional().nullable(),
  hasSystemAccess: z.boolean().optional().default(true),
  hasEmailAccess: z.boolean().optional().default(true),
  hasVpnAccess: z.boolean().optional().default(false),
  accessCardNumber: z.string().max(100).optional().nullable(),
  laptopAssetId: z.string().max(100).optional().nullable(),
  noticePeriodDays: z.number().int().nonnegative().optional().default(30),
  isActive: z.boolean().optional().default(true),
});

const updateEmployeeProfileSchema = z.object({
  employeeCode: z.string().min(1).max(100).trim().optional(),
  employeeType: z.enum(['full_time', 'part_time', 'contract', 'probation', 'intern', 'consultant', 'temporary', 'freelance']).optional(),
  designationId: z.number().int().positive().optional(),
  departmentId: z.number().int().positive().optional(),
  branchId: z.number().int().positive().optional(),
  reportingManagerId: z.number().int().positive().optional().nullable(),
  joiningDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date format').optional(),
  confirmationDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date format').optional().nullable(),
  probationEndDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date format').optional().nullable(),
  contractEndDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date format').optional().nullable(),
  resignationDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date format').optional().nullable(),
  lastWorkingDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date format').optional().nullable(),
  relievingDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date format').optional().nullable(),
  workMode: z.enum(['on_site', 'remote', 'hybrid']).optional(),
  shiftType: z.enum(['general', 'morning', 'afternoon', 'night', 'rotational']).optional(),
  shiftBranchId: z.number().int().positive().optional().nullable(),
  workLocation: z.string().max(500).optional().nullable(),
  weeklyOffDays: z.string().max(100).optional(),
  payGrade: z.string().max(50).optional().nullable(),
  salaryCurrency: z.string().max(10).optional(),
  ctcAnnual: z.number().positive().optional().nullable(),
  basicSalaryMonthly: z.number().positive().optional().nullable(),
  paymentMode: z.enum(['bank_transfer', 'cheque', 'cash', 'upi']).optional(),
  pfNumber: z.string().max(50).optional().nullable(),
  esiNumber: z.string().max(50).optional().nullable(),
  uanNumber: z.string().max(50).optional().nullable(),
  professionalTaxNumber: z.string().max(50).optional().nullable(),
  taxRegime: z.enum(['old', 'new']).optional(),
  leaveBalanceCasual: z.number().nonnegative().optional(),
  leaveBalanceSick: z.number().nonnegative().optional(),
  leaveBalanceEarned: z.number().nonnegative().optional(),
  leaveBalanceCompensatory: z.number().nonnegative().optional(),
  totalExperienceYears: z.number().nonnegative().optional().nullable(),
  experienceAtJoining: z.number().nonnegative().optional().nullable(),
  hasSystemAccess: z.boolean().optional(),
  hasEmailAccess: z.boolean().optional(),
  hasVpnAccess: z.boolean().optional(),
  accessCardNumber: z.string().max(100).optional().nullable(),
  laptopAssetId: z.string().max(100).optional().nullable(),
  exitType: z.string().max(50).optional().nullable(),
  exitReason: z.string().max(500).optional().nullable(),
  exitInterviewDone: z.boolean().optional().nullable(),
  fullAndFinalDone: z.boolean().optional().nullable(),
  noticePeriodDays: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
});

const employeeProfileListQuerySchema = listQuerySchema.extend({
  userId: z.string().regex(/^\d+$/).transform(Number).optional(),
  employeeType: z.enum(['full_time', 'part_time', 'contract', 'probation', 'intern', 'consultant', 'temporary', 'freelance']).optional(),
  workMode: z.enum(['on_site', 'remote', 'hybrid']).optional(),
  shiftType: z.enum(['general', 'morning', 'afternoon', 'night', 'rotational']).optional(),
  payGrade: z.string().max(50).optional(),
  designationId: z.string().regex(/^\d+$/).transform(Number).optional(),
  departmentId: z.string().regex(/^\d+$/).transform(Number).optional(),
  branchId: z.string().regex(/^\d+$/).transform(Number).optional(),
  reportingManagerId: z.string().regex(/^\d+$/).transform(Number).optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  idParamSchema,
  createEmployeeProfileSchema,
  updateEmployeeProfileSchema,
  employeeProfileListQuerySchema,
};
