const pool = require('../db'); 



const createlivres = async (req, res) => {
  try {
        const { titre, auteurs_id, nom_livres, annee_publication } = req.body;
        const result = await pool.query(
            `INSERT INTO livres (titre, auteur_id, nom_livres, annee_publication)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [titre, auteurs_id, nom_livres, annee_publication]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deletelivres = async (req, res) => {
    try {
        const { id } = req.params; // celui que l'on veux supprimer

        const result = await pool.query(
            `DELETE FROM livres WHERE id = $1 RETURNING *`, //  On supprime
            [id]
        );

        if (result.rows.length === 0) { //  Vérification 
            return res.status(404).json({ message: "Adhérent non trouvé" });
        }

        res.json({ message: " livres supprimé", adherent: result.rows[0] }); // 4. On renvoie celui qu'on a supprimé

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

const updatelivres = async (req, res) => {

    try {
        const { id } = req.params;
      const { titre, auteurs_id, nom_livres, annee_publication }= req.body;
        const result = await pool.query(
            `UPDATE livres SET titre=$1, auteurs_id=$2, nom_livres=$3, annee_publication=$4 WHERE id=$5 RETURNING *`,
            [titre, auteurs_id, nom_livres, annee_publication, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Livre non trouvé" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const chercherLivres = async (req, res) => {
    try {
        const { search } = req.query; // recherche qu'il tape
        // si elle ne fonctionne pas 
        if (!search) {
            
            const all = await pool.query(`SELECT * FROM livres ORDER BY id DESC`);
            return res.json(all.rows);
        }

     
        const resultat = await pool.query(
            `SELECT livres*, auteurs.nom as auteurs_nom 
             FROM livres 
             LEFT JOIN auteurs a ON livres.auteur_id = auteurs.id
             WHERE livres.titre ILIKE $1 
                OR livres.resume ILIKE $1
                OR auteurs.nom ILIKE $1
             ORDER BY livres.titre ASC`,
            [`%${search}%`] // on entoure de %
        );

        res.json(resultat.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}

const getAllLivres = async (req, res) => {
  try {
  
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const totalResult = await pool.query('SELECT COUNT(*) FROM livres');
    const total = parseInt(totalResult.rows[0].count);

    const result = await pool.query(
      'SELECT * FROM livres ORDER BY id_livres LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    res.json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: result.rows
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports = { createlivres, deletelivres , updatelivres, chercherLivres, getAllLivres};