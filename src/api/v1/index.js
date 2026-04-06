/**
 * ═══════════════════════════════════════════════════════════════
 * V1 ROUTES — Registers all v1 route modules
 * ═══════════════════════════════════════════════════════════════
 */

const { Router } = require('express');
const authRoutes = require('./routes/auth.routes');
const rbacRoutes = require('./routes/rbac.routes');
const masterDataRoutes = require('./routes/masterData.routes');
const masterDataExtendedRoutes = require('./routes/masterDataExtended.routes');
const branchManagementRoutes = require('./routes/branchManagement.routes');
const userManagementRoutes = require('./routes/userManagement.routes');
const employeeManagementRoutes = require('./routes/employeeManagement.routes');
const studentManagementRoutes = require('./routes/studentManagement.routes');
const instructorManagementRoutes = require('./routes/instructorManagement.routes');
const materialManagementRoutes = require('./routes/materialManagement.routes');
const courseManagementRoutes = require('./routes/courseManagement.routes');
const questionBankRoutes = require('./routes/questionBank.routes');
const assessmentManagementRoutes = require('./routes/assessmentManagement.routes');
const webinarManagementRoutes = require('./routes/webinarManagement.routes');
const batchManagementRoutes = require('./routes/batchManagement.routes');
const promotionManagementRoutes = require('./routes/promotionManagement.routes');
const referralCodeRoutes = require('./routes/referralCode.routes');
const couponManagementRoutes = require('./routes/couponManagement.routes');
const wishlistCartManagementRoutes = require('./routes/wishlistCartManagement.routes');
const orderManagementRoutes = require('./routes/orderManagement.routes');
const referralManagementRoutes = require('./routes/referralManagement.routes');
const enrollmentManagementRoutes = require('./routes/enrollmentManagement.routes');
const courseReviewManagementRoutes = require('./routes/courseReviewManagement.routes');
const discussionManagementRoutes = require('./routes/discussionManagement.routes');
const certificateManagementRoutes = require('./routes/certificateManagement.routes');
const attendanceManagementRoutes = require('./routes/attendanceManagement.routes');
const supportTicketManagementRoutes = require('./routes/supportTicketManagement.routes');
const specialSessionManagementRoutes = require('./routes/specialSessionManagement.routes');
const callFollowupManagementRoutes = require('./routes/callFollowupManagement.routes');
const blogManagementRoutes = require('./routes/blogManagement.routes');

const router = Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/rbac', rbacRoutes);
router.use('/master-data', masterDataRoutes);
router.use('/master-data', masterDataExtendedRoutes);
router.use('/branch-management', branchManagementRoutes);
router.use('/user-management', userManagementRoutes);
router.use('/employee-management', employeeManagementRoutes);
router.use('/student-management', studentManagementRoutes);
router.use('/instructor-management', instructorManagementRoutes);
router.use('/material-management', materialManagementRoutes);
router.use('/course-management', courseManagementRoutes);
router.use('/question-bank', questionBankRoutes);
router.use('/assessment-management', assessmentManagementRoutes);
router.use('/webinar-management', webinarManagementRoutes);
router.use('/batch-management', batchManagementRoutes);
router.use('/promotion-management', promotionManagementRoutes);
router.use('/referral-codes', referralCodeRoutes);
router.use('/coupon-management', couponManagementRoutes);
router.use('/wishlist-cart-management', wishlistCartManagementRoutes);
router.use('/order-management', orderManagementRoutes);
router.use('/referral-management', referralManagementRoutes);
router.use('/enrollment-management', enrollmentManagementRoutes);
router.use('/course-review-management', courseReviewManagementRoutes);
router.use('/discussion-management', discussionManagementRoutes);
router.use('/certificate-management', certificateManagementRoutes);
router.use('/attendance-management', attendanceManagementRoutes);
router.use('/support-ticket-management', supportTicketManagementRoutes);
router.use('/special-session-management', specialSessionManagementRoutes);
router.use('/call-followup-management', callFollowupManagementRoutes);
router.use('/blog-management', blogManagementRoutes);

module.exports = router;
