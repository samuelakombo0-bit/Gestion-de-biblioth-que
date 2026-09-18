const pool = require('../db');

// Fonction utilitaire
const calculerJoursRetard = (datePrevue) => {
  const auj = new Date(); auj.setHours(0,0,0,0);
  const prev = new Date(datePrevue); prev.setHours(0,0,0,0);
  return auj > prev? Math.ceil((auj - prev) / (1000*60*60*24)) : 0;
};

// 1. CRÉATION
const createEmprunt = async (req, res) => {
  try {
    const { adherent_id, livre_id, duree_jours = 14 } = req.body;
    const livre = await pool.query('SELECT * FROM livres WHERE id=$1', [livre_id]);
    if(!livre.rows.length || livre.rows[0].exemplaires_dispo <=0) return res.status(400).json({error:"Livre non disponible"});

    const dateEmprunt = new Date();
    const dateRetourPrevue = new Date();
    dateRetourPrevue.setDate(dateEmprunt.getDate() + parseInt(duree_jours));

    const result = await pool.query(
      `INSERT INTO emprunts (adherent_id, livre_id, date_emprunt, date_retour_prevue, statut)
       VALUES ($1,$2,$3,$4,'en_cours') RETURNING *`,
      [adherent_id, livre_id, dateEmprunt, dateRetourPrevue]
    );
    await pool.query('UPDATE livres SET exemplaires_dispo = exemplaires_dispo -1 WHERE id=$1', [livre_id]);
    res.status(201).json(result.rows[0]);
  } catch(err){ res.status(500).json({error:err.message}); }
};

const getTousLesEmprunts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, a.nom_adherent, l.titre_livre
      FROM emprunts e
      JOIN adherents a ON e.adherent_id = a.id_adherent
      JOIN livres l ON e.livre_id = l.id_livre
      ORDER BY e.date_emprunt DESC
    `);
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};



// 2. RETOUR
const retourEmprunt = async (req,res) => {
  try{
    const {id} = req.params;
    const emp = await pool.query('SELECT * FROM emprunts WHERE id=$1', [id]);
    if(!emp.rows.length) return res.status(404).json({error:"Emprunt non trouvé"});
    if(emp.rows[0].statut === 'rendu') return res.status(400).json({error:"Déjà rendu"});

    const jours = calculerJoursRetard(emp.rows[0].date_retour_prevue);
    const statut = jours>0? 'rendu_en_retard' : 'rendu';

    const result = await pool.query(
      `UPDATE emprunts SET date_retour_reelle=NOW(), statut=$1, jours_retard=$2 WHERE id=$3 RETURNING *`,
      [statut, jours, id]
    );
    await pool.query('UPDATE livres SET exemplaires_dispo = exemplaires_dispo +1 WHERE id=$1', [emp.rows[0].livre_id]);
    res.json({message: jours>0?`Rendu avec ${jours} jour(s) de retard`:'Rendu à temps', emprunt: result.rows[0]});
  }catch(err){res.status(500).json({error:err.message});}
};

// 3. DÉTECTION RETARDS - à appeler chaque jour
const getRetards = async (req,res) => {
  try{
    const encours = await pool.query("SELECT e.*, a.nom as adherent_nom, l.titre FROM emprunts e JOIN adherents a ON e.adherent_id=a.id JOIN livres l ON e.livre_id=l.id WHERE e.statut='en_cours'");
    let retards = [];
    for(let e of encours.rows){
      let jours = calculerJoursRetard(e.date_retour_prevue);
      if(jours>0){
        await pool.query("UPDATE emprunts SET statut='en_retard', jours_retard=$1 WHERE id=$2", [jours, e.id]);
        retards.push({...e, jours_retard:jours});
      }
    }
    res.json(retards);
  }catch(err){res.status(500).json({error:err.message});}
};

// 4. LIAISON ADHÉRENT
const getByAdherent = async (req,res) => {
  try{
    const result = await pool.query(
      `SELECT e.*, l.titre, l.nom_livres FROM emprunts e JOIN livres l ON e.livre_id=l.id WHERE e.adherent_id=$1 ORDER BY e.date_emprunt DESC`,
      [req.params.adherent_id]
    );
    res.json(result.rows);
  }catch(err){res.status(500).json({error:err.message});}
};

module.exports = { createEmprunt, retourEmprunt, getRetards, getByAdherent, getTousLesEmprunts };