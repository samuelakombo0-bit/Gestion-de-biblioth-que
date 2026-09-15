const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',       
  host: 'localhost',      
  database: 'bibliotheque', 
  password: 'NouveauMotDePasse123!',   
  port: 5432,             
});

pool.connect()
  .then(() => console.log('✅ Connecté à la BDD bibliotheque'))
  .catch(err => console.error('❌ Erreur connexion', err));

module.exports = pool;