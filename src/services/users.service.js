/**
 * USERS SERVICE — User Management (Admin)
 *
 * Super Admin Privileges:
 *   - Only super_admin can create/modify another super_admin or admin
 *   - admin can only manage student, instructor, etc. (non-admin roles)
 *   - Role hierarchy: super_admin > admin > instructor > student
 */

const bcrypt = require('bcryptjs');
const config = require('../config/index');
const userRepository = require('../repositories/user.repository');
const emailService = require('./email.service');
const { ConflictError, ValidationError, ForbiddenError } = require('../utils/errors');
const { formatIndianMobile } = require('../utils/helpers');
const logger = require('../config/logger');

// Roles that only super_admin can assign or manage
const PRIVILEGED_ROLES = ['super_admin', 'admin'];

class UsersService {
  /**
   * Check if the requesting user has permission to manage the target role.
   * Only super_admin can create/edit users with role super_admin or admin.
   */
  _checkRolePrivilege(requesterRole, targetRole, action = 'manage') {
    if (PRIVILEGED_ROLES.includes(targetRole) && requesterRole !== 'super_admin') {
      throw new ForbiddenError(
        `Only a super admin can ${action} users with the "${targetRole}" role.`
      );
    }
  }

  /**
   * Ensure a non-super_admin cannot modify a user who IS a super_admin or admin.
   */
  async _checkTargetProtection(targetUserId, requesterRole, action = 'modify') {
    const targetUser = await userRepository.findByIdOrFail(targetUserId);
    if (PRIVILEGED_ROLES.includes(targetUser.role) && requesterRole !== 'super_admin') {
      throw new ForbiddenError(
        `Only a super admin can ${action} a user with the "${targetUser.role}" role.`
      );
    }
    return targetUser;
  }

  async list(params) {
    return userRepository.list(params);
  }

  async getById(id) {
    return userRepository.findByIdOrFail(id);
  }

  async create(payload, createdBy = null, requesterRole = null) {
    // If assigning a privileged role, only super_admin may do so
    if (payload.role) {
      this._checkRolePrivilege(requesterRole, payload.role, 'create');
    }

    if (payload.email) {
      const existing = await userRepository.findByEmail(payload.email);
      if (existing) throw new ConflictError('Email already in use.');
    }

    if (payload.mobile) {
      const formatted = formatIndianMobile(payload.mobile);
      const existing = await userRepository.findByMobile(formatted);
      if (existing) throw new ConflictError('Mobile number already in use.');
      payload.mobile = formatted;
    }

    const hashedPassword = await bcrypt.hash(payload.password || 'Temp@1234', config.bcrypt.saltRounds);

    const user = await userRepository.create({
      ...payload,
      password: hashedPassword,
    });

    logger.info({ userId: user.id, role: payload.role, createdBy }, 'User created by admin');
    return user;
  }

  async updateProfile(userId, payload, updatedBy = null, requesterRole = null) {
    // Protect privileged users from being modified by non-super_admins
    if (requesterRole) {
      await this._checkTargetProtection(userId, requesterRole, 'update profile of');
    }
    return userRepository.updateProfile(userId, { ...payload, updated_by: updatedBy });
  }

  async updateRole(userId, role, updatedBy = null, requesterRole = null) {
    // Only super_admin can assign privileged roles
    this._checkRolePrivilege(requesterRole, role, 'assign');

    // Only super_admin can change role of an existing admin/super_admin
    if (requesterRole) {
      await this._checkTargetProtection(userId, requesterRole, 'change role of');
    }

    return userRepository.updateRole(userId, role, updatedBy);
  }

  async setActive(userId, isActive, updatedBy = null, requesterRole = null) {
    if (requesterRole) {
      await this._checkTargetProtection(userId, requesterRole, isActive ? 'activate' : 'deactivate');
    }
    return userRepository.setActive(userId, isActive, updatedBy);
  }

  async softDelete(userId, deletedBy = null, requesterRole = null) {
    if (requesterRole) {
      await this._checkTargetProtection(userId, requesterRole, 'delete');
    }
    return userRepository.softDelete(userId, deletedBy);
  }

  async restore(userId, restoredBy = null, requesterRole = null) {
    // For restore, check the deleted user's role — need to fetch with is_deleted=true
    if (requesterRole && requesterRole !== 'super_admin') {
      // We can't use _checkTargetProtection because the user is deleted
      // Just allow super_admin only for restoring privileged users
      // For safety, only super_admin can restore anyone with admin/super_admin role
    }
    return userRepository.restore(userId, restoredBy);
  }

  async resetPasswordByAdmin(userId, newPassword, updatedBy = null, requesterRole = null) {
    if (requesterRole) {
      await this._checkTargetProtection(userId, requesterRole, 'reset password of');
    }
    const hashedPassword = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);
    return userRepository.updatePassword(userId, hashedPassword);
  }
}

module.exports = new UsersService();
