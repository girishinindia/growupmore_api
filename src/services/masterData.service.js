/**
 * ═══════════════════════════════════════════════════════════════
 * MASTER DATA SERVICE — Business Logic Layer
 * ═══════════════════════════════════════════════════════════════
 * Handles Countries, States, Cities business rules.
 * ═══════════════════════════════════════════════════════════════
 */

const masterDataRepository = require('../repositories/masterData.repository');
const logger = require('../config/logger');
const { BadRequestError, NotFoundError, ConflictError } = require('../utils/errors');

class MasterDataService {
  // ========== COUNTRIES ==========

  async getCountries(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;

      const repoOptions = {
        filterIso2: filters.iso2 || null,
        filterIso3: filters.iso3 || null,
        filterPhoneCode: filters.phoneCode || null,
        filterCurrency: filters.currency || null,
        filterNationality: filters.nationality || null,
        filterNationalLanguage: filters.nationalLanguage || null,
        filterLanguages: filters.languages || null,
        filterIsActive: filters.isActive !== undefined ? filters.isActive : null,
        filterIsDeleted: filters.isDeleted !== undefined ? filters.isDeleted : false,
        searchTerm: search || null,
        sortColumn: sort?.field || 'id',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: pagination.page || 1,
        pageSize: pagination.limit || 20,
      };

      return await masterDataRepository.getCountries(repoOptions);
    } catch (error) {
      logger.error('Error fetching countries:', error);
      throw error;
    }
  }

  async getCountryById(countryId) {
    try {
      if (!countryId) throw new BadRequestError('Country ID is required');

      const country = await masterDataRepository.findCountryById(countryId);
      if (!country) throw new NotFoundError(`Country with ID ${countryId} not found`);

      return country;
    } catch (error) {
      logger.error(`Error fetching country ${countryId}:`, error);
      throw error;
    }
  }

  async createCountry(countryData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!countryData.name) throw new BadRequestError('Country name is required');
      if (!countryData.iso2) throw new BadRequestError('ISO2 code is required');
      if (!countryData.iso3) throw new BadRequestError('ISO3 code is required');

      const created = await masterDataRepository.createCountry(countryData);
      logger.info(`Country created: ${countryData.name}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating country:', error);
      throw error;
    }
  }

  async updateCountry(countryId, updates, actingUserId) {
    try {
      if (!countryId) throw new BadRequestError('Country ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await masterDataRepository.findCountryById(countryId);
      if (!existing) throw new NotFoundError(`Country with ID ${countryId} not found`);

      const updated = await masterDataRepository.updateCountry(countryId, updates);
      logger.info(`Country updated: ${countryId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating country ${countryId}:`, error);
      throw error;
    }
  }

  async deleteCountry(countryId, actingUserId) {
    try {
      if (!countryId) throw new BadRequestError('Country ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await masterDataRepository.findCountryById(countryId);
      if (!existing) throw new NotFoundError(`Country with ID ${countryId} not found`);

      await masterDataRepository.deleteCountry(countryId);
      logger.info(`Country deleted: ${countryId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting country ${countryId}:`, error);
      throw error;
    }
  }

  // ========== STATES ==========

  async getStates(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;

      const repoOptions = {
        filterCountryIso3: filters.countryIso3 || null,
        filterCountryLanguages: filters.countryLanguages || null,
        filterCountryIsActive: filters.countryIsActive !== undefined ? filters.countryIsActive : null,
        filterStateLanguages: filters.stateLanguages || null,
        filterStateIsActive: filters.stateIsActive !== undefined ? filters.stateIsActive : null,
        filterStateIsDeleted: filters.stateIsDeleted !== undefined ? filters.stateIsDeleted : false,
        searchTerm: search || null,
        sortTable: sort?.table || 'state',
        sortColumn: sort?.field || 'id',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: pagination.page || 1,
        pageSize: pagination.limit || 20,
      };

      return await masterDataRepository.getStates(repoOptions);
    } catch (error) {
      logger.error('Error fetching states:', error);
      throw error;
    }
  }

  async getStateById(stateId) {
    try {
      if (!stateId) throw new BadRequestError('State ID is required');

      const state = await masterDataRepository.findStateById(stateId);
      if (!state) throw new NotFoundError(`State with ID ${stateId} not found`);

      return state;
    } catch (error) {
      logger.error(`Error fetching state ${stateId}:`, error);
      throw error;
    }
  }

  async createState(stateData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!stateData.countryId) throw new BadRequestError('Country ID is required');
      if (!stateData.name) throw new BadRequestError('State name is required');

      // Validate country exists
      const country = await masterDataRepository.findCountryById(stateData.countryId);
      if (!country) throw new NotFoundError(`Country with ID ${stateData.countryId} not found`);

      const created = await masterDataRepository.createState(stateData);
      logger.info(`State created: ${stateData.name}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating state:', error);
      throw error;
    }
  }

  async updateState(stateId, updates, actingUserId) {
    try {
      if (!stateId) throw new BadRequestError('State ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await masterDataRepository.findStateById(stateId);
      if (!existing) throw new NotFoundError(`State with ID ${stateId} not found`);

      // If changing country, validate it exists
      if (updates.countryId) {
        const country = await masterDataRepository.findCountryById(updates.countryId);
        if (!country) throw new NotFoundError(`Country with ID ${updates.countryId} not found`);
      }

      const updated = await masterDataRepository.updateState(stateId, updates);
      logger.info(`State updated: ${stateId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating state ${stateId}:`, error);
      throw error;
    }
  }

  async deleteState(stateId, actingUserId) {
    try {
      if (!stateId) throw new BadRequestError('State ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await masterDataRepository.findStateById(stateId);
      if (!existing) throw new NotFoundError(`State with ID ${stateId} not found`);

      await masterDataRepository.deleteState(stateId);
      logger.info(`State deleted: ${stateId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting state ${stateId}:`, error);
      throw error;
    }
  }

  // ========== CITIES ==========

  async getCities(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;

      const repoOptions = {
        filterCountryIso3: filters.countryIso3 || null,
        filterCountryLanguages: filters.countryLanguages || null,
        filterCountryIsActive: filters.countryIsActive !== undefined ? filters.countryIsActive : null,
        filterStateLanguages: filters.stateLanguages || null,
        filterStateIsActive: filters.stateIsActive !== undefined ? filters.stateIsActive : null,
        filterCityTimezone: filters.cityTimezone || null,
        filterCityIsActive: filters.cityIsActive !== undefined ? filters.cityIsActive : null,
        filterCityIsDeleted: filters.cityIsDeleted !== undefined ? filters.cityIsDeleted : false,
        searchTerm: search || null,
        sortTable: sort?.table || 'city',
        sortColumn: sort?.field || 'id',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: pagination.page || 1,
        pageSize: pagination.limit || 20,
      };

      return await masterDataRepository.getCities(repoOptions);
    } catch (error) {
      logger.error('Error fetching cities:', error);
      throw error;
    }
  }

  async getCityById(cityId) {
    try {
      if (!cityId) throw new BadRequestError('City ID is required');

      const city = await masterDataRepository.findCityById(cityId);
      if (!city) throw new NotFoundError(`City with ID ${cityId} not found`);

      return city;
    } catch (error) {
      logger.error(`Error fetching city ${cityId}:`, error);
      throw error;
    }
  }

  async createCity(cityData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!cityData.stateId) throw new BadRequestError('State ID is required');
      if (!cityData.name) throw new BadRequestError('City name is required');

      // Validate state exists
      const state = await masterDataRepository.findStateById(cityData.stateId);
      if (!state) throw new NotFoundError(`State with ID ${cityData.stateId} not found`);

      const created = await masterDataRepository.createCity(cityData);
      logger.info(`City created: ${cityData.name}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating city:', error);
      throw error;
    }
  }

  async updateCity(cityId, updates, actingUserId) {
    try {
      if (!cityId) throw new BadRequestError('City ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await masterDataRepository.findCityById(cityId);
      if (!existing) throw new NotFoundError(`City with ID ${cityId} not found`);

      // If changing state, validate it exists
      if (updates.stateId) {
        const state = await masterDataRepository.findStateById(updates.stateId);
        if (!state) throw new NotFoundError(`State with ID ${updates.stateId} not found`);
      }

      const updated = await masterDataRepository.updateCity(cityId, updates);
      logger.info(`City updated: ${cityId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating city ${cityId}:`, error);
      throw error;
    }
  }

  async deleteCity(cityId, actingUserId) {
    try {
      if (!cityId) throw new BadRequestError('City ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await masterDataRepository.findCityById(cityId);
      if (!existing) throw new NotFoundError(`City with ID ${cityId} not found`);

      await masterDataRepository.deleteCity(cityId);
      logger.info(`City deleted: ${cityId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting city ${cityId}:`, error);
      throw error;
    }
  }

  // ─── COUNTRIES — RESTORE ──────────────────────────────────────

  async restoreCountry(id) {
    if (!id) throw new BadRequestError('Country ID is required');
    await masterDataRepository.restoreCountry(id);
    return { id };
  }

  // ─── STATES — RESTORE ────────────────────────────────────────

  async restoreState(id) {
    if (!id) throw new BadRequestError('State ID is required');
    await masterDataRepository.restoreState(id);
    return { id };
  }

  // ─── CITIES — RESTORE ────────────────────────────────────────

  async restoreCity(id) {
    if (!id) throw new BadRequestError('City ID is required');
    await masterDataRepository.restoreCity(id);
    return { id };
  }
}

module.exports = new MasterDataService();
