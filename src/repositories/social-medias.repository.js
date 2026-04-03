/**
 * ═══════════════════════════════════════════════════════════════
 * SOCIAL-MEDIAS REPOSITORY
 * ═══════════════════════════════════════════════════════════════
 */

const BaseRepository = require('./base.repository');

class SocialMediasRepository extends BaseRepository {
  async list(page = 1, limit = 20) {
    const pageIndex = page - 1;
    return this.callFunctionPaginated('udf_get_social_medias', {
      p_page_index: pageIndex,
      p_page_size: limit,
    });
  }

  async getById(id) {
    return this.callFunctionSingle(
      'udf_get_social_medias',
      { p_id: id },
      'Social Media'
    );
  }

  async create(payload) {
    return this.callProcedure('sp_social_medias_insert', {
      p_name: payload.name,
      p_platform_type: payload.platform_type,
      p_is_active: payload.is_active !== false,
    });
  }

  async update(id, payload) {
    return this.callProcedure('sp_social_medias_update', {
      p_id: id,
      p_name: payload.name,
      p_platform_type: payload.platform_type,
      p_is_active: payload.is_active,
    });
  }

  async delete(id) {
    return this.callProcedure('sp_social_medias_delete', { p_id: id });
  }
}

module.exports = new SocialMediasRepository();
