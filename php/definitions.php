<?php

if (basename($_SERVER['PHP_SELF']) === 'definitions.php') {
    require_once "methods.php";
    pageError(403);
}

define("CONN_STRING", "mysql:host=localhost;dbname=lista_iscritti");
define("DATABASE", "cambria_672642");
define("DB_HOST", "localhost");
define("DB_USER", "root");
define("DB_PWD", "");

define('USERNAME_PATTERN', "/^[a-zA-Z][a-zA-Z0-9_.]{2,9}$/");
define("VALID_USERNAME", "User.0_");

//? source: https://stackoverflow.com/questions/19605150/regex-for-password-must-contain-at-least-eight-characters-at-least-one-number-a
define('PASSWORD_PATTERN', "/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,15}$/");
//? endsource
define("VALID_PASSWORD", "Password1!");

define("PG_NAME_PATTERN", "/^[a-zA-Z][a-zA-Z]{2,9}$/");

define('ERROR_TYPES', [
    'invalid_username'          => "Username non valido. Deve iniziare con una lettera e avere tra 3 e 10 caratteri.",
    'username_taken'            => "Username già esistente.",
    'username_same_as_current'  => "Stai già utilizzando questo username.",
    'username_not_found'        => "L'username non esiste.",
    'invalid_password'          => "Password non valida. Deve contenere almeno 8 caratteri e non più di 15, una lettera maiuscola, una minuscola, un numero e un carattere speciale.",
    'password_mismatch'         => "Le password non corrispondono.",
    'wrong_password'            => "Password errata, ritenta.",
    'wrong_password_on_delete'  => "Password errata.\nAccount non eliminato.",
    'password_same_as_current'  => "La nuova password non deve essere uguale a quella attuale.",
    'registration_failed'       => "Registrazione fallita. Riprova.",
    'connection_failed'         => "Il server non è al momento disponibile.\nRiprovare tra un po'.",
    'invalid_param'             => "I parametri forniti non sono corretti.",
    'image_same_as_current'     => "Stai già utilizzando questa immagine",
    'update_failed'             => "C'è stato un problema durante l'aggiornamento.\nRiprova tra un po'.",
    'invalid_pg_name'           => "Nome non valido. Deve contenere solo lettere e avere tra i 3 a 10 caratteri.",
    'invalid_element'           => "L'elemento inserito non è un elemento valido",
    'full_PG'                   => "L'account ha già il numero massimo di Personaggi associati.\nPer crearne uno nuovo elimina uno vecchio",
    'pg_name_taken'             => "Questo account ha già un personaggio con questo nome!\nScelgine un altro",
    'pg_not_found'              => "Il personaggio che volevi eliminare non esiste",
    'pg_not_selected'           => "Non è stato fornito nessun personaggio valido sul quale agire",
    'upgrade_failed'            => "C'è stato un problema con l'aggiornamento.",
    'default'                   => "Errore generico, ci scusiamo per il disagio."
]);

/**
 * Quantità minima di monete delle box comuni
 */
define("MIN_COIN_COMMON", 5);

/**
 * Quantità massima di monete delle box comuni
 */
define("MAX_COIN_COMMON", 10);

/**
 * Quantità minima di monete delle box rare
 */
define("MIN_COIN_RARE", 15);

/**
 * Quantità massima di monete delle box rare
 */
define("MAX_COIN_RARE", 20);

/**
 * Numero massimo di Item diversi in un inventario
 */
define("MAX_ITEMS", value: 40);

/**
 * Numero massimo di Item diversi in un negozio
 */
define("MAX_SHOP_ITEMS", 10);

/**
 * Intervallo temporale del refresh del negozio
 */
define('SHOP_TIMER_RESET_SECONDS', value: 3*60);


/**
 * Informazioni sull'account con riferimento ai personaggi
 */
class Account{
    const COINS_LVL_UP = 40;
    const MAX_NUM_PERSONAGGI = 5;
    private $id;
    private $username;
    private $monete;
    private $personaggi = [];
    private $shopRefresh;
    private $immagineProfilo;

    public function __construct($id, $username, $monete, $shopRefresh, $immagineProfilo){
        $this->id = $id;
        $this->username = $username;
        $this->monete = $monete;
        $this->shopRefresh = $shopRefresh;
        $this->immagineProfilo = $immagineProfilo;
    }

    public function getId() {
        return $this->id;
    }

    public function getUsername() {
        return $this->username;
    }

    public function getMonete() {
        return $this->monete;
    }
    public function getShopRefresh() {
        return $this->shopRefresh;
    }

    /**
     * Restituisce uno o tutti i personaggi in base al `$nome` fornito
     * @param string $name Nome del personaggio. Se non fornito restituisce tutti i personaggi (default: `null`)
     * @return Personaggio|Personaggio[]|null I tre casi avvengono:
     *          - `Personaggio[]` se `$name === null`
     *          - `Personaggio` se il perosnaggio con nome `$name` è presente
     *          - `null` se non è presente alcun personaggio con il `$name` fornito
     */
    public function getPersonaggi($name = null) {
        if($name === null)
            return $this->personaggi;

        foreach ($this->personaggi as $pg){
            if($pg->getNome() === $name){
                return $pg;
            }
        }

        return null;
    }
    public function getImmagineProfilo() {
        return $this->immagineProfilo;
    }

    public function getAll(){
        return [
            'id'              => $this->id,
            'username'        => $this->username,
            'monete'          => $this->monete,
            'personaggi'      => $this->personaggi,
            'shopRefresh'     => $this->shopRefresh,
            'immagineProfilo' => $this->immagineProfilo
        ];
    }

    /**
     * Modifica la quantità di monete del personaggio
     * @param bool $spending se true indica che si sta spendendo, altrimenti che si sta guadagnando
     * @param int $amount indica il quantitativo di monete
     * @return bool Se true la funzione ha avuto effetto correttamente; false indica che `$amount` inteso come spesa è maggiore delle monete attualmente presenti nell'account
     */
    public function modifyCoins($spending, $amount){
        if($amount < 0)
            $amount = -$amount;
        if($spending){
            if($this->monete < $amount)
                return false;
            $this->monete -= $amount;
        }
        else{
            $this->monete += $amount;
        }
        return true;
    }

    /**
     * Aggiorna shopRefresh
     * @param DateTime $newTime nuovo Datetime, successivo al Datetime attuale
     * @return bool esito dell'aggiornamento
     */
    public function updateShopTimer($newTime){
        if($this->shopRefresh <= $newTime){
            $this->shopRefresh = $newTime;
            return true;
        }
        return false;
    }

    /**
     * Aggiorna l'username
     * @param string $newUsername nuovo username, diverso da quello attuale
     * @return bool esito dell'operazione
     */
    public function updateUsername($newUsername){
        if($this->username !== $newUsername){
            $this->username = $newUsername;
            return true;
        }

        return false;
    }

    /**
     * Aggiorna l'immagine Profilo
     * @param string $newPic path della nnuova immagine, diversa da quella attuale
     * @return bool esito dell'operazione
     */
    public function updateImmagineProfilo($newPic){
        if($this->immagineProfilo !== $newPic){
            $this->immagineProfilo = $newPic;
            return true;
        }
        return false;
    }

    /**
     * Aggiunge un `Personaggio` già esistente alla lista dei personaggi dell'account
     * @param Personaggio $personaggio il personaggio da aggiungere
     * @return bool Se true indica che l'inserimento è accaduto; false che l'utente ha raggiunto il massimo numero di personaggi ottenibili
     */
    public function addPersonaggio($personaggio){
        if(count($this->personaggi) >= self::MAX_NUM_PERSONAGGI)
            return false;

        $this->personaggi[] = $personaggio;
        return true;
    }

    /**
     * Crea e aggiunge un `Personaggio` alla lista dei personaggi dell'account
     * @param string $nome nome del personaggio da creare
     * @param string $elemento elemento del personaggio da creare
     * @return bool Se true indica che l'inserimento è accaduto; false che l'utente ha raggiunto il massimo numero di personaggi ottenibili
     */
    public function addNewPersonaggio($nome, $elemento){
        if(count($this->personaggi) >= self::MAX_NUM_PERSONAGGI)
            return false;

        $this->personaggi[] = new Personaggio($nome, $this->id, $elemento);

        usort($this->personaggi, function($a, $b){
            return $a->getNome() <=> $b->getNome();
        });
        return true;
    }

    /**
     * Aggiorna le statistiche di un `Personaggio` dell'account
     * @param string $nomePersonaggio nome del personaggio
     * @param int $newPF nuovo valore per la statistica `PF` del `Personaggio`
     * @param int $newFOR nuovo valore per la statistica `FOR` del `Personaggio`
     * @param int $newDES nuovo valore per la statistica `DES` del `Personaggio`
     * @return boolean `true` se l'aggiornamento è avvenuto correttamente, `false` altrimenti
     */
    public function upgradePgStats($nomePersonaggio, $newPF, $newFOR, $newDES){
        foreach($this->personaggi as $personaggio){
            if($personaggio->getNome() === $nomePersonaggio){
                $personaggio->upgradeStats($newPF, $newFOR, $newDES);
                return true;
            }
        }
        return false;
    }

    /**
     * Rimuove un Personaggio alla lista dei personaggi dell'account a partire dal nome
     * @param string $nomePersonaggio il nome del personaggio da rimuovere
     * @return bool Se true indica che l'eliminazione è accaduta correttamente; false se il personaggio non esiste tra quelli del giocatore
     */
    public function removePersonaggio($nomePersonaggio){
        foreach($this->personaggi as $key => $personaggio){
            if($personaggio->getNome() === $nomePersonaggio){
                if($personaggio->deleteFromDB()){
                    unset($this->personaggi[$key]);
                    return true;
                }
                return false;
            }
        }
        return false;
    }
};

/**
 * Caratteristiche e funzioni di un singolo personaggio
 * Per funzionare correttamente tutti i metodi **DEVONO ESSERE UTILIZZATI** in blocchy `try{}catch{}`
 */
class Personaggio{
    const MIN_FOR_DES = -10;
    const MAX_FOR_DES = 10;
    const MIN_HEALTH = 0;
    const MAX_EXP = 100;
    const EXP_WIN = 15;
    const EXP_LOSS = 5;
    const PU_LVL_UP = 3;
    const DAMAGE_LOOKUP = [
        -10 => 0, -9 => 0,
        -8 => 1, -7 => 1,
        -6 => 2, -5 => 2,
        -4 => 3, -3 => 3,
        -2 => 4, -1 => 4,
        +0 => 5, +1 => 5,
        +2 => 6, +3 => 6,
        +4 => 7, +5 => 7,
        +6 => 8, +7 => 8,
        +8 => 9, +9 => 9,
        +10 => 10
    ];

    const DODGE_LOOKUP = [
        -10 => 0, -9 => 0,
        -8 => 10, -7 => 10,
        -6 => 15, -5 => 15,
        -4 => 20, -3 => 20,
        -2 => 25, -1 => 25,
        +0 => 30, +1 => 30,
        +2 => 35, +3 => 35,
        +4 => 40, +5 => 40,
        +6 => 45, +7 => 45,
        +8 => 50, +9 => 50,
        +10 => 60
    ];

    const DEFAULT_PF = 25;
    const DEFAULT_FOR_DES = 0;
    const ZAINO_SIZE = 3;       // 3 + arma + armatura

    private $pathImmagine;
    private $pathImmaginePG;
    private $nome;
    private $owner;
    private $FOR;
    private $damage;
    private $DES;
    private $dodgingChance;
    private $PF;
    private $tmp_PF;
    private $elemento;
    private $prevaleSu;
    private $prevalsoDa;
    /// Informazioni complete sull'arma equipaggiata
    private $arma;
    /// Informazioni complete sull'armatura equipaggiata
    private $armatura;
    private $protezioneDanno;
    private $zaino = [];
    private $livello;
    private $exp;
    private $puntiUpgrade;

    /**
     * Costruttore della classe Personaggio.
     * Se il personaggio esiste già nel database, ne recupera i dati.
     * Altrimenti, crea un nuovo personaggio con i valori di default e lo salva nel database.
     *
     * @param string $nome Nome del personaggio.
     * @param int $proprietarioId ID del proprietario del personaggio.
     * @param string $elemento Elemento associato al personaggio.
     * @throws Exception Se il proprietario non esiste o se si verifica un errore durante l'inserimento o il recupero dei dati.
     */
    public function __construct($nome, $proprietarioId, $elemento){
        $connectionDB = new mysqli(DB_HOST, DB_USER, DB_PWD, DATABASE);

        $ownerStmt = null;
        $personaggioStmt = null;
        $zainoStmt = null;

        try {
            if ($connectionDB->connect_error){
                throw new Exception("Server non Disponibile", 500);
            }
            $connectionDB->begin_transaction();

            // Verifico se il proprietario esiste
            $ownerCheckQuery = "SELECT * FROM Account WHERE ID = ?";
            $ownerStmt = $connectionDB->prepare($ownerCheckQuery);
            if (!is_numeric($proprietarioId)) {
                $connectionDB->rollback();
                throw new Exception("Proprietario non esistente", 400);
            }

            $ownerStmt->bind_param('i', $proprietarioId);
            $ownerStmt->execute();
            $result = $ownerStmt->get_result();

            if ($result->num_rows === 0) {
                $connectionDB->rollback();
                throw new Exception("Proprietario non esistente", 400);
            }

            // Verifico se il PG esiste già
            $personaggioCheckQuery = "SELECT P.*, E.PathImmagine, E.PathImmaginePG, E.PrevaleSu, E.PrevalsoDa
                                      FROM Personaggi P
                                        JOIN Element E ON P.Elemento = E.Nome
                                      WHERE P.Nome = ? AND P.Proprietario = ?";
            $personaggioStmt = $connectionDB->prepare($personaggioCheckQuery);
            $personaggioStmt->bind_param('si', $nome, $proprietarioId);
            $personaggioStmt->execute();
            $personaggioResult = $personaggioStmt->get_result();

            if ($personaggioResult->num_rows > 0) {
                // Il PG esiste
                $personaggioData = $personaggioResult->fetch_assoc();

                $this->pathImmagine    = $personaggioData['PathImmagine'];
                $this->pathImmaginePG  = $personaggioData['PathImmaginePG'];
                $this->nome            = $personaggioData['Nome'];
                $this->owner           = $personaggioData['Proprietario'];
                $this->FOR             = $personaggioData['Forza'];
                $this->DES             = $personaggioData['Destrezza'];
                $this->PF              = $personaggioData['PuntiVita'];
                $this->elemento        = $personaggioData['Elemento'];
                $this->prevaleSu       = $personaggioData['PrevaleSu'];
                $this->prevalsoDa      = $personaggioData['PrevalsoDa'];
                $this->arma            = null;
                $this->armatura        = null;
                $this->livello         = $personaggioData['Livello'];
                $this->exp             = $personaggioData['PuntiExp'];
                $this->puntiUpgrade    = $personaggioData['PuntiUpgrade'];
                $this->damage          = 0;
                $this->dodgingChance   = 0;
                $this->protezioneDanno = 0;

                // Prelevo le informazioni sull'arma
                if($personaggioData['Arma'] !== null){
                    $sqlArma = "SELECT ID, Nome, Descrizione, Elemento, PathImmagine, Danno, ModificatoreFor, ModificatoreDes
                                FROM Item
                                WHERE ID = ?";
                    $armaStmt = $connectionDB->prepare($sqlArma);
                    $armaStmt->bind_param("i", $personaggioData['Arma']);
                    $armaStmt->execute();
                    $armaResult = $armaStmt->get_result();
                    $this->arma = $armaResult->fetch_assoc();
                    $this->FOR = max(self::MIN_FOR_DES, min(self::MAX_FOR_DES, $this->FOR + $this->arma['ModificatoreFor']));
                    $this->DES = max(self::MIN_FOR_DES, min(self::MAX_FOR_DES, $this->DES + $this->arma['ModificatoreDes']));
                    $this->damage = $this->arma['Danno'];

                    unset($this->arma['Danno']);
                    unset($this->arma['ModificatoreFor']);
                    unset($this->arma['ModificatoreDes']);
                }
                // Prelevo le informazioni sull'armatura
                if($personaggioData['Armatura'] !== null){
                    $sqlArmatura = "SELECT ID, Nome, Descrizione, Elemento, PathImmagine, ProtezioneDanno, ModificatoreFor, ModificatoreDes
                                    FROM Item
                                    WHERE ID = ?";
                    $armaturaStmt = $connectionDB->prepare($sqlArmatura);
                    $armaturaStmt->bind_param("i", $personaggioData['Armatura']);
                    $armaturaStmt->execute();
                    $armaturaResult = $armaturaStmt->get_result();
                    $this->armatura = $armaturaResult->fetch_assoc();
                    $this->FOR = max(self::MIN_FOR_DES, min(self::MAX_FOR_DES, $this->FOR + $this->armatura['ModificatoreFor']));
                    $this->DES = max(self::MIN_FOR_DES, min(self::MAX_FOR_DES, $this->DES + $this->armatura['ModificatoreDes']));

                    $this->protezioneDanno = $this->armatura['ProtezioneDanno'];
                }

                // Prelevo lo zaino
                $sqlZaino = "SELECT Z.Quantita, I.*
                             FROM Zaino Z
                                JOIN Item I ON Z.Oggetto = I.ID
                             WHERE Z.Personaggio = ? AND Z.Proprietario = ?";
                $zainoStmt = $connectionDB->prepare($sqlZaino);
                $zainoStmt->bind_param("si", $this->nome, $this->owner);

                $zainoStmt->execute();
                $zainoResult = $zainoStmt->get_result();

                while($item = $zainoResult->fetch_assoc()){
                    for($i = 0; $i < $item["Quantita"]; ++$i){
                        $tmp = $item;
                        unset($tmp["Quantita"]);
                        $this->zaino[] = $tmp;

                    }
                }
            }
            else {
                // Creo un nuovo PG
                $elementInfo = getElementInfo($elemento, $connectionDB);

                if(!$elementInfo){
                    $connectionDB->rollback();
                    throw new Exception("Elemento non valido: ". $elementInfo, 400);
                }

                $this->pathImmagine    = $elementInfo['PathImmagine'];
                $this->pathImmaginePG  = $elementInfo['PathImmaginePG'];
                $this->nome            = $nome;
                $this->owner           = $proprietarioId;
                $this->FOR             = self::DEFAULT_FOR_DES + $elementInfo["ModificatoreFor"];
                $this->DES             = self::DEFAULT_FOR_DES + $elementInfo["ModificatoreDes"];
                $this->PF              = self::DEFAULT_PF + $elementInfo["ModificatorePF"];
                $this->elemento        = $elementInfo['Nome'];
                $this->prevaleSu       = $elementInfo['PrevaleSu'];
                $this->prevalsoDa      = $elementInfo['PrevalsoDa'];
                $this->armatura        = null;
                $this->arma            = null;
                $this->livello         = 1;
                $this->exp             = 0;
                $this->puntiUpgrade    = self::PU_LVL_UP;
                $this->damage          = 0;
                $this->dodgingChance   = 0;
                $this->protezioneDanno = 0;

                $insertQuery = "INSERT INTO Personaggi (Nome, Proprietario, Forza, Destrezza, PuntiVita, Elemento, Armatura, Arma, Livello, PuntiExp, PuntiUpgrade)
                                VALUES (?, ?, ?, ?, ?, ?, NULL, NULL, 1, 0, ?)";
                $insertStmt = $connectionDB->prepare($insertQuery);
                $insertStmt->bind_param('siiiisi',
                     $this->nome,
                    $this->owner,
                           $this->FOR,
                           $this->DES,
                           $this->PF,
                           $this->elemento,
                           $this->puntiUpgrade);

                if (!$insertStmt->execute()) {
                    $connectionDB->rollback();
                    throw new Exception("Errore durante l'inserimento del personaggio: " . $insertStmt->error, 500);
                }
                $insertStmt->close();
            }

            $this->tmp_PF = $this->PF;

            // Aggiungo alle basi date dai modificatori di arma e armatura (0 nel caso non ci siano/sia)
            $this->damage        += self::DAMAGE_LOOKUP[$this->FOR];
            $this->dodgingChance += self::DODGE_LOOKUP[$this->DES];

            $connectionDB->commit();
        }
        finally {
            if ($ownerStmt)         $ownerStmt->close();
            if ($personaggioStmt)   $personaggioStmt->close();
            if ($zainoStmt)         $zainoStmt->close();
            if ($armaStmt)          $armaStmt->close();
            if ($armaturaStmt)      $armaturaStmt->close();
            $connectionDB->close();
        }
    }

    public function getNome(): string{
        return $this->nome;
    }
    public function getProprietario(): int{
        return $this->owner;
    }
    public function getElemento(): string{
        return $this->elemento;
    }
    public function getAll() {
        return [
            'nome'            => $this->nome,
            'owner'           => $this->owner,
            'FOR'             => $this->FOR,
            'damage'          => $this->damage,
            'DES'             => $this->DES,
            'dodgingChance'   => $this->dodgingChance,
            'PF'              => $this->PF,
            'temp_PF'         => $this->tmp_PF,
            'elemento'        => $this->elemento,
            'prevaleSu'       => $this->prevaleSu,
            'prevalsoDa'      => $this->prevalsoDa,
            'armatura'        => $this->armatura,
            'arma'            => $this->arma,
            'zaino'           => $this->zaino,
            'livello'         => $this->livello,
            'exp'             => $this->exp,
            'puntiUpgrade'    => $this->puntiUpgrade,
            'pathImmagine'    => $this->pathImmagine,
            'pathImmaginePG'  => $this->pathImmaginePG,
            'protezioneDanno' => $this->protezioneDanno
        ];
    }
    public function getStatsAndEquipment(){
        return [
            'DAMAGE_LOOKUP'   => self::DAMAGE_LOOKUP,
            'DODGE_LOOKUP'    => self::DODGE_LOOKUP,
            'MIN_FOR_DES'     => self::MIN_FOR_DES,
            'MAX_FOR_DES'     => self::MAX_FOR_DES,
            'ZAINO_SIZE'      => self::ZAINO_SIZE,
            'FOR'             => $this->FOR,
            'damage'          => $this->damage,
            'protezioneDanno' => $this->protezioneDanno,
            'DES'             => $this->DES,
            'dodgingChance'   => $this->dodgingChance,
            'PF'              => $this->PF,
            'puntiUpgrade'    => $this->puntiUpgrade,
            'arma'            => $this->arma,
            'armatura'        => $this->armatura,
            'zaino'           => $this->zaino
        ];
    }

    public function getImmaginiPrevalenza(){
        $connectionDB = new mysqli(DB_HOST, DB_USER, DB_PWD, DATABASE);

        $stmt = null;
        try {
            $sql = "SELECT
                (SELECT PathImmagine FROM Element WHERE Nome = ?) AS prevaleSu,
                (SELECT PathImmagine FROM Element WHERE Nome = ?) AS prevalsoDa";
            $stmt = $connectionDB->prepare($sql);
            $stmt->bind_param("ss", $this->prevaleSu, $this->prevalsoDa);
            if(!$stmt->execute()){
                throw new Error("Errore nel recupero: " . $stmt->error);
            }
            $result = $stmt->get_result();
            $output = $result->fetch_assoc();
            return $output;
        } finally {
            if ($stmt) $stmt->close();
            $connectionDB->close();
        }
    }

    /**
     * Aggiungo l'esperienza ed eventualemnte effettuo il lvlUP
     * @param bool $win Se l'esperienza guadagnata deriva da una vittoria (true) o da una sconfitta (false)
     * @return bool Se true indica che c'è stato il level-up, altrimenti false.
     */
    public function addExp($win){
        $amount = $win? self::EXP_WIN : self::EXP_LOSS;
        $this->exp += $amount;

        if($this->exp >= self::MAX_EXP){
            $this->exp %= self::MAX_EXP;
            $this->livello++;
            $this->puntiUpgrade += self::PU_LVL_UP;
            return $this->updateDB();
        }

        return false;
    }

    /**
     * Aggiunge il danno al personaggio
     * @param int $damage quantità di danno subito
     * @return bool se true indica che il personaggio è morto
     */
    public function takeDamage($damage){
        $this->tmp_PF -= $damage;
        return $this->tmp_PF <= 0;
    }

    // FIXME: da rivedere forse con l'utilizzo oggetti
    /**
     * Cura il personaggio
     * @param int $amount valore di cura del personaggio
     * @return bool se true indica che il personaggio ha guadagnato dei PF, altrimenti indica che il personaggio aveva già la vita al massimo
     */
    public function heal($amount){
        if($this->PF == $this->tmp_PF)
            return false;

        $this->tmp_PF = min($this->PF, $this->tmp_PF + $amount);

        return true;
    }
    /**
     * Funzione che si occupa di migliorare le statistiche del personaggio
     * @param int $newPF nuove statistiche per i PF
     * @param int $newFOR nuove statistiche per la FOR
     * @param int $newDES nuove statistiche per la DES
     * @return boolean `true` se l'aggiornamento viene effettuato, `false` altrimenti
     */
    public function upgradeStats($newPF, $newFOR, $newDES){
        if ($newFOR < self::MIN_FOR_DES || $newFOR > self::MAX_FOR_DES || $newFOR < $this->FOR) {
            throw new Exception("Aggiornamento Fallito: Valore non ammissibile per la Forza: " . $newFOR, 400);
        }

        if ($newDES < self::MIN_FOR_DES || $newDES > self::MAX_FOR_DES || $newDES < $this->DES) {
            throw new Exception("Aggiornamento Fallito: Valore non ammissibile per la Destrezza: " . $newDES, 400);
        }

        if ($newPF < $this->PF) {
            throw new Exception("Aggiornamento Fallito: Valore non ammissibile per i Punti Ferita: ". $newPF, 400);
        }


        $usedPU = [];
        $usedPU["PF"] = $newPF - $this->PF;
        $usedPU["FOR"] = $newFOR - $this->FOR;
        $usedPU["DES"] = $newDES - $this->DES;
        $totalUsedPU = array_sum($usedPU);

        if($totalUsedPU > $this->puntiUpgrade){
            throw new Exception("Aggiornamento Fallito: Usati troppi Punti Upgrade (". $totalUsedPU . ") rispetto a quelli a disposizione (" . $this->puntiUpgrade . ")", 400);
        }

        $this->puntiUpgrade -= $totalUsedPU;
        $this->PF = $newPF;
        $this->FOR = $newFOR;
        $this->DES = $newDES;
        $this->damage = self::DAMAGE_LOOKUP[$newFOR];
        $this->dodgingChance = self::DODGE_LOOKUP[$newDES];

        return $this->updateDB();
    }

    public function useItem($itemId){
        // TODO
    }
    public function assignItem($itemId){
        // TODO
    }
    public function removeItem($itemId){
        // TODO
    }

    /**
     * Aggiorna i dati del personaggio nel database
     * @return bool true se l'aggiornamento è avvenuto con successo, false altrimenti
     */
    public function updateDB() {
        $connectionDB = new mysqli(DB_HOST, DB_USER, DB_PWD, DATABASE);

        if($connectionDB->connect_error){
            throw new Exception("Connessione al database fallita: ". $connectionDB->connect_error, 500);
        }

        $stmt = null;
        try {
            // Prepare the update query
            $query = "UPDATE Personaggi SET
                        Forza = ?,
                        Destrezza = ?,
                        PuntiVita = ?,
                        Armatura = ?,
                        Arma = ?,
                        Livello = ?,
                        PuntiExp = ?,
                        PuntiUpgrade = ?
                      WHERE Nome = ? AND Proprietario = ?";

            $stmt = $connectionDB->prepare($query);
            if (!$stmt) {
                return false;
            }

            $stmt->bind_param('iiiiiiiisi',
                $this->FOR,
                $this->DES,
                $this->PF,
                $this->armatura,
                $this->arma,
                $this->livello,
                $this->exp,
                $this->puntiUpgrade,
                $this->nome,
                $this->owner
            );

            return $stmt->execute();
        }
        finally {
            if ($stmt)  $stmt->close();
            $connectionDB->close();
        }
    }
    /**
     * Rimuove il personaggio dal database e resetta tutti i suoi campi
     * @return bool true se l'eliminazione è avvenuta con successo, false altrimenti
     */
    public function deleteFromDB() {
        $connectionDB = new mysqli(DB_HOST, DB_USER, DB_PWD, DATABASE);

        if($connectionDB->connect_error){
            throw new Exception("Connessione al database fallita: ". $connectionDB->connect_error, 500);
        }

        $stmt = null;
        try {
            // Prepare the update query
            $query = "DELETE FROM Personaggi WHERE Nome = ? AND Proprietario = ?";

            $stmt = $connectionDB->prepare($query);
            if (!$stmt) {
                return false;
            }

            $stmt->bind_param('si',
                $this->nome,
                $this->owner
            );

            if($stmt->execute()){
                $this->pathImmagine = null;
                $this->pathImmaginePG = null;
                $this->nome = null;
                $this->owner = null;
                $this->FOR = null;
                $this->DES = null;
                $this->PF = null;
                $this->tmp_PF = null;
                $this->elemento = null;
                $this->prevaleSu = null;
                $this->prevalsoDa = null;
                $this->armatura = null;
                $this->arma = null;
                $this->livello = null;
                $this->exp = null;
                $this->puntiUpgrade = null;
                $this->damage = null;
                $this->dodgingChance = null;

                foreach ($this->zaino as $i => $elemento) {
                    $this->removeItem($elemento["ID"]);
                    unset($this->zaino[$i]);
                }
                $this->zaino = null;

                return true;
            }

            return false;
        }
        finally {
            if ($stmt)  $stmt->close();
            $connectionDB->close();
        }
    }
}

/**
 * Recupera dal database le informazioni relative ai modificatori e debolezze di un elemento specificato.
 *
 * Questa funzione interroga il database per ottenere dettagli come i percorsi delle immagini, i modificatori
 * e le relazioni (ad esempio, punti di forza e debolezze) per un determinato elemento. Il nome dell'elemento
 * deve essere presente nel database.
 *
 * @param string $element Il nome dell'elemento di cui recuperare le informazioni. Deve corrispondere a un record nel database.
 * @param mysqli &$conn Un riferimento alla connessione MySQLi attiva.
 *
 * @return array Un array associativo contenente le informazioni dell'elemento se l'operazione ha successo, oppure un messaggio di errore
 *               con la seguente struttura:
 *               - In caso di successo:
 *                 [
 *                   "PathImmagine" => string,  // Percorso dell'immagine dell'elemento.
 *                   "PathImmaginePG" => string, // Percorso dell'immagine PG dell'elemento.
 *                   "ModificatoreFor" => float, // Modificatore per la forza.
 *                   "ModificatoreDes" => float, // Modificatore per la destrezza.
 *                   "ModificatorePF" => float,  // Modificatore per i punti vita.
 *                   "PrevaleSu" => string,      // Elemento/i su cui questo elemento prevale.
 *                   "PrevalsoDa" => string      // Elemento/i da cui questo elemento è prevalso.
 *                 ]
 *               - In caso di errore:
 *                 [
 *                   "error" => true,
 *                   "message" => string // Descrizione dell'errore.
 *                 ]
 *
 * @throws Exception Se la connessione al database fallisce, la query fallisce o l'elemento non viene trovato.
 */
function getElementInfo($element, &$conn): array{
    $stmt = null;
    try{
        if($conn->connect_error){
            throw new Exception("Connessione al database fallita: ". $conn->connect_error, 500);
        }

        $sql = "SELECT *
            FROM Element
            WHERE Nome = ?";

        $stmt = $conn->prepare($sql);

        $stmt->bind_param("s", $element);
        if(!$stmt->execute()){
            throw new Exception( $stmt->error, 500);
        }

        $result = $stmt->get_result();

        if($result->num_rows === 0){
            throw new Exception("invalid_element", 400);
        }

        return $result->fetch_assoc();

    }
    finally{
        if($stmt)   $stmt->close();
    }
}