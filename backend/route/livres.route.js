const express = require('express')
const router = express.Router();

const {
    createlivres,
    deletelivres ,
    updatelivres,
    chercherLivres,
    getAllLivres
} = require('../controleur/livres.controller');


router.post('/',createlivres);
router.put('/:id', updatelivres)
router.delete('/:id', deletelivres)
router.get('/recherche', chercherLivres);
router.get('/', getAllLivres);

module.exports = router;


