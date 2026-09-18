const express = require('express');
const router = express.Router();
const pool = require('../db');

// Route directe sans contrôleur séparé pour éviter le bug
router.get('/', async (req, res) => {
  try {
    const totalLivres = await pool.query('SELECT COUNT(*) FROM livres');
    const totalAdherents = await pool.query('SELECT COUNT(*) FROM adherents');
    const empruntsEnCours = await pool.query("SELECT COUNT(*) FROM emprunt WHERE date_retour_reelle IS NULL");
    const retards = await pool.query("SELECT COUNT(*) FROM emprunt WHERE date_retour_prevue < CURRENT_DATE AND date_retour_reelle IS NULL");

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
      SELECT l.titre, COUNT(*) as count
      FROM emprunt e
      JOIN livres l ON e.livre_id = l.id_livres
      GROUP BY l.id_livres, l.titre
      ORDER BY count DESC
      LIMIT 1
    `);
    const adherentActif = await pool.query(`
      SELECT a.nom, COUNT(*) as count
      FROM emprunt e
      JOIN adherents a ON e.adherent_id = a.id
      GROUP BY a.id, a.nom
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