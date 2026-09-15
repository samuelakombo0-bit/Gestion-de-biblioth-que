const express = require('express')
const router = express.Router();

const {
    getlivres,
    createlivres,
    deletelivres ,
    updatelivres,
    chercherLivres
} = require('../controleur/livres.controller');

router.get('/', getlivres);
router.post('/',createlivres);
router.put('/:id', updatelivres)
router.delete('/:id', deletelivres)
router.get('/livres/recherche', chercherLivres)

module.exports = router;