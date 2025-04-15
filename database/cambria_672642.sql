DROP DATABASE if exists cambria_672642; 
CREATE DATABASE cambria_672642; 
USE cambria_672642; 

CREATE TABLE Account (
    ID INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Monete INT NOT NULL DEFAULT 10 CHECK (Monete >= 0)
);

CREATE TABLE Element(
	Nome VARCHAR(50) NOT NULL PRIMARY KEY NOT NULL
);

CREATE TABLE ItemType(
	Nome VARCHAR(50) NOT NULL PRIMARY KEY NOT NULL
);

CREATE TABLE Item (
    ID INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    Nome VARCHAR(100) NOT NULL,
    Descrizione VARCHAR(60) NOT NULL,
    Elemento VARCHAR(50),
    PathImmagine VARCHAR(255) DEFAULT NULL,
    Tipologia VARCHAR(50) NOT NULL,
    Costo INT NOT NULL CHECK (Costo >= 0),
    Danno INT DEFAULT 0 CHECK (Danno >= 0),
    Armatura INT DEFAULT 0 CHECK (Armatura >= 0),
    RecuperoVita INT DEFAULT 0 CHECK (RecuperoVita >= 0),
    ModificatoreFor INT DEFAULT 0,
    ModificatoreDex INT DEFAULT 0,
	FOREIGN KEY (Elemento) REFERENCES Element(Nome),
	FOREIGN KEY (Tipologia) REFERENCES ItemType(Nome)
);

CREATE TABLE Inventario (
    Proprietario INT NOT NULL,
    Oggetto INT NOT NULL,
    Quantita INT NOT NULL DEFAULT 1 CHECK (Quantita > 0),
    PRIMARY KEY(Proprietario, Oggetto),
    FOREIGN KEY (Proprietario) REFERENCES Account(ID) ON DELETE CASCADE, 
    FOREIGN KEY (Oggetto) REFERENCES Item(ID) ON DELETE CASCADE
);

CREATE TABLE Personaggi (
    Nome VARCHAR(100) NOT NULL,
    Proprietario INT NOT NULL,
    Forza INT NOT NULL CHECK (Forza BETWEEN -10 AND 10) ,
    Destrezza INT NOT NULL CHECK (Destrezza BETWEEN -10 AND 10),
    PuntiVita INT NOT NULL DEFAULT 25,
    Elemento VARCHAR(50) NOT NULL,
    Armatura INT DEFAULT NULL,     -- Riferimento all'ID dell'armatura equipaggiata
    Arma INT DEFAULT NULL,		 -- Riferimento all'ID dell'arma equipaggiata
    Livello INT NOT NULL DEFAULT 1 CHECK (Livello >= 1),
    PuntiExp INT NOT NULL DEFAULT 0 CHECK (PuntiExp BETWEEN 0 AND 100),
    PuntiUpgrade INT NOT NULL DEFAULT 5 CHECK (PuntiUpgrade >= 0),
    PRIMARY KEY (Nome, Proprietario),
    FOREIGN KEY (Proprietario) REFERENCES Account(ID) ON DELETE CASCADE,
    FOREIGN KEY (Arma) REFERENCES Item(ID) ON DELETE SET NULL,    		-- Riferimento all'arma equipaggiata
    FOREIGN KEY (Armatura) REFERENCES Item(ID) ON DELETE SET NULL,		-- Riferimento all'armatura equipaggiata
    FOREIGN KEY (Elemento) REFERENCES Element(Nome) ON DELETE NO ACTION
);

CREATE TABLE Zaino (
    Personaggio VARCHAR(100) NOT NULL,
    Proprietario INT NOT NULL,
    Oggetto INT NOT NULL,
    Quantita INT NOT NULL DEFAULT 1 CHECK (Quantita >= 1),
    PRIMARY KEY (Personaggio, Proprietario, Oggetto),
    FOREIGN KEY (Personaggio, Proprietario) REFERENCES Personaggi(Nome, Proprietario) ON DELETE CASCADE,
    FOREIGN KEY (Oggetto) REFERENCES Item(ID) ON DELETE CASCADE
);

CREATE TABLE Combattimenti (
    Giocatore1_Nome VARCHAR(100) NOT NULL,
    Giocatore1_Proprietario INT NOT NULL,
    Giocatore2_Nome VARCHAR(100) NOT NULL,
    Giocatore2_Proprietario INT NOT NULL,
    Vittoria_Giocatore1 BOOLEAN NOT NULL,	    -- Riferito a Giocatore1
    Data DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (Giocatore1_Proprietario, Giocatore2_Proprietario, Data),
    FOREIGN KEY (Giocatore1_Nome, Giocatore1_Proprietario) REFERENCES Personaggi(Nome, Proprietario) ON DELETE CASCADE,
    FOREIGN KEY (Giocatore2_Nome, Giocatore2_Proprietario) REFERENCES Personaggi(Nome, Proprietario) ON DELETE CASCADE
);