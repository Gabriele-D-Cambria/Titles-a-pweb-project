<?php

require_once "definitions.php";


/**
 * Ritorna un elemento Account dato un username
 * @param mixed $username : username da cercare nel database
 * @param mixed $conn : connessione da utilizzare
 * @return Account|null
 */
function getData($username, $conn = null){
    if(!isset($conn)){
        $conn = new mysqli(DB_HOST, DB_USER, DB_PWD, DATABASE);
        if($conn->connect_error){
            pageError('500');
        }
    }

    $stmt = $conn->prepare("SELECT ID, Username, Monete FROM Account WHERE Username = ?");
    if ($stmt === false) {
        die('Prepare failed: ' . htmlspecialchars($conn->error));
    }
    $stmt->bind_param('s', $username);
    $stmt->execute();
    $result = $stmt->get_result();
    $stmt->close();

    if($result->num_rows > 0){
        $row = $result->fetch_assoc();
        $user = new Account($row['ID'], $row['Username'], $row['Monete']);


        $stmtPersonaggi = $conn->prepare("SELECT * FROM Personaggi WHERE Proprietario = ?;");
        $stmtPersonaggi->bind_param('i', $row["ID"]);
        $stmtPersonaggi->execute();
        $resultPersonaggi = $stmtPersonaggi->get_result();
        $stmtPersonaggi->close();

        while($personaggioRow = $resultPersonaggi->fetch_assoc()){
            $personaggio = new Personaggio(
                $personaggioRow['Nome'],
                $row['ID'],
                $personaggioRow['Forza'],
                $personaggioRow['Destrezza'],
                $personaggioRow['PuntiVita'],
                $personaggioRow['Elemento'],
                $personaggioRow['Armatura'],
                $personaggioRow['Arma'],
                $personaggioRow['Livello'],
                $personaggioRow['PuntiExp'],
                $personaggioRow['PuntiUpgrade']
            );
            $user->addPersonaggio($personaggio);
        }

        $conn->close();
        return $user;
    }
    else{

        $conn->close();
        return null;
    }
}

/**
 * Funzione che reindirizza un errore
 * @param string $errorCode codice di errore da passare alla 'error page.php'
 * @return never
 */
function pageError($errorCode){
    header("Location: error page.php/?error_code=". $errorCode);
    exit();
}


/**
 * Funzione che reindirizza un errore di un API
 * @param string $errorCode codice di errore da passare
 * @return never
 */
function apiError($errorCode){
    http_response_code($errorCode);
    echo json_encode(["errore" => $errorCode]);
    exit();
}

/**
 * Funzione che termina la procedura di login riportando un errore tramite GET
 * @param string $errorType indica il tipo di errore
 * @param bool $isLogin indica se l'errore si è effettuato durante il login o il sign-up
 * @return never
 */
function terminateLogin($errorType, $isLogin){
    $errorType = urlencode($errorType);
    $isLogin = urlencode($isLogin);

    header("Location: ../index.php?error=" . $errorType . "&isLogin=". $isLogin);
    exit();
}

/**
 * Recupera l'invetario di un'account dal database
 * @param int $accountID ID dell'account
 * @param mysqli $conn connessione | Default : null e la inizializza
 * @return array contenente gli item nell'inventario e la loro quantità
 */
function getInventory($accountID, $conn = null){
    if(!isset($conn)){
        $conn = new mysqli(DB_HOST, DB_USER, DB_PWD, DATABASE);
        if($conn->connect_error){
            pageError('500');
        }
    }

    $sql = "SELECT Item.*, Inventario.Quantita
            FROM Inventario
                JOIN Item ON Inventario.Oggetto = Item.ID
            WHERE Inventario.Proprietario = ?;";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $accountID);
    $stmt->execute();
    $result = $stmt->get_result();
    $stmt->close();
    $conn->close();

    $output = [];
    $output["MAX_SIZE"] = MAX_ITEMS;
    $inventory = [];
    while($row = $result->fetch_assoc()){
        $inventory[] = $row;
    }

    $output["inventario"] = $inventory;

    return $output;
}

/**
 * Dato un oggetto in un'account, diminuisco la quantità di uno dell'oggetto. Qualora la rimanente sia 0 lo rimuovo
 * @param int $itemId ID dell'oggetto
 * @param int $accountId id dell'account
 * @param int $itemQuantity quantità attuale dell'oggetto | se non fornita viene recuperata a partire da itemId e accountId
 * @param mysqli &$conn : connessione al server
 * @return int quantità aggiornata
 */
function removeOneItem($itemId, $accountId, $currentQuantity, &$conn){
    if(is_null($currentQuantity)){
        $sqlQuantity = "SELECT Quantita FROM Inventario WHERE Proprietario = ? AND Oggetto = ?";
        $stmtQuantity = $conn->prepare($sqlQuantity);
        $stmtQuantity->bind_param('ii', $accountId, $itemId);
        $stmtQuantity->execute();
        $result = $stmtQuantity->get_result();
        $quantityArr = $result->fetch_assoc();
        $stmtQuantity->close();
        $currentQuantity = $quantityArr["Quantita"];
    }
    $newQuantity = $currentQuantity - 1;
    if($newQuantity > 0){
        $updateSql = "UPDATE Inventario SET Quantita = Quantita - 1 WHERE Oggetto = ? AND Proprietario = ?;";
        $updateStmt = $conn->prepare($updateSql);
        $updateStmt->bind_param("ii", $itemId, $accountId);
        $updateStmt->execute();
        $updateStmt->close();
    }
    else{
        $deleteSql = "DELETE FROM Inventario WHERE Oggetto = ? AND Proprietario = ?";
        $deleteStmt = $conn->prepare($deleteSql);
        $deleteStmt->bind_param("ii", $itemId, $accountId);
        $deleteStmt->execute();
        $deleteStmt->close();
    }

    return $newQuantity;
}
/**
 * Agguinge uno o più item all'account
 * @param int $itemId id dell'item da aggiungere
 * @param int $accountId id dell'account
 * @param int $quantity quantità da aggiungere
 * @param mysqli $conn riferimento alla connessione al server da usare
 * @return int nuova quantità
 */
function addOneItem($itemId, $accountId, &$conn){
    $sqlQuantita = "SELECT Quantita FROM Inventario WHERE Proprietario = ? AND Oggetto = ?";
    $stmtQuantita = $conn->prepare($sqlQuantita);
    $stmtQuantita->bind_param('ii', $accountId, $itemId);
    $stmtQuantita->execute();
    $result = $stmtQuantita->get_result();
    $currentQuantityArr = $result->fetch_assoc();
    $stmtQuantita->close();
    $currentQuantity = ($currentQuantityArr === null)? 0 : $currentQuantityArr["Quantita"];

    $newQuantity = $currentQuantity + 1;

    if($newQuantity > 1){
        $updateSql = "UPDATE Inventario SET Quantita = Quantita + 1 WHERE Oggetto = ? AND Proprietario = ?;";
        $updateStmt = $conn->prepare($updateSql);
        $updateStmt->bind_param("ii", $itemId, $accountId);
        $updateStmt->execute();
        $updateStmt->close();
    }
    else{
        $insertSql = "INSERT INTO Inventario(Proprietario, Oggetto) VALUES (?, ?)";
        $insertStmt = $conn->prepare($insertSql);
        $insertStmt->bind_param("ii", $accountId, $itemId);
        $insertStmt->execute();
        $insertStmt->close();
    }

    return $newQuantity;
}

/**
 * Funzione che aggiorna la quantità di monete nel database
 * @param int $accountId id dell'account
 * @param int $price quantità di monete da aggiungere o togliere
 * @param mysqli $conn connessione da utilizzare per la connessione
 */
function updateCoins($accountId, $price, &$conn){
    $guadagno = $price;
    $updateCoinsSql = "UPDATE Account SET Monete = Monete + ? WHERE ID = ?";
    $coinsStmt = $conn->prepare($updateCoinsSql);
    $coinsStmt->bind_param("ii", $guadagno, $accountId);
    $coinsStmt->execute();
    return $guadagno;
}

/**
 * Funzione API che vende un oggetto dell'account
 * @param int $itemId id dell'oggetto
 * @param int $accountId id dell'account
 * @return array{errore: string|array{guadagno: int, rimosso: bool, successo: bool}} contiene informazioni sull'esito della richiesta
 */
function sellItem($itemId, $accountId){
    $conn = new mysqli(DB_HOST, DB_USER, DB_PWD, DATABASE);
    if($conn->connect_error){
        apiError('500');
    }
    $conn->begin_transaction();

    try{
        $sql = "SELECT I.Quantita, It.Costo
                FROM Inventario I JOIN Item It ON I.Oggetto = It.ID
                WHERE I.Oggetto = ? AND I.Proprietario = ?;";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ii", $itemId, $accountId);
        $stmt->execute();
        $result = $stmt->get_result();
        $item = $result->fetch_assoc();

        if(!$item)
            return ["errore" => "Item not found in inventory."];

        $newQuantity = removeOneItem($itemId, $accountId,$item["Quantita"], $conn);

        // Aggiorno le monete ottenute
        $guadagno = updateCoins($accountId, floor($item['Costo'] / 2), $conn);

        $conn->commit();
        $esito =  ["successo" => true, "guadagno" => $guadagno, "rimosso" => ($newQuantity === 0)];
    }
    catch(Exception $e){
        $conn->rollback();
        $esito =  ["errore" => "Fallimento: ". $e->getMessage()];
    }
    finally{
        $stmt->close();
        $conn->close();
    }

    return $esito;
}

/**
 * Funzione che dato un box restituisce un array contenente degli oggetti estratti casualmente secondo delle regole
 * @param array $box : deve avere due campi, id e nome, entrambi riferiti alla box
 * @param mixed $accountId: id dell'account
 * @param mysqli $conn connessione | Default : null e la inizializza
 * @return array{errore: string|array{successo: bool}} array ocntenente l'esito dell'operazione
 */
function openBox($box, $accountId, $conn = null){
    if(!isset($conn)){
        $conn = new mysqli(DB_HOST, DB_USER, DB_PWD, DATABASE);
        if($conn->connect_error){
            apiError('500');
        }
    }

    $sqlCount = "SELECT COUNT(*) AS conto FROM Inventario WHERE Proprietario = ?";
    $stmtCount = $conn->prepare($sqlCount);
    $stmtCount->bind_param('i', $accountId);
    $stmtCount->execute();
    $result = $stmtCount->get_result();
    $count= $result->fetch_assoc();
    $stmtCount->close();

    $added = ($box["nome"] === "Box Comune")? 3 : 6;
    if($count["conto"] + $added >= MAX_ITEMS){
        $conn->close();
        $esito = ["full" => true];
    }
    else{

        $conn->begin_transaction();

        try{
            $sqlGetItems = "SELECT ID, Tipologia
                            FROM Item
                            WHERE Tipologia != 'box'
                            ORDER BY Tipologia";

            $stmtGetItems = $conn->prepare($sqlGetItems);
            $stmtGetItems->execute();

            $allItems = $stmtGetItems->get_result();

            $weapons = [];
            $armors = [];
            $potions = [];

            while($item = $allItems->fetch_assoc()){
                switch($item["Tipologia"]){
                    case 'arma':
                        $weapons[] = $item["ID"];
                        break;
                    case 'armatura':
                        $armors[] = $item["ID"];
                        break;
                    case 'pozione':
                        $potions[] = $item["ID"];
                        break;
                }
            }

            $output = [];
            /* Box comuni:
            * - 5-10 monete
            * - 2 oggetti tra armi e armature
            * - 1 pozione
            */
            if($box["nome"] === "Box Comune"){
                $output["coins"] = mt_rand(MIN_COIN_COMMON, MAX_COIN_COMMON);
                $output[] = $potions[array_rand($potions)];

                $weapAndArms = array_merge($weapons, $armors);
                $output[] = $weapAndArms[array_rand($weapAndArms)];
                $output[] = $weapAndArms[array_rand($weapAndArms)];
            }
            /* Box Rare:
            * - 15-20 monete
            * - 2 armi
            * - 2 armature
            * - 2 pozioni
            */
            else if($box["nome"] === "Box Rara"){
                $output["coins"] = mt_rand(MIN_COIN_RARE, MAX_COIN_RARE);
                $output[] = $weapons[array_rand($weapons)];
                $output[] = $weapons[array_rand($weapons)];
                $output[] = $armors[array_rand($armors)];
                $output[] = $armors[array_rand($armors)];
                $output[] = $potions[array_rand($potions)];
                $output[] = $potions[array_rand($potions)];
            }

            $itemsIDs = [];
            foreach($output as $key => $itemId){
                if(is_numeric($key)){
                    if(addOneItem($itemId, $accountId, $conn))
                        $itemsIDs[] = $itemId;
                }
            }

            $newBoxQuantity = removeOneItem($box["id"], $accountId, null, $conn);

            $esito = ($conn->commit())?
                    ["successo" => true, "guadagno" => $output["coins"], "rimosso" => ($newBoxQuantity === 0), "itemsID" => $itemsIDs] :
                    ["errore" => "Fallimento nel commit"];
        }
        catch(Exception $e){
            $conn->rollback();
            $esito = ["errore" => "Fallimento" . $e->getMessage()];
        }
        finally{
            $stmtGetItems->close();
            $conn->close();
        }
    }

    return $esito;
}

?>