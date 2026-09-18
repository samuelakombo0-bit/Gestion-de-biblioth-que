const API_URL = 'http://localhost:4001';

// 1. Afficher les livres avec pagination
async function chargerLivres(page = 1) {
  const res = await fetch(`${API_URL}/livres?page=${page}&limit=10`);
  const data = await res.json();
  
  console.log(data); // { total, page, totalPages, data: [...] }
  
  // tu affiches data.data dans ton HTML
  const liste = document.getElementById('liste-livres');
  liste.innerHTML = data.data.map(l => `<li>${l.titre_livre} - ${l.isbn_livre}</li>`).join('');
}

// 2. Afficher les statistiques
async function chargerStats() {
  const res = await fetch(`${API_URL}/statistiques`);
  const stats = await res.json();
  
  document.getElementById('total-livres').innerText = stats.total_livres;
  document.getElementById('total-adherents').innerText = stats.total_adherents;
  document.getElementById('en-cours').innerText = stats.emprunts_en_cours;
  document.getElementById('en-retard').innerText = stats.emprunts_en_retard;
}

chargerLivres(1);
chargerStats();