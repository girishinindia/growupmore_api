/**
 * PERMISSIONS SERVICE
 */

const permissionsRepository = require('../repositories/permissions.repository');
const modulesRepository = require('../repositories/modules.repository');

class PermissionsService {
  // Permissions
  async listPermissions(params) { return permissionsRepository.list(params); }
  async getPermissionById(id) { return permissionsRepository.getById(id); }
  async createPermission(payload) { return permissionsRepository.create(payload); }
  async updatePermission(id, payload) { return permissionsRepository.update(id, payload); }
  async deletePermission(id) { return permissionsRepository.delete(id); }
  async restorePermission(id) { return permissionsRepository.restore(id); }

  // Modules
  async listModules(params) { return modulesRepository.list(params); }
  async getModuleById(id) { return modulesRepository.getById(id); }
  async createModule(payload) { return modulesRepository.create(payload); }
  async updateModule(id, payload) { return modulesRepository.update(id, payload); }
  async deleteModule(id) { return modulesRepository.delete(id); }
  async restoreModule(id) { return modulesRepository.restore(id); }
}

module.exports = new PermissionsService();
