<?php
require_once "../methods.php";

session_start();

if(!isset($_SESSION["account"])){
    apiError(401);
}

$account = unserialize($_SESSION['account']);
$id = $account->getId();

$itemId = $_POST['itemId'];
$esito = sellItem($itemId, $id);

if(isset($esito["successo"]) && $esito["successo"]){
    $account->modifyCoins(false, $esito["guadagno"]);
    $_SESSION["account"] = serialize($account);
}

header('Content-Type: application/json');
echo json_encode($esito);

?>