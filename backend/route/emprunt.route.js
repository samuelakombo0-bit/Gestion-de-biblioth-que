const express = require('express');
const router = express.Router();

const { createEmprunt, retourEmprunt, getRetards, getByAdherent, getTousLesEmprunts } = require('../controleur/emprunt.controller');
router.get('/', getTousLesEmprunts);
router.post('/', createEmprunt);
router.post('/:id/retour', retourEmprunt);
router.get('/retards', getRetards);
router.get('/adherent/:adherent_id', getByAdherent);

module.exports = router;