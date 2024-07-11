const express = require('express');
const roleController = require('../controller/roleController');
const createRateLimiter = require('../middleware/rateLimiter');


const router = express.Router();


router.post('/add-role', createRateLimiter(10 * 60 * 1000, 50), roleController.addRole);
router.delete('/roles/:id', createRateLimiter(10 * 60 * 1000, 50), roleController.deleteRole);
router.put('/roles/:id', roleController.updateRole);
router.get('/roles', roleController.getAllRoles);
router.get('/roles/:id', roleController.getRoleById);
module.exports = router;