/**
 * ═══════════════════════════════════════════════════════════════
 * MIDDLEWARE — Multer File Upload
 * ═══════════════════════════════════════════════════════════════
 * Provides configurable multer middleware for handling
 * multipart/form-data file uploads. Files are stored in memory
 * (buffer) for direct upload to Bunny CDN — no disk I/O.
 * ═══════════════════════════════════════════════════════════════
 */

const multer = require('multer');
const config = require('../config');
const { BadRequestError } = require('../utils/errors');

// Memory storage — files stay in buffer, never touch disk
const storage = multer.memoryStorage();

/**
 * Create a multer upload instance with configurable options
 * @param {Object} options
 * @param {string[]} [options.allowedTypes] - Allowed MIME types (defaults to config image types)
 * @param {number}   [options.maxSizeMB]   - Max file size in MB (defaults to config)
 * @param {number}   [options.maxFiles]    - Max number of files for .array() (default 1)
 */
const createUpload = (options = {}) => {
  const allowedTypes = options.allowedTypes || config.upload.allowedImageTypes;
  const maxSizeBytes = (options.maxSizeMB || config.upload.maxFileSizeMB) * 1024 * 1024;

  return multer({
    storage,
    limits: {
      fileSize: maxSizeBytes,
    },
    fileFilter: (_req, file, cb) => {
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new BadRequestError(
            `Invalid file type: ${file.mimetype}. Allowed types: ${allowedTypes.join(', ')}`
          ),
          false
        );
      }
    },
  });
};

// ─── Pre-built middleware instances ────────────────────────────

/**
 * Single image upload — field name 'image'
 * Use: router.post('/upload', uploadImage, handler)
 * Access file: req.file
 */
const uploadImage = createUpload().single('image');

/**
 * Single flag image upload — field name 'flagImage'
 * Use: router.post('/countries', uploadFlagImage, handler)
 * Access file: req.file
 */
const uploadFlagImage = createUpload().single('flagImage');

/**
 * Multiple images upload — field name 'images', max 10
 * Use: router.post('/gallery', uploadImages, handler)
 * Access files: req.files
 */
const uploadImages = createUpload().array('images', 10);

/**
 * Wrapper to handle multer errors gracefully
 * Converts multer errors to our standard BadRequestError
 */
const handleUploadError = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(
              new BadRequestError(`File too large. Maximum size: ${config.upload.maxFileSizeMB}MB`)
            );
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return next(new BadRequestError(`Unexpected file field: ${err.field}`));
          }
          return next(new BadRequestError(`Upload error: ${err.message}`));
        }
        return next(err);
      }
      next();
    });
  };
};

module.exports = {
  createUpload,
  uploadImage: handleUploadError(uploadImage),
  uploadFlagImage: handleUploadError(uploadFlagImage),
  uploadImages: handleUploadError(uploadImages),
  handleUploadError,
};
