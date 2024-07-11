const express = require('express');
const projectController = require('../controller/projectController');
const passport = require('../middleware/auth');
const createRateLimiter = require('../middleware/rateLimiter');
const {sessionStatus} = require('../middleware/session');
const checkPermission = require('../middleware/checkPermission')


const router = express.Router();
const authenticateUser = passport.authenticate('jwt', { session: false });


router.post('/create-project', authenticateUser, sessionStatus, createRateLimiter(10 * 60 * 1000, 50),checkPermission('Projects', 'createProject'), projectController.createProject);
router.get('/get-all-project', authenticateUser, sessionStatus, createRateLimiter(10 * 60 * 1000, 50),checkPermission('Projects', 'getAllProject'), projectController.getAllProjects);
router.patch('/update-project/:id', authenticateUser, sessionStatus, createRateLimiter(10 * 60 * 1000, 50),checkPermission('Projects', 'updateProject'), projectController.updateProject);
router.delete('/delete-project/:id', authenticateUser, sessionStatus, createRateLimiter(10 * 60 * 1000, 50), checkPermission('Projects', 'deleteProject'),projectController.deleteProject);
router.get('/get-project-data/:id', authenticateUser, sessionStatus, createRateLimiter(10 * 60 * 1000, 50),checkPermission('Projects', 'getProjectDataById'), projectController.getProjectDataById);

module.exports = router;