const express = require('express');
const router = express.Router();
const statsController = require('../controleur/statistique.controller');

router.use('/', statsController);

module.exports = router;