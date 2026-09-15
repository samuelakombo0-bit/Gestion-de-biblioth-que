const express = require('express');
const router = express.Router();

const {
    getAdherents,
    createAdherent,
    deleteAdherent ,
    updateAdherent
} = require('../controleur/adherent.controller'); 

router.get('/', getAdherents);
router.post('/', createAdherent);
router.put('/:id', updateAdherent);
router.delete('/:id', deleteAdherent);



module.exports = router; 