const express = require('express');
const app = express(); 
const PORT = process.env.PORT || 4001;
const adherentRoutes = require('./route/adherent.route');
const auteurRoutes = require('./route/autheur.route');
const livresRoutes = require('./route/livres.route')

app.use(express.json());
app.use('/adherents', adherentRoutes);
app.use('/autheurs', auteurRoutes);
app.use('/livres', livresRoutes);
app.use('/livres/recherche',livresRoutes )



app.listen(PORT, () => {
  console.log(`Les ténèbres s’amassent, et voici que ta garde commence sur le port ${PORT}
     Je ne porterai pas de couronne et ne gagnerai aucune gloire. 
     Je vivrai et mourrai à mon poste. Je suis l’épée au cœur des ténèbres. 
     Je suis le guetteur sur les remparts 
    Je suis le bouclier qui protège le royaume des humains. 
    Je voue ma vie entière et mon honneur à la Garde de Nuit, pour 
    cette nuit et toutes les nuits à venir. `);
});

