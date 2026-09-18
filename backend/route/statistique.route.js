const express = require('express');
const router = express.Router();
const statsController = require('../controleur/statistique.controller');

router.get('/', statsController);

module.exports = router;