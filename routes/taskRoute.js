const express = require('express');
const taskController = require('../controller/taskController');
const passport = require('../middleware/auth');
const fileHelper = require('../helper/fileHelper');
const createRateLimiter = require('../middleware/rateLimiter');
const {sessionStatus} = require('../middleware/session');



const router = express.Router();
const authenticateUser = passport.authenticate('jwt', { session: false });


router.post('/create-task/:id', authenticateUser, sessionStatus, createRateLimiter(10 * 60 * 1000, 50), taskController.createTask);
router.patch('/update-task/:id', authenticateUser, sessionStatus, createRateLimiter(10 * 60 * 1000, 50), fileHelper.taskUpload.single('File'), taskController.updateTask);
router.delete('/delete-task/:id', authenticateUser, sessionStatus, createRateLimiter(10 * 60 * 1000, 50), taskController.deleteTask);
router.get('/get-task/:id', authenticateUser, sessionStatus, createRateLimiter(10 * 60 * 1000, 50), taskController.getTask);

module.exports = router;
