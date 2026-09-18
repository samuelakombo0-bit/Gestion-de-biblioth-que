
DROP TABLE IF EXISTS emprunt CASCADE;
DROP TABLE IF EXISTS livres CASCADE;
DROP TABLE IF EXISTS adherents CASCADE;
DROP TABLE IF EXISTS auteurs CASCADE;

-- TABLE AUTEURS
CREATE TABLE auteurs (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    nationalite VARCHAR(100) DEFAULT 'Congo',
    biographie TEXT
);

-- TABLE ADHERENTS
CREATE TABLE adherents (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    telephone VARCHAR(20),
    adresse VARCHAR(255),
    date_inscription DATE DEFAULT CURRENT_DATE
);

-- TABLE LIVRES
CREATE TABLE livres (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    auteur_id INT REFERENCES auteurs(id) ON DELETE SET NULL,
    categorie VARCHAR(100) DEFAULT 'Roman',
    quantite INT NOT NULL DEFAULT 5,
    quantite_disponible INT NOT NULL DEFAULT 5,
    isbn VARCHAR(30),
    annee_publication INT,
    CONSTRAINT chk_quantite CHECK (quantite_disponible <= quantite AND quantite_disponible >= 0)
);

-- TABLE EMPRUNTS
CREATE TABLE emprunt (
    id SERIAL PRIMARY KEY,
    livre_id INT NOT NULL REFERENCES livres(id) ON DELETE CASCADE,
    adherent_id INT NOT NULL REFERENCES adherents(id) ON DELETE CASCADE,
    date_emprunt DATE DEFAULT CURRENT_DATE,
    date_retour_prevue DATE DEFAULT (CURRENT_DATE + 14),
    date_retour DATE,
    statut VARCHAR(20) DEFAULT 'en_cours'
);


$$ LANGUAGE plpgsql;