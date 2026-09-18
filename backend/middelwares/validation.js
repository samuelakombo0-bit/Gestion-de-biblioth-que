const validateEmprunt = (req, res, next) => {
  const { adherent_id, livre_id, duree_jours } = req.body;
  if (!adherent_id ||!livre_id) {
    return res.status(400).json({ error: "adherent_id et livre_id sont obligatoires" });
  }
  if (duree_jours && (duree_jours < 1 || duree_jours > 60)) {
    return res.status(400).json({ error: "duree_jours doit être entre 1 et 60" });
  }
  next();
};

const validateLivre = (req, res, next) => {
  const { titre, auteurs_id } = req.body;
  if (!titre || titre.trim().length < 2) return res.status(400).json({ error: "Titre invalide" });
  if (!auteurs_id) return res.status(400).json({ error: "auteurs_id obligatoire" });
  next();
};

module.exports = { validateEmprunt, validateLivre };