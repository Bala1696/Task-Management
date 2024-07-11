const express = require('express');
const moduleController = require('../controller/moduleController');


const router = express.Router();

router.post('/add-module', moduleController.addModule);
router.get('/get-all-module', moduleController.getModule);
router.get('/get-module/:id', moduleController.getModuleById);
router.put('/update-module/:id', moduleController.updateModule);
router.delete('/delete-module/:id', moduleController.deleteModule);

module.exports = router;
