-- Inserimento Elementi
INSERT INTO Element (Nome) VALUES ('Acqua'), ('Fuoco'), ('Terra'), ('Elettro'), ('Aria');

-- Inserimento Tipologie
INSERT INTO ItemType (Nome) VALUES ('arma'), ('armatura'), ('box'), ('pozione');

-- Inserimento Armi
INSERT INTO Item (Nome, Descrizione, Elemento, Tipologia, Costo, Danno, ModificatoreFor, ModificatoreDex) VALUES
("Spada d'Acqua", "Una spada affilata e leggera.", "Acqua", "arma", 20, 6, 2, 1),
("Spada di Fuoco", "Una spada infuocata.", "Fuoco", "arma", 30, 8, 0, 1),
("Mazza di Terra", "Una mazza pesante e robusta.", "Terra", "arma", 30, 8, 1, 0),
("Bastone Elettrico", "Un bastone che emette elettricità.", "Elettro", "arma", 25, 7, 1, 1),
("Pugnale d'Aria", "Un pugnale leggero e veloce.", "Aria", "arma", 20, 6, 1, 2);

-- Inserimento Armature
INSERT INTO Item (Nome, Descrizione, Elemento, Tipologia, Costo, Armatura, ModificatoreFor, ModificatoreDex) VALUES
("Armatura d\'Acqua", "Leggera e impermeabile.", "Acqua", "armatura", 40, 4, -1, 0),
("Armatura di Fuoco", "Resistente al calore.", "Fuoco", "armatura", 40, 4, 0, -1),
("Armatura di Terra", "Robusta e pesante.", "Terra", "armatura", 45, 5, -1, -2),
("Armatura Elettrica", "Robusta e conduttiva.", "Elettro", "armatura", 45, 5, -2, -1),
("Armatura d\'Aria", "Leggera e flessibile.", "Aria", "armatura", 35, 3, 0, 0);

-- Inserimento Pozioni
INSERT INTO Item (Nome, Descrizione, Elemento, Tipologia, Costo, RecuperoVita, ModificatoreFor, ModificatoreDex) VALUES
("Pozione di Vita", "Ripristina 20 PF.", NULL, "pozione", 15, 20, 0, 0),
("Pozione di Energia", "Ripristina 10 PF.", NULL, "pozione", 10, 10, 0, 0),
("Pozione di Forza", "Aumenta la forza temporaneamente di 3 punti.", NULL, "pozione", 8, 0, 3, 0),
("Pozione di Destrezza", "Aumenta la destrezza temporaneamente di 3 punti.", NULL, "pozione", 8, 0, 0, 3);

-- Inserimento Box
INSERT INTO Item (Nome, Descrizione, Elemento, Tipologia, Costo) VALUES
("Box Comune", "Contiene monete, pozione, 2 oggetti (armi e/o armature).", NULL, "box", 50),
("Box Rara", "Contiene monete, 2 pozioni, 2 armi e 2 armature.", NULL, "box", 100);