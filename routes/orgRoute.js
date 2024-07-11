const express = require('express');
const orgController = require('../controller/orgController');
const passport = require('../middleware/auth');
const createRateLimiter = require('../middleware/rateLimiter');
const {sessionStatus} = require('../middleware/session');



const router = express.Router();
const authenticateUser = passport.authenticate('jwt', { session: false });


router.post('/create-org', authenticateUser, sessionStatus, createRateLimiter(10 * 60 * 1000, 50), orgController.createOrg);
router.get('/get-org', authenticateUser, sessionStatus, createRateLimiter(10 * 60 * 1000, 50), orgController.getOrg);
router.patch('/update-org/:id', authenticateUser, sessionStatus, createRateLimiter(10 * 60 * 1000, 50), orgController.updateOrg);
router.delete('/delete-org/:id', authenticateUser, sessionStatus, createRateLimiter(10 * 60 * 1000, 50), orgController.deleteOrg);

module.exports = router;