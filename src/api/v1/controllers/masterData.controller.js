/**
 * ═══════════════════════════════════════════════════════════════
 * MASTER DATA CONTROLLER — Countries, States, Cities
 * ═══════════════════════════════════════════════════════════════
 */

const masterDataService = require('../../../services/masterData.service');
const bunnyService = require('../../../services/bunny.service');
const { sendSuccess, sendCreated } = require('../../../utils/response');
const logger = require('../../../config/logger');

/** Bunny CDN folder for country flag images */
const COUNTRY_FLAGS_FOLDER = 'countries/flags';

class MasterDataController {
  // ==================== COUNTRIES ====================

  async getCountries(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'id', sortDir = 'asc', iso2, iso3, phoneCode, currency, nationality, nationalLanguage, isActive } = req.query;

      const filters = {};
      if (iso2 !== undefined) filters.iso2 = iso2;
      if (iso3 !== undefined) filters.iso3 = iso3;
      if (phoneCode !== undefined) filters.phoneCode = phoneCode;
      if (currency !== undefined) filters.currency = currency;
      if (nationality !== undefined) filters.nationality = nationality;
      if (nationalLanguage !== undefined) filters.nationalLanguage = nationalLanguage;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await masterDataService.getCountries({
        filters,
        search,
        sort: { field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = {
        page: Number(page),
        limit: Number(limit),
        totalCount: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / Number(limit)),
      };

      sendSuccess(res, { data, message: 'Countries retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getCountryById(req, res, next) {
    try {
      const data = await masterDataService.getCountryById(req.params.id);
      sendSuccess(res, { data, message: 'Country retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createCountry(req, res, next) {
    try {
      const countryData = { ...req.body };

      // If a flag image file was uploaded, upload it to Bunny CDN
      if (req.file) {
        const uploadResult = await bunnyService.uploadFile(
          req.file.buffer,
          COUNTRY_FLAGS_FOLDER,
          req.file.originalname
        );
        countryData.flagImage = uploadResult.cdnUrl;
        logger.info(`Country flag uploaded to: ${uploadResult.cdnUrl}`);
      }

      const data = await masterDataService.createCountry(countryData, req.user.userId);
      sendCreated(res, { data, message: 'Country created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateCountry(req, res, next) {
    try {
      const countryData = { ...req.body };

      // If a new flag image file was uploaded, upload it to Bunny CDN
      if (req.file) {
        // Fetch existing country to get old flagImage URL for cleanup
        try {
          const existing = await masterDataService.getCountryById(req.params.id);
          if (existing && existing.flag_image) {
            // Delete old flag from Bunny (fire-and-forget, don't block update)
            bunnyService.deleteFileByUrl(existing.flag_image).then((deleted) => {
              if (deleted) {
                bunnyService.purgeCache(existing.flag_image);
                logger.info(`Old country flag deleted: ${existing.flag_image}`);
              }
            }).catch((err) => {
              logger.warn(`Failed to delete old flag image: ${err.message}`);
            });
          }
        } catch (err) {
          logger.warn(`Could not fetch existing country for flag cleanup: ${err.message}`);
        }

        const uploadResult = await bunnyService.uploadFile(
          req.file.buffer,
          COUNTRY_FLAGS_FOLDER,
          req.file.originalname
        );
        countryData.flagImage = uploadResult.cdnUrl;
        logger.info(`Country flag updated to: ${uploadResult.cdnUrl}`);
      }

      const data = await masterDataService.updateCountry(req.params.id, countryData, req.user.userId);
      sendSuccess(res, { data, message: 'Country updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteCountry(req, res, next) {
    try {
      // Fetch existing country to clean up flag image from CDN
      try {
        const existing = await masterDataService.getCountryById(req.params.id);
        if (existing && existing.flag_image) {
          bunnyService.deleteFileByUrl(existing.flag_image).then((deleted) => {
            if (deleted) {
              bunnyService.purgeCache(existing.flag_image);
              logger.info(`Country flag cleaned up on delete: ${existing.flag_image}`);
            }
          }).catch((err) => {
            logger.warn(`Failed to clean up flag image on delete: ${err.message}`);
          });
        }
      } catch (err) {
        logger.warn(`Could not fetch country for flag cleanup on delete: ${err.message}`);
      }

      await masterDataService.deleteCountry(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Country deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ==================== STATES ====================

  async getStates(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'id', sortDir = 'asc', countryIso3, stateIsActive } = req.query;

      const filters = {};
      if (countryIso3 !== undefined) filters.countryIso3 = countryIso3;
      if (stateIsActive !== undefined) filters.stateIsActive = stateIsActive;

      const data = await masterDataService.getStates({
        filters,
        search,
        sort: { field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = {
        page: Number(page),
        limit: Number(limit),
        totalCount: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / Number(limit)),
      };

      sendSuccess(res, { data, message: 'States retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getStateById(req, res, next) {
    try {
      const data = await masterDataService.getStateById(req.params.id);
      sendSuccess(res, { data, message: 'State retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createState(req, res, next) {
    try {
      const data = await masterDataService.createState(req.body, req.user.userId);
      sendCreated(res, { data, message: 'State created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateState(req, res, next) {
    try {
      const data = await masterDataService.updateState(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'State updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteState(req, res, next) {
    try {
      await masterDataService.deleteState(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'State deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ==================== CITIES ====================

  async getCities(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'id', sortDir = 'asc', countryIso3, cityTimezone, cityIsActive } = req.query;

      const filters = {};
      if (countryIso3 !== undefined) filters.countryIso3 = countryIso3;
      if (cityTimezone !== undefined) filters.cityTimezone = cityTimezone;
      if (cityIsActive !== undefined) filters.cityIsActive = cityIsActive;

      const data = await masterDataService.getCities({
        filters,
        search,
        sort: { field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = {
        page: Number(page),
        limit: Number(limit),
        totalCount: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / Number(limit)),
      };

      sendSuccess(res, { data, message: 'Cities retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getCityById(req, res, next) {
    try {
      const data = await masterDataService.getCityById(req.params.id);
      sendSuccess(res, { data, message: 'City retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createCity(req, res, next) {
    try {
      const data = await masterDataService.createCity(req.body, req.user.userId);
      sendCreated(res, { data, message: 'City created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateCity(req, res, next) {
    try {
      const data = await masterDataService.updateCity(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'City updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteCity(req, res, next) {
    try {
      await masterDataService.deleteCity(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'City deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreCountry(req, res, next) {
    try {
      const data = await masterDataService.restoreCountry(req.params.id);
      sendSuccess(res, { message: 'Country restored successfully', data });
    } catch (error) {
      next(error);
    }
  }

  async restoreState(req, res, next) {
    try {
      const data = await masterDataService.restoreState(req.params.id);
      sendSuccess(res, { message: 'State restored successfully', data });
    } catch (error) {
      next(error);
    }
  }

  async restoreCity(req, res, next) {
    try {
      const data = await masterDataService.restoreCity(req.params.id);
      sendSuccess(res, { message: 'City restored successfully', data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MasterDataController();
