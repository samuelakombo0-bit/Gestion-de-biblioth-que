const express = require('express');
const app = express(); 
const PORT = process.env.PORT || 4001;



const adherentRoutes = require('./route/adherent.route');
const auteurRoutes = require('./route/autheur.route'); // CORRIGÉ ici, pas autheur
const livresRoutes = require('./route/livres.route');
const empruntRoutes = require('./route/emprunt.route');
const statistiquesRoutes = require('./route/statistique.route'); // pluriel, vérifie le nom du fichier
const logger = require('./middelwares/logger');
const errorHandler = require('./middelwares/erreur');
const cors = require('cors');


app.use(cors());
app.use(express.json());
app.use(logger);
app.use('/adherents', adherentRoutes);
app.use('/auteurs', auteurRoutes); // CORRIGÉ : /auteurs pas /autheurs
app.use('/livres', livresRoutes);
app.use('/emprunts', empruntRoutes);
app.use('/statistiques', statistiquesRoutes); // CORRIGÉ : avec le chemin

app.use(errorHandler);







app.listen(PORT, () => {
  console.log(`Les ténèbres s’amassent, et voici que ta garde commence sur le port ${PORT} `);
});
module.exports = app;

