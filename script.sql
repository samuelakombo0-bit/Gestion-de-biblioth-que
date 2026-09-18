: CREATE TABLE emprunt (
    id_emprunt INTEGER PRIMARY KEY DEFAULT nextval('emprunt_id_emprunt_seq'),

    adherent_id INTEGER,
    livre_id INTEGER,

    date_emprunt DATE DEFAULT CURRENT_DATE,
    date_retour_prevue DATE NOT NULL,
    date_retour_reelle DATE,

    CONSTRAINT emprunt_adherent_id_fkey
        FOREIGN KEY (adherent_id)
        REFERENCES adherents(id),

    CONSTRAINT emprunt_livre_id_fkey
        FOREIGN KEY (livre_id)
        REFERENCES livres(id_livres)
);CREATE TABLE adherents (
    id INTEGER PRIMARY KEY DEFAULT nextval('adherents_id_seq'),
    nom VARCHAR(100) NOT NULL,
    tel VARCHAR(20) NOT NULL,
    email VARCHAR(100) UNIQUE
);
 CREATE TABLE livres (
    id_livres INTEGER PRIMARY KEY DEFAULT nextval('livres_id_livres_seq'),
    nom_livres VARCHAR(100),
    titre VARCHAR(100),
    annee_publication INTEGER,
    statut VARCHAR(30) DEFAULT 'disponible',
    auteurs_id INTEGER,

    CONSTRAINT livres_auteurs_id_fkey
        FOREIGN KEY (auteurs_id)
        REFERENCES auteurs(id)
        ON DELETE CASCADE
);