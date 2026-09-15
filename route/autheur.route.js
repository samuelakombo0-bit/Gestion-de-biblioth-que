const express = require('express')
const router = express.Router();

const {
    getAutheur,
    createAutheur,
    updateAutheur,
    deleteAuteur
} = require('../controleur/autheur.controller');

router.get('/', getAutheur);
router.post('/',createAutheur);
router.put('/:id', updateAutheur )
router.delete('/:id', deleteAuteur)

module.exports = router;