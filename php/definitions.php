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
    'update_failed'             => "C'è stato un problema durante l'aggiornamento.\nRiprova tra un po'."
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

    public function getPersonaggi() {
        return $this->personaggi;
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
     * @return bool Se true la funzione ha avuto effetto correttamente; false indica che '$amount' inteso come spesa è maggiore delle monete attualmente presenti nell'account
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
     * Aggiunge un Personaggio alla lista dei personaggi dell'account
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
     * Rimuove un Personaggio alla lista dei personaggi dell'account a partire dal nome
     * @param string $nomePersonaggio il nome del personaggio da rimuovere
     * @return bool Se true indica che l'eliminazione è accaduta correttamente; false se il personaggio non esiste tra quelli del giocatore
     */
    public function removePersonaggio($nomePersonaggio){
        foreach($this->personaggi as $key => $personaggio){
            if($personaggio->getName() === $nomePersonaggio){
                unset($this->personaggi[$key]);
                return true;
            }
        }
        return false;
    }
};

/**
 * Caratteristiche e funzioni di un singolo personaggio
 */
class Personaggio{
    const MIN_FOR_DEX = -10;
    const MAX_FOR_DEX = 10;
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

    private $nome;
    private $owner;
    private $FOR;
    private $damage;
    private $dodgingChance;
    private $DEX;
    private $PF;
    private $tmp_PF;
    private $elemento;
    private $armatura;  /// Riferimento all'armatura indossata
    private $arma;     /// Riferimento all'arma equipaggiata
    private $livello;
    private $exp;
    private $puntiUpgrade;
    private $isRetrieved;   ///> isnfaodsa
    private $connectionDB;

    /**
     * Crea un nuovo personaggio
     * @param string $nome
     * @param int $forza
     * @param int $destrezza
     * @param int $puntiVita
     * @param string $elemento
     * @param int $armatura
     * @param int $arma
     * @param int $livello
     * @param int $puntiExp
     * @param int $puntiUpgrade
     * @param bool $retrieved: da settare true se il personaggio è stato recuperato dal DB. Di default è impostato a false
     * @throws \InvalidArgumentException quando i parametri non rispettano il formato corretto
     */
    public function __construct($nome, $proprietario, $forza, $destrezza, $puntiVita, $elemento, $armatura, $arma, $livello, $puntiExp, $puntiUpgrade, $retrieved = false){

        $this->connectionDB = new mysqli(DB_HOST, DB_USER, DB_PWD, DATABASE);
        if ($this->connectionDB->connect_error){
            throw new InvalidArgumentException("Server non Disponibile");
        }

        $ownerCheckQuery = "SELECT COUNT(*) FROM Account WHERE ID = ?";
        $ownerStmt = $this->connectionDB->prepare($ownerCheckQuery);
        $ownerStmt->bind_param('i', $proprietario);
        $ownerStmt->execute();
        $ownerStmt->bind_result($ownerExists);
        $ownerStmt->fetch();
        $ownerStmt->close();

        if(!$ownerExists){
            throw new InvalidArgumentException("Il proprietario non esiste");
        }

        if ($forza < self::MIN_FOR_DEX || $forza > self::MAX_FOR_DEX){
            throw new InvalidArgumentException("FOR deve essere tra " . self::MIN_FOR_DEX . " e " . self::MAX_FOR_DEX);
        }
        if ($destrezza < self::MIN_FOR_DEX || $destrezza > self::MAX_FOR_DEX){
            throw new InvalidArgumentException("DEX deve essere tra " . self::MIN_FOR_DEX . " e " . self::MAX_FOR_DEX);
        }
        if ($puntiVita < self::MIN_HEALTH){
            throw new InvalidArgumentException("I PF devono essere positivi.");
        }

        $this->nome = $nome;
        $this->owner = $proprietario;
        $this->FOR = $forza;
        $this->DEX = $destrezza;
        $this->PF = $puntiVita;
        $this->elemento = $elemento;
        $this->armatura = $armatura;
        $this->arma = $arma;
        $this->livello = $livello;
        $this->exp = $puntiExp;
        $this->puntiUpgrade = $puntiUpgrade;
        $this->isRetrieved = $retrieved;

        $this->tmp_PF = $puntiVita;
        $this->dodgingChance = self::DODGE_LOOKUP[$this->DEX];
        $this->damage = self::DAMAGE_LOOKUP[$this->FOR];
    }

    public function __destruct(){
        if($this->connectionDB)
            $this->connectionDB->close();
    }

    public function getName(){
        return $this->nome;
    }
    public function getAll(){
        return [
            'nome' => $this->nome,
            'FOR'=> $this->FOR,
            'damage' => $this->damage,
            'DEX' => $this->DEX,
            'dodgingChance' => $this->dodgingChance,
            'PF' => $this->PF,
            'temp_PF' => $this->tmp_PF,
            'elemento' => $this->elemento,
            'armatura' => $this->armatura,
            'arma' => $this->arma,
            'livello' => $this->livello,
            'exp' => $this->exp,
            'puntiUpgrade' => $this->puntiUpgrade
        ];
    }

    /**
     * Aggiungo l'esperienza ed eventualemnte effettuo il lvlUP
     * @param bool $win Se l'esperienza guadagnata deriva da una vittoria o meno
     * @return bool Se true indica che c'è stato il level-up, altrimenti false.
     */
    public function addExp($win){
        $amount = $win? self::EXP_WIN : self::EXP_LOSS;
        $this->exp += $amount;

        if($this->exp >= self::MAX_EXP){
            $this->exp %= self::MAX_EXP;
            $this->livello++;
            $this->puntiUpgrade += self::PU_LVL_UP;
            return true;
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


    public function addToDB(){
        if(!$this->connectionDB){
            return [false, "server_not_available"];
        }

        // Controllo se esiste già un personaggio con lo stesso nome
        $nameCheckQuery = "SELECT COUNT(*) FROM Personaggi WHERE Nome = ? AND Proprietario = ?";
        $nameStmt = $this->connectionDB->prepare($nameCheckQuery);
        $nameStmt->bind_param('si', $this->nome, $this->owner);
        $nameStmt->execute();
        $nameStmt->bind_result($nameExists);
        $nameStmt->fetch();
        $nameStmt->close();

        if ($nameExists > 0){
            return [false, "name_already_in_use"];
        }

        $query = "INSERT INTO Personaggi (Nome, Proprietario, Forza, Destrezza, PuntiVita, Elemento) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $this->connectionDB->prepare($query);

        $stmt->bind_param('siiiis',
            $this->nome,
            $this->owner,
            $this->FOR,
            $this->DEX,
            $this->PF,
            $this->elemento
        );


        if ($stmt->execute()){
            $stmt->close();
            return true;
        }
        else{
            $stmt->close();
            return [false, "generic_error"];
        }
    }

    public function updateDB() {
        if (!$this->connectionDB) {
            return [false, "server_not_available"];
        }

        // Prepare the update query
        $query = "UPDATE Personaggi SET
                    Forza = ?,
                    Destrezza = ?,
                    PuntiVita = ?,
                    Elemento = ?,
                    Armatura = ?,
                    Arma = ?,
                    Livello = ?,
                    PuntiExp = ?,
                    PuntiUpgrade = ?
                  WHERE Nome = ? AND Proprietario = ?";

        $stmt = $this->connectionDB->prepare($query);
        if ($stmt === false) {
            return [false, "prepare_failed: " . $this->connectionDB->error];
        }

        // Bind parameters
        $stmt->bind_param('iiisiisiis',
            $this->FOR,
            $this->DEX,
            $this->PF,
            $this->elemento,
            $this->armatura,
            $this->arma,
            $this->livello,
            $this->exp,
            $this->puntiUpgrade,
            $this->nome,
            $this->owner
        );

        // Execute the statement
        if ($stmt->execute()) {
            $stmt->close();
            return [true, "update_successful"];
        } else {
            $stmt->close();
            return [false, "update_failed: " . $stmt->error];
        }
    }
}