const API_URL = 'http://localhost:4001';

function ouvrirModal(id) {
  document.getElementById(id)?.classList.add('show');
}
function fermerModal(id) {
  document.getElementById(id)?.classList.remove('show');
}

// Ferme la modale si on clique en dehors du contenu (sur le fond)
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('show');
  });
});

// Ferme la modale avec le bouton "×" ou "Annuler"
document.querySelectorAll('.modal .close-btn, .modal .btn-secondary').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('.modal')?.classList.remove('show');
  });
});
async function apiFetch(url, options = {}) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  } catch (e) {
    console.error('API Error:', e);
  }
}

if (document.getElementById('total-livres')) {
  async function loadDashboard() {
    const stats = await apiFetch(`${API_URL}/statistiques`);
    if (!stats) return;

    document.getElementById('total-livres').innerText = stats.total_livres;
    document.getElementById('total-adherents').innerText = stats.total_adherents;
    document.getElementById('total-emprunts').innerText = stats.emprunts_en_cours;
    document.getElementById('total-retards').innerText = stats.emprunts_en_retard;

    // Pour livre le plus emprunté / adhérent le plus actif - optionnel
    const pop = await apiFetch(`${API_URL}/statistiques/populaires`);
    if(pop){
      document.getElementById('livre-populaire').innerText = pop.livre?.titre || 'Aucun';
      document.getElementById('nombre-emprunts-livre').innerText = `${pop.livre?.count || 0} emprunts`;
      document.getElementById('adherent-actif').innerText = pop.adherent?.nom || 'Aucun';
      document.getElementById('nombre-emprunts-adherent').innerText = `${pop.adherent?.count || 0} emprunts`;
    }
  }
  loadDashboard();
}

// ====== 2. PAGE LIVRES.HTML ======
if (document.getElementById('liste-livres')) {
  let currentPage = 1;
  let currentSearch = '';
  
  async function loadLivres(page = 1, search = '') {
    let url = `${API_URL}/livres?page=${page}&limit=10`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    
    const result = await apiFetch(url);
    if (!result) return;

    document.getElementById('nombre-livres').innerText = result.total;
    currentPage = result.page;
    currentSearch = search;
    const tbody = document.getElementById('liste-livres');
    tbody.innerHTML = result.data.map(l => `
      <tr>
        <td>${l.id_livre}</td>
        <td>${l.titre_livre || l.titre}</td>
        <td>${l.nom_auteur || l.auteur || '-'}</td>
        <td>${l.annee_publication || l.annee || '-'}</td>
        <td><span class="status status-success">Disponible</span></td>
        <td><button class="btn btn-small">Voir</button></td>
      </tr>
    `).join('');

    document.querySelectorAll('.pagination .page-btn').forEach(button => {
      const page = Number(button.dataset.page);
      const isNumberButton = Number.isInteger(page) && page > 0;
      if (isNumberButton) button.hidden = page > result.totalPages;
      button.classList.toggle('active', page === currentPage);
      button.disabled = button.dataset.page === 'previous'
        ? currentPage === 1
        : button.dataset.page === 'next'
          ? currentPage === result.totalPages
          : false;
    });
  }

  document.getElementById('search-livre')?.addEventListener('input', (e) => {
    loadLivres(1, e.target.value);
  });
  document.querySelectorAll('.pagination .page-btn').forEach(button => {
    button.addEventListener('click', () => {
      const target = button.dataset.page;
      const page = target === 'previous'
        ? currentPage - 1
        : target === 'next'
          ? currentPage + 1
          : Number(target);
      if (page > 0) loadLivres(page, currentSearch);
    });
  });
  document.getElementById('btn-ajouter-livre')?.addEventListener('click', () => ouvrirModal('modal-livre'));

  document.getElementById('form-livre')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nom_livres = document.getElementById('nom_livres').value;
    const titre = document.getElementById('titre').value;
    const auteurs_id = document.getElementById('auteur').value;
    const annee_publication = document.getElementById('annee').value;

    const nouveauLivre = await apiFetch(`${API_URL}/livres`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({nom_livres, titre, auteurs_id, annee_publication })
    });

    if (nouveauLivre) {
      fermerModal('modal-livre');
      e.target.reset();
      loadLivres(currentPage);
    }
  });

  loadLivres();
}


if (document.getElementById('liste-adherents')) {
  async function loadAdherents() {
    const adherents = await apiFetch(`${API_URL}/adherents`);
    if (!adherents) return;
    const list = adherents.data || adherents;
    document.getElementById('nombre-adherents').innerText = list.length;
    document.getElementById('liste-adherents').innerHTML = list.map(a => `
      <tr><td>${a.id_adherent}</td><td>${a.nom_adherent}</td><td>${a.telephone || '-'}</td><td>${a.email || '-'}</td><td><button class="btn btn-small">Modifier</button></td></tr>
    `).join('');
  }
    document.getElementById('btn-ajouter-adherent')?.addEventListener('click', () => ouvrirModal('modal-adherent'));

  document.getElementById('form-adherent')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nom = document.getElementById('nom-adherent').value;
    const tel = document.getElementById('telephone').value;
    const email = document.getElementById('email').value;

    const nouvelAdherent = await apiFetch(`${API_URL}/adherents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom, tel, email })
    });

    if (nouvelAdherent) {
      fermerModal('modal-adherent');
      e.target.reset();
      loadAdherents();
    }
  });

 
  loadAdherents();
}


if (document.getElementById('liste-emprunts')) {
  let tousLesEmprunts = [];
  let filtreEmprunts = 'tous';

  function afficherErreurEmprunt(message) {
    const messageErreur = document.getElementById('message-erreur');
    messageErreur.textContent = message;
    messageErreur.style.display = 'block';
  }

  function afficherEmprunts() {
    const maintenant = new Date();
    const list = tousLesEmprunts.filter(emprunt => {
      const rendu = Boolean(emprunt.date_retour_reelle);
      const enRetard = !rendu && new Date(emprunt.date_retour_prevue) < maintenant;
      if (filtreEmprunts === 'encours') return !rendu && !enRetard;
      if (filtreEmprunts === 'retard') return enRetard;
      return true;
    });

    document.getElementById('liste-emprunts').innerHTML = list.map(e => {
      const enRetard = !e.date_retour_reelle && new Date(e.date_retour_prevue) < maintenant;
      return `
      <tr class="${enRetard ? 'row-danger' : ''}">
        <td>#${e.id_emprunt}</td><td>${e.nom_adherent}</td><td>${e.titre_livre}</td>
        <td>${new Date(e.date_emprunt).toLocaleDateString()}</td>
        <td>${new Date(e.date_retour_prevue).toLocaleDateString()}</td>
        <td><span class="status ${enRetard ? 'status-danger' : 'status-success'}">${enRetard ? 'En retard' : 'En cours'}</span></td>
        <td><button class="btn btn-small btn-success">Retour</button></td>
      </tr>`;
    }).join('');
  }

  async function loadEmprunts() {
    const emprunts = await apiFetch(`${API_URL}/emprunts`);
    tousLesEmprunts = emprunts?.data || emprunts || [];
    afficherEmprunts();
  }

  document.querySelectorAll('.tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      filtreEmprunts = tab.dataset.filter;
      document.querySelectorAll('.tabs .tab').forEach(item => item.classList.remove('active'));
      tab.classList.add('active');
      afficherEmprunts();
    });
  });

  document.getElementById('btn-ajouter-emprunt')?.addEventListener('click', async () => {
    document.getElementById('message-erreur').style.display = 'none';
    // Remplir les listes déroulantes avant d'ouvrir la modale
    const adherents = await apiFetch(`${API_URL}/adherents`);
    const listeAdh = adherents?.data || adherents || [];
    document.getElementById('emprunteur').innerHTML =
      '<option value="">Sélectionner un adhérent</option>' +
      listeAdh.map(a => `<option value="${a.id_adherent || a.id}">${a.nom_adherent || a.nom}</option>`).join('');

    const livres = await apiFetch(`${API_URL}/livres`);
    const listeLiv = livres?.data || livres || [];
    document.getElementById('livre-emprunt').innerHTML =
      '<option value="">Sélectionner un livre</option>' +
      listeLiv.map(l => `<option value="${l.id_livres || l.id_livre || l.id}" data-statut="${l.statut || 'disponible'}">${l.titre_livre || l.titre}${l.statut !== 'disponible' ? ' (déjà emprunté)' : ''}</option>`).join('');

    ouvrirModal('modal-emprunt');
  });

  document.getElementById('livre-emprunt')?.addEventListener('change', (e) => {
    if (!e.target.value) {
      document.getElementById('message-erreur').style.display = 'none';
      return;
    }
    if (e.target.selectedOptions[0].dataset.statut !== 'disponible') {
      afficherErreurEmprunt('Ce livre est déjà emprunté. Veuillez en sélectionner un autre.');
    } else {
      document.getElementById('message-erreur').style.display = 'none';
    }
  });

if (document.getElementById('form-emprunt')) {

  document.getElementById('form-emprunt').addEventListener('submit', async (e) => {
    e.preventDefault();

    const adherent_id = document.getElementById('emprunteur').value;
    const livre_id = document.getElementById('livre-emprunt').value;
    const dateRetour = document.getElementById('date-retour').value;

    const livreSelectionne = document.getElementById('livre-emprunt').selectedOptions[0];
    if (!adherent_id || !livre_id || !dateRetour) {
      afficherErreurEmprunt('Sélectionnez un adhérent, un livre et une date de retour.');
      return;
    }
    if (livreSelectionne.dataset.statut !== 'disponible') {
      afficherErreurEmprunt('Ce livre est déjà emprunté. Veuillez en sélectionner un autre.');
      return;
    }

    const aujourdHui = new Date();
    const retour = new Date(dateRetour);

    const duree_jours = Math.ceil(
      (retour - aujourdHui) / (1000 * 60 * 60 * 24)
    );

    const nouvelEmprunt = await apiFetch(`${API_URL}/emprunts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        adherent_id,
        livre_id,
        duree_jours
      })
    });

    if (nouvelEmprunt) {
      fermerModal('modal-emprunt');
      e.target.reset();
      document.getElementById('message-erreur').style.display = 'none';
      loadEmprunts();
    } else {
      afficherErreurEmprunt('Impossible d’enregistrer cet emprunt. Vérifiez le livre, l’adhérent et la date de retour.');
    }
  });

  loadEmprunts();
}


// ==========================
// AUTEURS
// ==========================

if (document.getElementById('liste-auteurs')) {

  async function loadAuteurs() {

    const auteurs = await apiFetch(`${API_URL}/auteurs`);

    const list = auteurs?.data || auteurs || [];

    document.getElementById('liste-auteurs').innerHTML =
      list.map(a => `
        <tr>
          <td>${a.id_auteur || a.id}</td>
          <td>${a.nom_auteur || a.nom}</td>
          <td>${a.nationalite || '-'}</td>
          <td>
            <button class="btn btn-small">
              Modifier
            </button>
          </td>
        </tr>
      `).join('');
  }


  document.getElementById('btn-ajouter-auteur')
    ?.addEventListener('click', () => {
      ouvrirModal('modal-auteur');
    });


  document.getElementById('form-auteur')
    ?.addEventListener('submit', async (e) => {

      e.preventDefault();

      const nom =
        document.getElementById('nom-auteur').value;

      const nationalite =
        document.getElementById('nationalite').value;


      const nouvelAuteur = await apiFetch(`${API_URL}/auteurs`, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          nom,
          nationalite
        })
      });


      if (nouvelAuteur) {

        fermerModal('modal-auteur');

        e.target.reset();

        loadAuteurs();
      }
    });


  loadAuteurs();
}
}
