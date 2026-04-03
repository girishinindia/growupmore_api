/**
 * ═══════════════════════════════════════════════════════════════
 * V1 ROUTE REGISTRY
 * ═══════════════════════════════════════════════════════════════
 * Registers all v1 route files.
 * Each module mounts its own routes here.
 * ═══════════════════════════════════════════════════════════════
 */

const { Router } = require('express');

// Route files
const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const rolesRoutes = require('./routes/roles.routes');
const permissionsRoutes = require('./routes/permissions.routes');
const countriesRoutes = require('./routes/countries.routes');
const statesRoutes = require('./routes/states.routes');
const citiesRoutes = require('./routes/cities.routes');
const languagesRoutes = require('./routes/languages.routes');
const categoriesRoutes = require('./routes/categories.routes');
const subCategoriesRoutes = require('./routes/sub-categories.routes');
const skillsRoutes = require('./routes/skills.routes');
const educationLevelsRoutes = require('./routes/education-levels.routes');
const designationsRoutes = require('./routes/designations.routes');
const specializationsRoutes = require('./routes/specializations.routes');
const learningGoalsRoutes = require('./routes/learning-goals.routes');
const socialMediasRoutes = require('./routes/social-medias.routes');
const documentTypesRoutes = require('./routes/document-types.routes');

const router = Router();

// ─── Health Check (versioned) ────────────────────────────────
router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'API v1 is running', version: 'v1' });
});

// ─── Auth ────────────────────────────────────────────────────
router.use('/auth', authRoutes);

// ─── Users ───────────────────────────────────────────────────
router.use('/users', usersRoutes);

// ─── Roles & Permissions ─────────────────────────────────────
router.use('/roles', rolesRoutes);
router.use('/permissions', permissionsRoutes);

// ─── Master Data (Phase 02) ──────────────────────────────────
router.use('/countries', countriesRoutes);
router.use('/states', statesRoutes);
router.use('/cities', citiesRoutes);
router.use('/languages', languagesRoutes);
router.use('/categories', categoriesRoutes);
router.use('/sub-categories', subCategoriesRoutes);
router.use('/skills', skillsRoutes);
router.use('/education-levels', educationLevelsRoutes);
router.use('/designations', designationsRoutes);
router.use('/specializations', specializationsRoutes);
router.use('/learning-goals', learningGoalsRoutes);
router.use('/social-medias', socialMediasRoutes);
router.use('/document-types', documentTypesRoutes);

// ─── Future modules (uncomment as built) ─────────────────────
// router.use('/branches', branchesRoutes);          // Phase 03
// router.use('/profiles', profilesRoutes);          // Phase 04
// router.use('/courses', coursesRoutes);            // Phase 09
// router.use('/course-batches', courseBatchesRoutes); // Phase 13
// router.use('/enrollments', enrollmentsRoutes);    // Phase 20
// router.use('/payments', paymentsRoutes);          // Phase 18
// router.use('/reviews', reviewsRoutes);            // Phase 21
// router.use('/discussions', discussionsRoutes);    // Phase 22
// router.use('/certificates', certificatesRoutes);  // Phase 23
// router.use('/tickets', ticketsRoutes);            // Phase 25
// router.use('/blogs', blogsRoutes);                // Phase 28
// router.use('/chat', chatRoutes);                  // Phase 31
// router.use('/announcements', announcementsRoutes); // Phase 32
// router.use('/wallet', walletRoutes);              // Phase 33
// router.use('/internships', internshipsRoutes);    // Phase 34
// router.use('/notifications', notificationsRoutes); // Phase 35
// router.use('/webhooks', webhooksRoutes);          // Razorpay/Brevo callbacks

module.exports = router;
