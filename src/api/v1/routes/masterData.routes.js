/**
 * ═══════════════════════════════════════════════════════════════
 * MASTER DATA ROUTES — Countries, States, Cities
 * ═══════════════════════════════════════════════════════════════
 */

const { Router } = require('express');
const masterDataController = require('../controllers/masterData.controller');
const validate = require('../../../middleware/validate.middleware');
const authenticate = require('../../../middleware/auth.middleware');
const { authorize } = require('../../../middleware/authorize.middleware');
const { uploadFlagImage } = require('../../../middleware/upload.middleware');

const {
  idParamSchema,
  createCountrySchema,
  updateCountrySchema,
  countryListQuerySchema,
  createStateSchema,
  updateStateSchema,
  stateListQuerySchema,
  createCitySchema,
  updateCitySchema,
  cityListQuerySchema,
} = require('../validators/masterData.validator');

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// ============================================================================
// COUNTRIES ROUTES
// ============================================================================

router.get('/countries', authorize('country.read'), validate(countryListQuerySchema, 'query'), masterDataController.getCountries);
router.get('/countries/:id', authorize('country.read'), validate(idParamSchema, 'params'), masterDataController.getCountryById);

// POST/PUT: uploadFlagImage (multer) runs BEFORE validate so multipart body is parsed
router.post('/countries', authorize('country.create'), uploadFlagImage, validate(createCountrySchema), masterDataController.createCountry);
router.patch('/countries/:id', authorize('country.update'), validate(idParamSchema, 'params'), uploadFlagImage, validate(updateCountrySchema), masterDataController.updateCountry);

router.delete('/countries/:id', authorize('country.delete'), validate(idParamSchema, 'params'), masterDataController.deleteCountry);

// ============================================================================
// STATES ROUTES
// ============================================================================

router.get('/states', authorize('state.read'), validate(stateListQuerySchema, 'query'), masterDataController.getStates);
router.get('/states/:id', authorize('state.read'), validate(idParamSchema, 'params'), masterDataController.getStateById);
router.post('/states', authorize('state.create'), validate(createStateSchema), masterDataController.createState);
router.patch('/states/:id', authorize('state.update'), validate(idParamSchema, 'params'), validate(updateStateSchema), masterDataController.updateState);
router.delete('/states/:id', authorize('state.delete'), validate(idParamSchema, 'params'), masterDataController.deleteState);

// ============================================================================
// CITIES ROUTES
// ============================================================================

router.get('/cities', authorize('city.read'), validate(cityListQuerySchema, 'query'), masterDataController.getCities);
router.get('/cities/:id', authorize('city.read'), validate(idParamSchema, 'params'), masterDataController.getCityById);
router.post('/cities', authorize('city.create'), validate(createCitySchema), masterDataController.createCity);
router.patch('/cities/:id', authorize('city.update'), validate(idParamSchema, 'params'), validate(updateCitySchema), masterDataController.updateCity);
router.delete('/cities/:id', authorize('city.delete'), validate(idParamSchema, 'params'), masterDataController.deleteCity);

module.exports = router;
