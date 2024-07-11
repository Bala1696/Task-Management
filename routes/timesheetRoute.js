const express = require('express');
const timesheetController = require('../controller/timesheetController');
const passport = require('../middleware/auth');
const createRateLimiter = require('../middleware/rateLimiter');
const {sessionStatus} = require('../middleware/session');



const router = express.Router();
const authenticateUser = passport.authenticate('jwt', {session:'false'});


router.get('/my-timesheet-data', authenticateUser, sessionStatus, createRateLimiter(10 * 60 * 1000, 50), timesheetController.myTimesheetData);
router.get('/team-timesheet-data', authenticateUser, sessionStatus, createRateLimiter(10 * 60 * 1000, 50), timesheetController.teamTimesheetData);
router.get('/get-team-members', authenticateUser, sessionStatus, createRateLimiter(10 * 60 * 1000, 50), timesheetController.getTeamMembers);
router.get('/get-weekly-report/:id', authenticateUser, sessionStatus, createRateLimiter(10 * 60 * 1000, 50), timesheetController.getWeeklyReport);

module.exports = router;