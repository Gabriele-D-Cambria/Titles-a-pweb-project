<?php

require_once "definitions.php";

function setPath(){
    $currentPath = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    
    $folder = "cambria_672642/";
    
    $position = strpos($currentPath, needle: $folder);

    $output = substr($currentPath, 0, $position + strlen($folder)) . '/';

    // FIXME
    return $output;
}



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

function pageError($errorCode){
    header("Location: error page.php/?error_code=". $errorCode);
    exit();
}

function apiError($errorCode){
    http_response_code($errorCode);
    echo json_encode(["errore" => $errorCode]);
    exit();
}

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
 * @return 
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

    $inventory = [];

    while($row = $result->fetch_assoc()){
        $inventory[] = $row;
    }

    return $inventory;
}

function sellItem($itemId, $accountId, $conn = null){
    if(!isset($conn)){
        $conn = new mysqli(DB_HOST, DB_USER, DB_PWD, DATABASE);
        if($conn->connect_error){
            pageError('500');
        }
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

        if(!$item){
            return ["errore" => "Item not found in inventory."];
        }

        // Diminuisco la quantità o eventualmente rimuovo
        $currentQuantity = $item['Quantita'];

        $newQuantity = $currentQuantity - 1;
        if($newQuantity > 0){
            $updateSql = "UPDATE Inventario SET Quantita = ? WHERE Oggetto = ? AND Proprietario = ?;";
            $updateStmt = $conn->prepare($updateSql);
            $updateStmt->bind_param("iii", $newQuantity, $itemId, $accountId);
            $updateStmt->execute();
        }
        else{
            $deleteSql = "DELETE FROM Inventario WHERE Oggetto = ? AND Proprietario = ?";
            $deleteStmt = $conn->prepare($deleteSql);
            $deleteStmt->bind_param("ii", $itemId, $accountId);
            $deleteStmt->execute();
        }

        // Aggiorno le monete ottenute
        $guadagno = floor($item['Costo'] / 2);
        $updateCoinsSql = "UPDATE Account SET Monete = Monete + ? WHERE ID = ?";
        $coinsStmt = $conn->prepare($updateCoinsSql);
        $coinsStmt->bind_param("ii", $guadagno, $accountId);
        $coinsStmt->execute();

        $conn->commit();
        return ["successo" => true, "guadagno" => $guadagno, "rimosso" => ($newQuantity === 0)];
    } 
    catch(Exception $e){
        $conn->rollback();
        return ["errore" => "Fallimento: ". $e->getMessage()];
    }
    finally{
        $stmt->close();
        $conn->close();
    }
}

?>