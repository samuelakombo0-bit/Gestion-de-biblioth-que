const express = require('express');
const pool = require('../db');

const getAutheur = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM auteurs ORDER BY id'
        );

        res.json(result.rows);

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: err.message
        });
    }
};

const createAutheur = async (req, res) => {
    try {
        const { nom, nationalite, date_naissance } = req.body;

        const result = await pool.query(
            `INSERT INTO auteur (nom, nationalite, date_naissance)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [nom, nationalite, date_naissance]
        );

        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: err.message
        });
    }
};
const updateAutheur = async (req, res) => {
    try{
        const {id} = req.params; // id a modifier
        const {nom, nationalite, date_naissance}= req.body;

        const resultat = await pool.query(`
            UPDATE auteurs SET nom =$1, nationalite = $2, date_naissance = $3 WHERE id = $4 RETURNING *`,
        [nom, nationalite, date_naissance, id]);
         if (resultat.rows.length === 0) {
            return res.status(404).json({ message: "autheur non trouvé" });
        }

        res.json(resultat.rows[0]); // 5. On renvoie l'adhérent modifié

    }catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message }); 
    }
};

const deleteAuteur = async (req, res) =>{
     try {
        const { id } = req.params; // celui que l'on veux supprimer

        const result = await pool.query(
            `DELETE FROM auteyrs WHERE id = $1 RETURNING *`, //  On supprime
            [id]
        );

        if (result.rows.length === 0) { //  Vérification 
            return res.status(404).json({ message: "autheur non trouvé" });
        }

        res.json({ message: "Autheur supprimé", adherent: result.rows[0] }); // 4. On renvoie celui qu'on a supprimé

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getAutheur,
    createAutheur,
    updateAutheur,
    deleteAuteur
};