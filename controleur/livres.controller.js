const pool = require('../db'); 

const getlivres = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM livres ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

const createlivres = async (req, res) => {
  try {
        const { titre, auteurs_id, nom_livres, annee_publication } = req.body;
        const result = await pool.query(
            `INSERT INTO livres (titre, auteurs_id, nom_livres, annee_publication)
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

        res.json({ message: "Adhérent supprimé", adherent: result.rows[0] }); // 4. On renvoie celui qu'on a supprimé

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
            `UPDATE livre SET titre=$1, auteurs_id=$2, nom_livres=$3, annee_publication=$4, WHERE id=$6 RETURNING *`,
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

        // ILIKE = LIKE mais insensible à majuscule/minuscule (super important)
        // % = veut dire "n'importe quoi avant/après"
        const resultat = await pool.query(
            `SELECT l.*, a.nom as auteur_nom 
             FROM livres l
             LEFT JOIN auteurs a ON l.auteur_id = a.id
             WHERE livres.titre ILIKE $1 
                OR livres.resume ILIKE $1
                OR autheur.nom ILIKE $1
             ORDER BY livres.titre ASC`,
            [`%${search}%`] // on entoure de %
        );

        res.json(resultat.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}
module.exports = { getlivres, createlivres, deletelivres , updatelivres, chercherLivres};