<?php
require_once "./../includes/methods.php";
session_start();

if(!isset($_SESSION['account'])){
	apiError(401);
}

$account = unserialize($_SESSION['account']);
$id = $account->getId();

$itemId = $_POST["itemId"];
$esito = buyItem($itemId, $id);

if(isset($esito["successo"]) && $esito["successo"]){
	$account->modifyCoins(true, $esito["spesa"]);
	$_SESSION['account'] = serialize($account);
}

header('Content-Type: application/json');
echo json_encode($esito);


?>