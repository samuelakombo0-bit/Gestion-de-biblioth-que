const pool = require('../db'); // 1. AJOUTE CETTE LIGNE

const getAdherents = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM adherents ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

const createAdherent = async (req, res) => {
    try {
        const { nom, tel, email } = req.body;
        const result = await pool.query(
            `INSERT INTO adherents (nom, tel, email) VALUES ($1, $2, $3) RETURNING *`,
            [nom, tel, email]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

const deleteAdherent = async (req, res) => {
    try {
        const { id } = req.params; // celui que l'on veux supprimer

        const result = await pool.query(
            `DELETE FROM adherents WHERE id = $1 RETURNING *`, //  On supprime
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

const updateAdherent = async (req, res) => {
    try {
        const { id } = req.params; // 1.celui que je  modifier
        const { nom, tel, email } = req.body; // 2. Les nouvelles infos

        const result = await pool.query(
            `UPDATE adherents SET nom = $1, tel = $2, email = $3 WHERE id = $4 RETURNING *`, // 3. On update
            [nom, tel, email, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Adhérent non trouvé" });
        }

        res.json(result.rows[0]); // 5. On renvoie l'adhérent modifié

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAdherents, createAdherent, deleteAdherent , updateAdherent};