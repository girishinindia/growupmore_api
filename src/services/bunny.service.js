/**
 * ═══════════════════════════════════════════════════════════════
 * BUNNY STORAGE SERVICE — CDN File Upload & Management
 * ═══════════════════════════════════════════════════════════════
 * Handles file upload, delete, and URL generation for Bunny.net
 * Storage Zone via their REST API.
 *
 * Upload:  PUT  {storageUrl}/{zone}/{path}  → AccessKey header
 * Delete:  DELETE {storageUrl}/{zone}/{path} → AccessKey header
 * CDN URL: {cdnUrl}/{path}
 *
 * Folder structure on Bunny:
 *   /countries/flags/{filename}
 *   /states/images/{filename}
 *   /cities/images/{filename}
 *   /users/avatars/{filename}
 *   /courses/thumbnails/{filename}
 *   ... (extensible)
 * ═══════════════════════════════════════════════════════════════
 */

const axios = require('axios');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const logger = require('../config/logger');
const { BadRequestError } = require('../utils/errors');

class BunnyStorageService {
  constructor() {
    this.storageZone = config.bunnyStorage.zone;
    this.storageKey = config.bunnyStorage.key;
    this.storageUrl = config.bunnyStorage.url;
    this.cdnUrl = config.bunnyStorage.cdnUrl;
    this.accountApiKey = config.bunnyAccount.apiKey;
  }

  // ─────────────────────────────────────────────────────────────
  //  UPLOAD — Put file to Bunny Storage
  // ─────────────────────────────────────────────────────────────

  /**
   * Upload a file buffer to Bunny Storage
   * @param {Buffer} fileBuffer - The file content
   * @param {string} folder - Destination folder (e.g. 'countries/flags')
   * @param {string} originalName - Original filename for extension extraction
   * @param {Object} [options] - Optional overrides
   * @param {string} [options.customFilename] - Use a custom filename instead of UUID
   * @returns {Promise<{cdnUrl: string, storagePath: string, filename: string}>}
   */
  async uploadFile(fileBuffer, folder, originalName, options = {}) {
    try {
      if (!fileBuffer || fileBuffer.length === 0) {
        throw new BadRequestError('File buffer is empty');
      }

      // Generate unique filename preserving extension
      const ext = path.extname(originalName).toLowerCase();
      const filename = options.customFilename
        ? `${options.customFilename}${ext}`
        : `${uuidv4()}${ext}`;

      // Build storage path: /{zone}/{folder}/{filename}
      const storagePath = `${folder}/${filename}`;
      const uploadUrl = `${this.storageUrl}/${this.storageZone}/${storagePath}`;

      logger.info(`Uploading to Bunny: ${storagePath}`);

      const response = await axios.put(uploadUrl, fileBuffer, {
        headers: {
          AccessKey: this.storageKey,
          'Content-Type': 'application/octet-stream',
          'Content-Length': fileBuffer.length,
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });

      if (response.status !== 201 && response.status !== 200) {
        throw new Error(`Bunny upload failed with status ${response.status}`);
      }

      const cdnFileUrl = `${this.cdnUrl}/${storagePath}`;

      logger.info(`File uploaded successfully: ${cdnFileUrl}`);

      return {
        cdnUrl: cdnFileUrl,
        storagePath,
        filename,
      };
    } catch (error) {
      if (error instanceof BadRequestError) throw error;
      logger.error('BunnyStorageService.uploadFile failed:', error.message);
      throw new Error(`Failed to upload file to CDN: ${error.message}`);
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  DELETE — Remove file from Bunny Storage
  // ─────────────────────────────────────────────────────────────

  /**
   * Delete a file from Bunny Storage
   * @param {string} storagePath - Path relative to zone (e.g. 'countries/flags/abc.png')
   * @returns {Promise<boolean>}
   */
  async deleteFile(storagePath) {
    try {
      if (!storagePath) return false;

      const deleteUrl = `${this.storageUrl}/${this.storageZone}/${storagePath}`;

      logger.info(`Deleting from Bunny: ${storagePath}`);

      const response = await axios.delete(deleteUrl, {
        headers: {
          AccessKey: this.storageKey,
        },
      });

      logger.info(`File deleted successfully: ${storagePath}`);
      return response.status === 200;
    } catch (error) {
      // If file doesn't exist (404), treat as success
      if (error.response && error.response.status === 404) {
        logger.warn(`File not found on Bunny (already deleted?): ${storagePath}`);
        return true;
      }
      logger.error('BunnyStorageService.deleteFile failed:', error.message);
      return false;
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  DELETE BY CDN URL — Extract path from full CDN URL
  // ─────────────────────────────────────────────────────────────

  /**
   * Delete a file using its full CDN URL
   * @param {string} cdnFileUrl - Full CDN URL (e.g. 'https://cdn.growupmore.com/countries/flags/abc.png')
   * @returns {Promise<boolean>}
   */
  async deleteFileByUrl(cdnFileUrl) {
    if (!cdnFileUrl) return false;

    const storagePath = this.extractPathFromCdnUrl(cdnFileUrl);
    if (!storagePath) {
      logger.warn(`Could not extract storage path from URL: ${cdnFileUrl}`);
      return false;
    }

    return this.deleteFile(storagePath);
  }

  // ─────────────────────────────────────────────────────────────
  //  PURGE CACHE — Clear CDN cache for a specific URL
  // ─────────────────────────────────────────────────────────────

  /**
   * Purge CDN cache for a specific URL
   * @param {string} cdnFileUrl - The CDN URL to purge
   * @returns {Promise<boolean>}
   */
  async purgeCache(cdnFileUrl) {
    try {
      if (!cdnFileUrl || !this.accountApiKey) return false;

      await axios.post(
        'https://api.bunny.net/purge',
        null,
        {
          params: { url: cdnFileUrl },
          headers: {
            AccessKey: this.accountApiKey,
          },
        }
      );

      logger.info(`CDN cache purged: ${cdnFileUrl}`);
      return true;
    } catch (error) {
      logger.error('BunnyStorageService.purgeCache failed:', error.message);
      return false;
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  HELPERS
  // ─────────────────────────────────────────────────────────────

  /**
   * Extract storage path from a full CDN URL
   * e.g. 'https://cdn.growupmore.com/countries/flags/abc.png' → 'countries/flags/abc.png'
   */
  extractPathFromCdnUrl(cdnFileUrl) {
    if (!cdnFileUrl || !this.cdnUrl) return null;

    try {
      // Remove CDN base URL to get relative path
      if (cdnFileUrl.startsWith(this.cdnUrl)) {
        const relativePath = cdnFileUrl.substring(this.cdnUrl.length);
        // Remove leading slash
        return relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
      }

      // Fallback: try to parse as URL and extract path
      const url = new URL(cdnFileUrl);
      const pathStr = url.pathname;
      return pathStr.startsWith('/') ? pathStr.substring(1) : pathStr;
    } catch {
      return null;
    }
  }

  /**
   * Build a CDN URL from a storage path
   * @param {string} storagePath - e.g. 'countries/flags/abc.png'
   * @returns {string} Full CDN URL
   */
  getCdnUrl(storagePath) {
    if (!storagePath) return null;
    return `${this.cdnUrl}/${storagePath}`;
  }

  /**
   * Validate that a file is an allowed image type
   * @param {string} mimetype
   * @returns {boolean}
   */
  isAllowedImageType(mimetype) {
    return config.upload.allowedImageTypes.includes(mimetype);
  }

  /**
   * Validate file size
   * @param {number} sizeInBytes
   * @returns {boolean}
   */
  isAllowedFileSize(sizeInBytes) {
    return sizeInBytes <= config.upload.maxFileSizeBytes;
  }
}

module.exports = new BunnyStorageService();
