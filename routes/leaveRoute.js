const express = require('express');
const leaveController = require('../controller/leaveController');
const passport = require('../middleware/auth');
const createRateLimiter = require('../middleware/rateLimiter');
const {sessionStatus} = require('../middleware/session');



const router = express.Router();
const authenticateUser = passport.authenticate('jwt', { session: false });


router.post('/reset-leave', authenticateUser, sessionStatus, createRateLimiter(10 * 60 * 1000, 50), leaveController.resetLeave);
router.post('/apply-leave', authenticateUser, sessionStatus, createRateLimiter(10 * 60 * 1000, 50), leaveController.applyLeave);
router.get('/leave-request', authenticateUser, sessionStatus, createRateLimiter(10 * 60 * 1000, 50), leaveController.leaveRequest);
router.patch('/approve-leave/:id', authenticateUser, sessionStatus, createRateLimiter(10 * 60 * 1000, 50), leaveController.approveLeave);

module.exports = router;