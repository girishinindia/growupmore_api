/**
 * ═══════════════════════════════════════════════════════════════
 * MASTER DATA REPOSITORY — Database Layer (Supabase RPC)
 * ═══════════════════════════════════════════════════════════════
 * Handles Countries, States, Cities via:
 *
 *   COUNTRIES:
 *   - udf_get_countries       — read, search, filter, paginate
 *   - sp_countries_insert     — create, returns new id (BIGINT)
 *   - sp_countries_update     — update, returns void
 *   - sp_countries_delete     — soft delete, returns void
 *
 *   STATES:
 *   - udf_get_states           — read, search, filter, paginate
 *   - sp_states_insert        — create, returns new id (BIGINT)
 *   - sp_states_update        — update, returns void
 *   - sp_states_delete        — soft delete, returns void
 *
 *   CITIES:
 *   - udf_get_cities           — read, search, filter, paginate
 *   - sp_cities_insert        — create, returns new id (BIGINT)
 *   - sp_cities_update        — update, returns void
 *   - sp_cities_delete        — soft delete, returns void
 * ═══════════════════════════════════════════════════════════════
 */

const { supabase } = require('../config/database');
const logger = require('../config/logger');

class MasterDataRepository {
  // ─────────────────────────────────────────────────────────────
  //  COUNTRIES — READ
  // ─────────────────────────────────────────────────────────────

  async findCountryById(countryId) {
    const { data, error } = await supabase.rpc('udf_get_countries', {
      p_id: countryId,
      p_is_active: null,
      p_sort_column: 'id',
      p_sort_direction: 'ASC',
      p_filter_iso2: null,
      p_filter_iso3: null,
      p_filter_phone_code: null,
      p_filter_currency: null,
      p_filter_nationality: null,
      p_filter_national_language: null,
      p_filter_languages: null,
      p_filter_is_active: null,
      p_filter_is_deleted: false,
      p_search_term: null,
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'MasterDataRepository.findCountryById failed');
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  async getCountries(options = {}) {
    const { data, error } = await supabase.rpc('udf_get_countries', {
      p_id: null,
      p_is_active: null,
      p_sort_column: options.sortColumn || 'id',
      p_sort_direction: options.sortDirection || 'ASC',
      p_filter_iso2: options.filterIso2 || null,
      p_filter_iso3: options.filterIso3 || null,
      p_filter_phone_code: options.filterPhoneCode || null,
      p_filter_currency: options.filterCurrency || null,
      p_filter_nationality: options.filterNationality || null,
      p_filter_national_language: options.filterNationalLanguage || null,
      p_filter_languages: options.filterLanguages || null,
      p_filter_is_active: options.filterIsActive !== undefined ? options.filterIsActive : null,
      p_filter_is_deleted: options.filterIsDeleted !== undefined ? options.filterIsDeleted : false,
      p_search_term: options.searchTerm || null,
      p_page_index: options.pageIndex || 1,
      p_page_size: options.pageSize || 20,
    });

    if (error) {
      logger.error({ error }, 'MasterDataRepository.getCountries failed');
      throw error;
    }

    return data || [];
  }

  // ─────────────────────────────────────────────────────────────
  //  COUNTRIES — WRITE
  // ─────────────────────────────────────────────────────────────

  async createCountry(countryData) {
    const { data, error } = await supabase.rpc('sp_countries_insert', {
      p_name: countryData.name,
      p_iso2: countryData.iso2,
      p_iso3: countryData.iso3,
      p_phone_code: countryData.phoneCode || null,
      p_currency: countryData.currency || null,
      p_currency_name: countryData.currencyName || null,
      p_currency_symbol: countryData.currencySymbol || null,
      p_national_language: countryData.nationalLanguage || null,
      p_nationality: countryData.nationality || null,
      p_languages: countryData.languages || [],
      p_tld: countryData.tld || null,
      p_flag_image: countryData.flagImage || null,
      p_is_active: countryData.isActive !== undefined ? countryData.isActive : false,
    });

    if (error) {
      logger.error({ error }, 'MasterDataRepository.createCountry failed');
      throw error;
    }

    // sp_countries_insert returns BIGINT (new id)
    const newId = data;
    return this.findCountryById(newId);
  }

  async updateCountry(countryId, updates) {
    const { data, error } = await supabase.rpc('sp_countries_update', {
      p_id: countryId,
      p_name: updates.name || null,
      p_iso2: updates.iso2 || null,
      p_iso3: updates.iso3 || null,
      p_phone_code: updates.phoneCode !== undefined ? updates.phoneCode : null,
      p_currency: updates.currency !== undefined ? updates.currency : null,
      p_currency_name: updates.currencyName !== undefined ? updates.currencyName : null,
      p_currency_symbol: updates.currencySymbol !== undefined ? updates.currencySymbol : null,
      p_national_language: updates.nationalLanguage !== undefined ? updates.nationalLanguage : null,
      p_nationality: updates.nationality !== undefined ? updates.nationality : null,
      p_languages: updates.languages !== undefined ? updates.languages : null,
      p_tld: updates.tld !== undefined ? updates.tld : null,
      p_flag_image: updates.flagImage !== undefined ? updates.flagImage : null,
      p_is_active: updates.isActive !== undefined ? updates.isActive : null,
    });

    if (error) {
      logger.error({ error }, 'MasterDataRepository.updateCountry failed');
      throw error;
    }

    return this.findCountryById(countryId);
  }

  async deleteCountry(countryId) {
    const { error } = await supabase.rpc('sp_countries_delete', {
      p_id: countryId,
    });

    if (error) {
      logger.error({ error }, 'MasterDataRepository.deleteCountry failed');
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  STATES — READ
  // ─────────────────────────────────────────────────────────────

  async findStateById(stateId) {
    const { data, error } = await supabase.rpc('udf_get_states', {
      p_id: stateId,
      p_country_is_active: null,
      p_state_is_active: null,
      p_sort_table: 'state',
      p_sort_column: 'id',
      p_sort_direction: 'ASC',
      p_filter_country_iso3: null,
      p_filter_country_languages: null,
      p_filter_country_is_active: null,
      p_filter_country_is_deleted: null,
      p_filter_state_languages: null,
      p_filter_state_is_active: null,
      p_filter_state_is_deleted: false,
      p_search_term: null,
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'MasterDataRepository.findStateById failed');
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  async getStates(options = {}) {
    const { data, error } = await supabase.rpc('udf_get_states', {
      p_id: null,
      p_country_is_active: null,
      p_state_is_active: null,
      p_sort_table: options.sortTable || 'state',
      p_sort_column: options.sortColumn || 'id',
      p_sort_direction: options.sortDirection || 'ASC',
      p_filter_country_iso3: options.filterCountryIso3 || null,
      p_filter_country_languages: options.filterCountryLanguages || null,
      p_filter_country_is_active: options.filterCountryIsActive !== undefined ? options.filterCountryIsActive : null,
      p_filter_country_is_deleted: options.filterCountryIsDeleted !== undefined ? options.filterCountryIsDeleted : null,
      p_filter_state_languages: options.filterStateLanguages || null,
      p_filter_state_is_active: options.filterStateIsActive !== undefined ? options.filterStateIsActive : null,
      p_filter_state_is_deleted: options.filterStateIsDeleted !== undefined ? options.filterStateIsDeleted : false,
      p_search_term: options.searchTerm || null,
      p_page_index: options.pageIndex || 1,
      p_page_size: options.pageSize || 20,
    });

    if (error) {
      logger.error({ error }, 'MasterDataRepository.getStates failed');
      throw error;
    }

    return data || [];
  }

  // ─────────────────────────────────────────────────────────────
  //  STATES — WRITE
  // ─────────────────────────────────────────────────────────────

  async createState(stateData) {
    const { data, error } = await supabase.rpc('sp_states_insert', {
      p_country_id: stateData.countryId,
      p_name: stateData.name,
      p_languages: stateData.languages || [],
      p_website: stateData.website || null,
      p_is_active: stateData.isActive !== undefined ? stateData.isActive : false,
    });

    if (error) {
      logger.error({ error }, 'MasterDataRepository.createState failed');
      throw error;
    }

    const newId = data;
    return this.findStateById(newId);
  }

  async updateState(stateId, updates) {
    const { error } = await supabase.rpc('sp_states_update', {
      p_id: stateId,
      p_country_id: updates.countryId !== undefined ? updates.countryId : null,
      p_name: updates.name || null,
      p_languages: updates.languages !== undefined ? updates.languages : null,
      p_website: updates.website !== undefined ? updates.website : null,
      p_is_active: updates.isActive !== undefined ? updates.isActive : null,
    });

    if (error) {
      logger.error({ error }, 'MasterDataRepository.updateState failed');
      throw error;
    }

    return this.findStateById(stateId);
  }

  async deleteState(stateId) {
    const { error } = await supabase.rpc('sp_states_delete', {
      p_id: stateId,
    });

    if (error) {
      logger.error({ error }, 'MasterDataRepository.deleteState failed');
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  CITIES — READ
  // ─────────────────────────────────────────────────────────────

  async findCityById(cityId) {
    const { data, error } = await supabase.rpc('udf_get_cities', {
      p_id: cityId,
      p_country_is_active: null,
      p_state_is_active: null,
      p_city_is_active: null,
      p_sort_table: 'city',
      p_sort_column: 'id',
      p_sort_direction: 'ASC',
      p_filter_country_iso3: null,
      p_filter_country_languages: null,
      p_filter_country_is_active: null,
      p_filter_country_is_deleted: null,
      p_filter_state_languages: null,
      p_filter_state_is_active: null,
      p_filter_state_is_deleted: null,
      p_filter_city_timezone: null,
      p_filter_city_is_active: null,
      p_filter_city_is_deleted: false,
      p_search_term: null,
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'MasterDataRepository.findCityById failed');
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  async getCities(options = {}) {
    const { data, error } = await supabase.rpc('udf_get_cities', {
      p_id: null,
      p_country_is_active: null,
      p_state_is_active: null,
      p_city_is_active: null,
      p_sort_table: options.sortTable || 'city',
      p_sort_column: options.sortColumn || 'id',
      p_sort_direction: options.sortDirection || 'ASC',
      p_filter_country_iso3: options.filterCountryIso3 || null,
      p_filter_country_languages: options.filterCountryLanguages || null,
      p_filter_country_is_active: options.filterCountryIsActive !== undefined ? options.filterCountryIsActive : null,
      p_filter_country_is_deleted: options.filterCountryIsDeleted !== undefined ? options.filterCountryIsDeleted : null,
      p_filter_state_languages: options.filterStateLanguages || null,
      p_filter_state_is_active: options.filterStateIsActive !== undefined ? options.filterStateIsActive : null,
      p_filter_state_is_deleted: options.filterStateIsDeleted !== undefined ? options.filterStateIsDeleted : null,
      p_filter_city_timezone: options.filterCityTimezone || null,
      p_filter_city_is_active: options.filterCityIsActive !== undefined ? options.filterCityIsActive : null,
      p_filter_city_is_deleted: options.filterCityIsDeleted !== undefined ? options.filterCityIsDeleted : false,
      p_search_term: options.searchTerm || null,
      p_page_index: options.pageIndex || 1,
      p_page_size: options.pageSize || 20,
    });

    if (error) {
      logger.error({ error }, 'MasterDataRepository.getCities failed');
      throw error;
    }

    return data || [];
  }

  // ─────────────────────────────────────────────────────────────
  //  CITIES — WRITE
  // ─────────────────────────────────────────────────────────────

  async createCity(cityData) {
    const { data, error } = await supabase.rpc('sp_cities_insert', {
      p_state_id: cityData.stateId,
      p_name: cityData.name,
      p_phonecode: cityData.phonecode || null,
      p_timezone: cityData.timezone || null,
      p_website: cityData.website || null,
      p_is_active: cityData.isActive !== undefined ? cityData.isActive : false,
    });

    if (error) {
      logger.error({ error }, 'MasterDataRepository.createCity failed');
      throw error;
    }

    const newId = data;
    return this.findCityById(newId);
  }

  async updateCity(cityId, updates) {
    const { error } = await supabase.rpc('sp_cities_update', {
      p_id: cityId,
      p_state_id: updates.stateId !== undefined ? updates.stateId : null,
      p_name: updates.name || null,
      p_phonecode: updates.phonecode !== undefined ? updates.phonecode : null,
      p_timezone: updates.timezone !== undefined ? updates.timezone : null,
      p_website: updates.website !== undefined ? updates.website : null,
      p_is_active: updates.isActive !== undefined ? updates.isActive : null,
    });

    if (error) {
      logger.error({ error }, 'MasterDataRepository.updateCity failed');
      throw error;
    }

    return this.findCityById(cityId);
  }

  async deleteCity(cityId) {
    const { error } = await supabase.rpc('sp_cities_delete', {
      p_id: cityId,
    });

    if (error) {
      logger.error({ error }, 'MasterDataRepository.deleteCity failed');
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  COUNTRIES — RESTORE
  // ─────────────────────────────────────────────────────────────

  async restoreCountry(countryId) {
    const { error } = await supabase.rpc('sp_countries_restore', {
      p_id: countryId,
    });

    if (error) {
      logger.error({ error }, 'MasterDataRepository.restoreCountry failed');
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  STATES — RESTORE
  // ─────────────────────────────────────────────────────────────

  async restoreState(stateId) {
    const { error } = await supabase.rpc('sp_states_restore', {
      p_id: stateId,
    });

    if (error) {
      logger.error({ error }, 'MasterDataRepository.restoreState failed');
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  CITIES — RESTORE
  // ─────────────────────────────────────────────────────────────

  async restoreCity(cityId) {
    const { error } = await supabase.rpc('sp_cities_restore', {
      p_id: cityId,
    });

    if (error) {
      logger.error({ error }, 'MasterDataRepository.restoreCity failed');
      throw error;
    }
  }
}

module.exports = new MasterDataRepository();
