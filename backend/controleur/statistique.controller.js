const express = require('express');
const router = express.Router();
const pool = require('../db');

// Route directe sans contrôleur séparé pour éviter le bug
router.get('/', async (req, res) => {
  try {
    const totalLivres = await pool.query('SELECT COUNT(*) FROM livres');
    const totalAdherents = await pool.query('SELECT COUNT(*) FROM adherents');
    const empruntsEnCours = await pool.query("SELECT COUNT(*) FROM emprunts WHERE statut = 'en_cours'");
    const retards = await pool.query("SELECT COUNT(*) FROM emprunts WHERE date_retour_prevue < NOW() AND statut = 'en_cours'");

    res.json({
      total_livres: parseInt(totalLivres.rows[0].count),
      total_adherents: parseInt(totalAdherents.rows[0].count),
      emprunts_en_cours: parseInt(empruntsEnCours.rows[0].count),
      emprunts_en_retard: parseInt(retards.rows[0].count)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
router.get('/populaires', async (req, res) => {
  try {
    const livrePopulaire = await pool.query(`
      SELECT livres.titre, COUNT(*) as count
      FROM emprunts e
      JOIN livres l ON e.livre_id = livres.id
      GROUP BY livres.id, livres.titre
      ORDER BY count DESC
      LIMIT 1
    `);
    const adherentActif = await pool.query(`
      SELECT auteurs.nom, COUNT(*) as count
      FROM emprunts auteurs
      JOIN adherents auteurs ON e.adherent_id = auteurs.id
      GROUP BY auteurs.id, auteurs.nom
      ORDER BY count DESC
      LIMIT 1
    `);
    res.json({
      livre: livrePopulaire.rows[0] || null,
      adherent: adherentActif.rows[0] || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;