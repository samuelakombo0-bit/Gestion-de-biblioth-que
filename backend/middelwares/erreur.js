const errorHandler = (err, req, res, next) => {
  console.error("🔥 ERREUR:", err.message);
  // Erreur Postgres (ex: clé étrangère)
  if (err.code === '23503') return res.status(400).json({ error: "Adhérent ou Livre inexistant" });
  res.status(500).json({ error: "Erreur interne serveur", details: err.message });
};
module.exports = errorHandler;